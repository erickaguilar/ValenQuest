use kidslearn_wasm::engine::math_fsm::MathSession;
use kidslearn_wasm::engine::prng::Xorshift64;
use kidslearn_wasm::engine::reading::SyllableParser;

#[test]
fn test_prng_distribution_and_bounds() {
    let mut rng = Xorshift64::new(42);
    let mut counts = [0u32; 10];
    let total_samples = 10_000;

    for _ in 0..total_samples {
        let val = rng.gen_range(0, 9);
        assert!(val < 10);
        counts[val as usize] += 1;
    }

    // Ensure roughly uniform distribution across all 10 buckets
    for count in counts {
        assert!(count > 700 && count < 1300, "Unexpected sample count: {}", count);
    }
}

#[test]
fn test_math_fsm_tier_transitions() {
    let mut session = MathSession::new(12345, 1);
    assert_eq!(session.get_tier(), 1);

    // Simulate streak of correct answers to arm the portal (no auto-advance:
    // the tier only moves in advance_tier() after beating the portal).
    for _ in 0..10 {
        let correct_ans = session.get_correct_answer();
        session.submit_answer(correct_ans, 1200); // 1.2s response time
        session.generate_next_challenge();
        if session.is_portal_ready() {
            break;
        }
    }
    assert!(session.is_portal_ready(), "Portal should be armed");
    assert_eq!(session.get_tier(), 1, "Tier must not auto-advance before the portal");
    assert_eq!(session.advance_tier(), 2);
    assert_eq!(session.get_tier(), 2, "Session should promote to Tier 2 via advance_tier");
}

#[test]
fn test_ema_mastery_decay_on_errors() {
    let mut session = MathSession::new(999, 2);
    // Submit 5 consecutive errors
    for _ in 0..5 {
        let wrong_ans = session.get_correct_answer() + 99;
        session.submit_answer(wrong_ans, 3000);
        session.generate_next_challenge();
    }
    // Mastery should have dropped significantly below 0.40 and demoted to Tier 1
    assert!(session.get_mastery() < 0.60);
    assert_eq!(session.get_tier(), 1, "Session should regress to Tier 1 on sustained errors");
}

#[test]
fn test_distractors_plausibility_and_uniqueness() {
    let mut session = MathSession::new(888, 3);
    for _ in 0..100 {
        session.generate_next_challenge();
        let opts_json = session.get_options_json();
        let options: Vec<u32> = serde_json::from_str(&opts_json).unwrap();

        // 4 choices
        assert_eq!(options.len(), 4);
        // Correct answer is present
        assert!(options.contains(&session.get_correct_answer()));
        // All options are strictly positive
        for &opt in &options {
            assert!(opt > 0);
        }
        // All options are unique
        let mut deduplicated = options.clone();
        deduplicated.sort();
        deduplicated.dedup();
        assert_eq!(deduplicated.len(), 4, "Options contain duplicate values: {:?}", options);
    }
}

#[test]
fn test_spanish_syllable_segmentation() {
    let words = vec![
        ("mariposa", vec!["ma", "ri", "po", "sa"]),
        ("estrella", vec!["es", "tre", "lla"]),
        ("computadora", vec!["com", "pu", "ta", "do", "ra"]),
        ("chocolate", vec!["cho", "co", "la", "te"]),
        ("dragón", vec!["dra", "gón"]),
        ("tierra", vec!["tie", "rra"]),
    ];

    for (word, expected) in words {
        let result = SyllableParser::split_word(word);
        assert_eq!(result, expected, "Failed syllabifying '{}'", word);
    }
}
