//! Content SSOT enforcement tests.
//! Editorial content lives in `www/data/*.json`; algorithms live in Rust.
//! These tests fail closed: any new/edited reto, capítulo o templo que
//! rompa el esquema o contradiga al silabeo RAE rompe el build.

use kidslearn_wasm::engine::reading::SyllableParser;
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
struct ReadingChallenge {
    #[serde(rename = "type")]
    kind: String,
    answer: String,
    options: Vec<String>,
    #[serde(default, rename = "displayHtml")]
    display_html: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ReadingBank {
    levels: HashMap<String, Vec<ReadingChallenge>>,
}

#[derive(Debug, Deserialize)]
struct StoryChapter {
    id: u32,
    title: String,
    paragraphs: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct StoryBook {
    chapters: Vec<StoryChapter>,
}

#[derive(Debug, Deserialize)]
struct PortalRiddle {
    options: Vec<u32>,
    #[serde(rename = "correctAnswer")]
    correct_answer: Option<u32>,
    prompt: Option<String>,
}

#[derive(Debug, Deserialize)]
struct TempleLevel {
    id: u32,
    name: String,
    #[serde(rename = "microCuento")]
    micro_cuento: Vec<String>,
    #[serde(rename = "portalRiddle")]
    portal_riddle: PortalRiddle,
}

#[derive(Debug, Deserialize)]
struct TempleCatalog {
    levels: Vec<TempleLevel>,
}

#[test]
fn test_reading_bank_schema_and_count() {
    let raw = include_str!("../www/data/reading-challenges.json");
    let bank: ReadingBank = serde_json::from_str(raw).expect("reading-challenges.json inválido");
    assert_eq!(bank.levels.len(), 5, "el banco debe cubrir 5 niveles");
    let total: usize = bank.levels.values().map(|v| v.len()).sum();
    assert_eq!(total, 130, "el banco debe tener 130 retos, hay {}", total);

    for (lvl, items) in &bank.levels {
        for ch in items {
            assert!(!ch.kind.is_empty(), "reto sin tipo en nivel {}", lvl);
            assert!(!ch.answer.is_empty(), "reto sin respuesta en nivel {}", lvl);
            assert!(
                ch.options.contains(&ch.answer),
                "nivel {}: la respuesta '{}' no está en opciones {:?}",
                lvl,
                ch.answer,
                ch.options
            );
            assert_eq!(ch.options.len(), 4, "nivel {}: '{}' debe tener 4 opciones", lvl, ch.answer);
        }
    }
}

#[test]
fn test_curated_splits_match_rae_parser() {
    // El contenido curado manda visualmente, pero no puede contradecir al
    // silabeo RAE del motor: cada segmento LU-NA debe existir en el parser.
    let raw = include_str!("../www/data/reading-challenges.json");
    let bank: ReadingBank = serde_json::from_str(raw).expect("reading-challenges.json inválido");

    let mut checked = 0u32;
    let mut mismatches = Vec::new();
    for (lvl, items) in &bank.levels {
        for ch in items {
            if ch.kind != "syllables" {
                continue;
            }
            let html = ch.display_html.as_deref().unwrap_or("");
            let curated = html.matches("syl syl-").count() as u32;
            if curated == 0 {
                continue;
            }
            let rae = SyllableParser::split_word(&ch.answer).len() as u32;
            checked += 1;
            if rae != curated {
                mismatches.push(format!("N{} '{}': curado={} vs RAE={}", lvl, ch.answer, curated, rae));
            }
        }
    }
    assert!(checked > 0, "ningún reto silábico verificado");
    assert!(
        mismatches.is_empty(),
        "{} segmentaciones curadas contradicen al parser RAE:\n  - {}",
        mismatches.len(),
        mismatches.join("\n  - ")
    );
}

#[test]
fn test_storybook_schema_and_count() {
    let raw = include_str!("../www/data/story-chapters.json");
    let book: StoryBook = serde_json::from_str(raw).expect("story-chapters.json inválido");
    assert_eq!(book.chapters.len(), 8, "el libro debe tener 8 capítulos");
    for ch in &book.chapters {
        assert!(!ch.title.is_empty(), "capítulo {} sin título", ch.id);
        assert!(!ch.paragraphs.is_empty(), "capítulo {} sin párrafos", ch.id);
    }
}

#[test]
fn test_temple_catalog_schema() {
    let raw = include_str!("../www/data/levels.json");
    let catalog: TempleCatalog = serde_json::from_str(raw).expect("levels.json inválido");
    assert_eq!(catalog.levels.len(), 10, "la campaña debe tener 10 templos");
    for lvl in &catalog.levels {
        assert!(!lvl.name.is_empty(), "templo {} sin nombre", lvl.id);
        assert_eq!(
            lvl.micro_cuento.len(),
            4,
            "templo {}: el micro-cuento debe tener 4 versos",
            lvl.id
        );
        assert!(
            lvl.portal_riddle.prompt.as_deref().unwrap_or("").len() > 10,
            "templo {}: acertijo sin prompt",
            lvl.id
        );
        assert_eq!(
            lvl.portal_riddle.options.len(),
            4,
            "templo {}: el acertijo debe tener 4 opciones",
            lvl.id
        );
        let ans = lvl.portal_riddle.correct_answer.expect("acertijo sin correctAnswer");
        assert!(
            lvl.portal_riddle.options.contains(&ans),
            "templo {}: respuesta {} fuera de opciones",
            lvl.id,
            ans
        );
    }
}
