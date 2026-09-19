//! Spanish Syllabification and RSVP Reading Fluency Engine
//! Provides syllable breakdown, syllable highlighting for early readers,
//! and RSVP (Rapid Serial Visual Presentation) metrics.
//!
//! Nota de contenido: este motor es ALGORITMO, no catálogo. Los textos
//! (retos de lectura, fábulas, micro-cuentos) viven en `www/data/*.json`
//! y la UI los verifica/mide con este motor (`parse_text_syllables`,
//! `calculate_wpm`).

use wasm_bindgen::prelude::*;
use serde::Serialize;

/// Represents a single word segmented into phonological syllables
#[derive(Debug, Clone, Serialize)]
pub struct WordSyllables {
    pub raw: String,
    pub clean: String,
    pub syllables: Vec<String>,
}

/// Spanish Syllable Parser following RAE phonotactic rules
pub struct SyllableParser;

impl SyllableParser {
    #[inline]
    fn is_vowel(c: char) -> bool {
        matches!(c, 'a' | 'e' | 'i' | 'o' | 'u' | 'á' | 'é' | 'í' | 'ó' | 'ú' | 'ü' | 'A' | 'E' | 'I' | 'O' | 'U' | 'Á' | 'É' | 'Í' | 'Ó' | 'Ú' | 'Ü')
    }

    #[inline]
    fn is_strong_vowel(c: char) -> bool {
        matches!(c, 'a' | 'e' | 'o' | 'á' | 'é' | 'ó' | 'A' | 'E' | 'O' | 'Á' | 'É' | 'Ó')
    }

    #[inline]
    fn is_accented_weak(c: char) -> bool {
        matches!(c, 'í' | 'ú' | 'Í' | 'Ú')
    }

    /// Checks whether two adjacent consonants form an inseparable onset cluster
    fn is_inseparable_cluster(c1: char, c2: char) -> bool {
        let l1 = c1.to_ascii_lowercase();
        let l2 = c2.to_ascii_lowercase();

        // Digraphs: ch, ll, rr
        if (l1 == 'c' && l2 == 'h') || (l1 == 'l' && l2 == 'l') || (l1 == 'r' && l2 == 'r') {
            return true;
        }

        // Plosive/Fricative + Liquid: [b, c, d, f, g, p, t] + r / [b, c, f, g, p, t] + l
        let is_liquid_r = l2 == 'r' && matches!(l1, 'b' | 'c' | 'd' | 'f' | 'g' | 'p' | 't');
        let is_liquid_l = l2 == 'l' && matches!(l1, 'b' | 'c' | 'f' | 'g' | 'p' | 't');

        is_liquid_r || is_liquid_l
    }

    /// Splits a clean single Spanish word into its constituent syllables
    pub fn split_word(word: &str) -> Vec<String> {
        let chars: Vec<char> = word.chars().collect();
        let len = chars.len();

        if len <= 2 {
            return vec![word.to_string()];
        }

        // Find positions of vowels
        let mut vowel_indices = Vec::new();
        for (i, &c) in chars.iter().enumerate() {
            if Self::is_vowel(c) {
                vowel_indices.push(i);
            }
        }

        if vowel_indices.len() <= 1 {
            return vec![word.to_string()];
        }

        let mut cut_points = Vec::new();

        // Analyze between successive vowel nuclei
        for k in 0..(vowel_indices.len() - 1) {
            let v1 = vowel_indices[k];
            let v2 = vowel_indices[k + 1];
            let consonant_count = v2 - v1 - 1;

            if consonant_count == 0 {
                // Adjacent vowels: Hiatus check
                let c1 = chars[v1];
                let c2 = chars[v2];
                // Two strong vowels always separate (hiato simple: te-a-tro, ca-os)
                // Or strong + accented weak (hiato acentual: ma-íz, tí-o)
                let is_hiatus = (Self::is_strong_vowel(c1) && Self::is_strong_vowel(c2))
                    || Self::is_accented_weak(c1)
                    || Self::is_accented_weak(c2);

                if is_hiatus {
                    cut_points.push(v2);
                }
            } else if consonant_count == 1 {
                // V - C - V => V / C V (e.g. ca - sa)
                cut_points.push(v1 + 1);
            } else if consonant_count == 2 {
                // V - C1 C2 - V
                let c1 = chars[v1 + 1];
                let c2 = chars[v1 + 2];
                if Self::is_inseparable_cluster(c1, c2) {
                    // V / C1 C2 V (e.g. li - bro)
                    cut_points.push(v1 + 1);
                } else {
                    // V C1 / C2 V (e.g. ár - bol, can - to)
                    cut_points.push(v1 + 2);
                }
            } else if consonant_count == 3 {
                // V - C1 C2 C3 - V (e.g. es - tre - lla, ins - pi - rar)
                let c2 = chars[v1 + 2];
                let c3 = chars[v1 + 3];
                if Self::is_inseparable_cluster(c2, c3) {
                    // V C1 / C2 C3 V
                    cut_points.push(v1 + 2);
                } else {
                    cut_points.push(v1 + 3);
                }
            } else {
                // 4 consonants: V C1 C2 / C3 C4 V (e.g. cons - truir)
                cut_points.push(v1 + 3);
            }
        }

        // Build syllable strings
        let mut syllables = Vec::new();
        let mut last_idx = 0;
        for &cp in &cut_points {
            if cp > last_idx && cp <= len {
                syllables.push(chars[last_idx..cp].iter().collect::<String>());
                last_idx = cp;
            }
        }
        if last_idx < len {
            syllables.push(chars[last_idx..len].iter().collect::<String>());
        }

        syllables
    }
}

