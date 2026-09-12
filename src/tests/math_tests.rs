//! Unit tests matching src/tests/math_tests.rs hierarchy specification

#[cfg(test)]
mod integration_tests {
    use crate::engine::math_fsm::MathSession;
    use crate::engine::reading::SyllableParser;

    #[test]
    fn test_initial_session_state() {
        let session = MathSession::new(42, 1);
        assert_eq!(session.get_tier(), 1);
        assert_eq!(session.get_streak(), 0);
        assert_eq!(session.get_total_answered(), 0);
        assert_eq!(session.get_total_correct(), 0);
    }

    #[test]
    fn test_spanish_syllables() {
        assert_eq!(SyllableParser::split_word("elefante"), vec!["e", "le", "fan", "te"]);
    }
}