/// Reading session handle exported to WASM (stateless: pure algorithms).
#[wasm_bindgen]
pub struct ReadingSession;

#[wasm_bindgen]
impl ReadingSession {
    #[wasm_bindgen(constructor)]
    pub fn new() -> ReadingSession {
        ReadingSession
    }

    /// Syllabifies an entire text and returns a JSON list of WordSyllables
    pub fn parse_text_syllables(&self, text: &str) -> String {
        let words: Vec<&str> = text.split_whitespace().collect();
        let mut result = Vec::new();

        for raw_word in words {
            // Strip common punctuation for clean syllabification
            let clean: String = raw_word
                .chars()
                .filter(|c| c.is_alphabetic() || *c == 'á' || *c == 'é' || *c == 'í' || *c == 'ó' || *c == 'ú' || *c == 'ñ' || *c == 'ü')
                .collect();

            let syllables = if clean.is_empty() {
                vec![raw_word.to_string()]
            } else {
                SyllableParser::split_word(&clean)
            };

            result.push(WordSyllables {
                raw: raw_word.to_string(),
                clean,
                syllables,
            });
        }

        serde_json::to_string(&result).unwrap_or_else(|_| "[]".to_string())
    }

    /// Calculates Words Per Minute (WPM)
    pub fn calculate_wpm(word_count: u32, elapsed_ms: u32) -> u32 {
        if elapsed_ms == 0 {
            return 0;
        }
        let minutes = (elapsed_ms as f64) / 60_000.0;
        ((word_count as f64) / minutes).round() as u32
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_syllable_splitting_basic() {
        assert_eq!(SyllableParser::split_word("casa"), vec!["ca", "sa"]);
        assert_eq!(SyllableParser::split_word("pelota"), vec!["pe", "lo", "ta"]);
        assert_eq!(SyllableParser::split_word("mariposa"), vec!["ma", "ri", "po", "sa"]);
    }

    #[test]
    fn test_syllable_inseparable_clusters() {
        assert_eq!(SyllableParser::split_word("libro"), vec!["li", "bro"]);
        assert_eq!(SyllableParser::split_word("estrella"), vec!["es", "tre", "lla"]);
        assert_eq!(SyllableParser::split_word("perro"), vec!["pe", "rro"]);
    }

    #[test]
    fn test_syllable_hiatus() {
        assert_eq!(SyllableParser::split_word("teatro"), vec!["te", "a", "tro"]);
    }

    #[test]
    fn test_wpm_calculation() {
        // 100 words in 60 seconds (60,000 ms) = 100 WPM
        assert_eq!(ReadingSession::calculate_wpm(100, 60_000), 100);
        // 50 words in 30 seconds (30,000 ms) = 100 WPM
        assert_eq!(ReadingSession::calculate_wpm(50, 30_000), 100);
    }
}
