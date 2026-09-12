//! Math FSM and Adaptive EMA Engine
//! Implements a 6-tier curricular progression state machine with Exponential
//! Moving Average (EMA) mastery calculation and distractor generation.

use wasm_bindgen::prelude::*;
use serde::Serialize;
use crate::engine::prng::Xorshift64;

/// 6 Curricular Tiers for Primary Education Math
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CurricularTier {
    /// Tier 1: Sumas sin acarreo (1..9, total <= 10)
    Tier1SumNoCarry = 1,
    /// Tier 2: Sumas con acarreo (total hasta 25)
    Tier2SumCarry = 2,
    /// Tier 3: Restas sin llevada (resultado >= 0, minuendo <= 20)
    Tier3SubNoBorrow = 3,
    /// Tier 4: Restas con llevada (minuendo 11..30)
    Tier4SubBorrow = 4,
    /// Tier 5: Multiplicaciones introductorias (tablas del 1 al 5)
    Tier5MultIntro = 5,
    /// Tier 6: Multiplicaciones completas de un dígito (tablas del 6 al 9)
    Tier6MultAdvanced = 6,
}

impl CurricularTier {
    pub fn from_u8(val: u8) -> Self {
        match val {
            1 => CurricularTier::Tier1SumNoCarry,
            2 => CurricularTier::Tier2SumCarry,
            3 => CurricularTier::Tier3SubNoBorrow,
            4 => CurricularTier::Tier4SubBorrow,
            5 => CurricularTier::Tier5MultIntro,
            6 => CurricularTier::Tier6MultAdvanced,
            _ => CurricularTier::Tier1SumNoCarry,
        }
    }

    pub fn to_u8(self) -> u8 {
        self as u8
    }

    pub fn name(self) -> &'static str {
        match self {
            CurricularTier::Tier1SumNoCarry => "Nivel 1: Sumas Básicas",
            CurricularTier::Tier2SumCarry => "Nivel 2: Sumas con Acarreo",
            CurricularTier::Tier3SubNoBorrow => "Nivel 3: Restas Simples",
            CurricularTier::Tier4SubBorrow => "Nivel 4: Restas con Llevada",
            CurricularTier::Tier5MultIntro => "Nivel 5: Tablas del 1 al 5",
            CurricularTier::Tier6MultAdvanced => "Nivel 6: Multiplicación Maestra",
        }
    }

    pub fn next(self) -> Self {
        match self {
            CurricularTier::Tier1SumNoCarry => CurricularTier::Tier2SumCarry,
            CurricularTier::Tier2SumCarry => CurricularTier::Tier3SubNoBorrow,
            CurricularTier::Tier3SubNoBorrow => CurricularTier::Tier4SubBorrow,
            CurricularTier::Tier4SubBorrow => CurricularTier::Tier5MultIntro,
            CurricularTier::Tier5MultIntro => CurricularTier::Tier6MultAdvanced,
            CurricularTier::Tier6MultAdvanced => CurricularTier::Tier6MultAdvanced,
        }
    }

    pub fn prev(self) -> Self {
        match self {
            CurricularTier::Tier1SumNoCarry => CurricularTier::Tier1SumNoCarry,
            CurricularTier::Tier2SumCarry => CurricularTier::Tier1SumNoCarry,
            CurricularTier::Tier3SubNoBorrow => CurricularTier::Tier2SumCarry,
            CurricularTier::Tier4SubBorrow => CurricularTier::Tier3SubNoBorrow,
            CurricularTier::Tier5MultIntro => CurricularTier::Tier4SubBorrow,
            CurricularTier::Tier6MultAdvanced => CurricularTier::Tier5MultIntro,
        }
    }
}

/// JSON payload structure exposed to JavaScript
#[derive(Serialize)]
pub struct MathChallengeState {
    pub tier: u8,
    pub tier_name: String,
    pub operand1: u32,
    pub operand2: u32,
    pub operator: String,
    pub answer: u32,
    pub options: Vec<u32>,
    pub mastery: f32,
    pub mastery_pct: u32,
    pub streak: u32,
    pub highest_streak: u32,
    pub total_answered: u32,
    pub total_correct: u32,
    pub last_was_correct: bool,
    pub tier_changed: i8, // 1 = level up, -1 = level down, 0 = unchanged
}

/// Main adaptive math game session
#[wasm_bindgen]
pub struct MathSession {
    prng: Xorshift64,
    tier: CurricularTier,
    mastery: f32, // M_k in [0.0, 1.0]
    streak: u32,
    highest_streak: u32,
    consecutive_errors: u32,
    total_answered: u32,
    total_correct: u32,
    current_op1: u32,
    current_op2: u32,
    current_operator: char,
    current_answer: u32,
    current_options: Vec<u32>,
    last_was_correct: bool,
    tier_changed: i8,
}

#[wasm_bindgen]
impl MathSession {
    /// Creates a new math session with deterministic PRNG seed and initial tier
    #[wasm_bindgen(constructor)]
    pub fn new(seed: u64, initial_tier: u8) -> MathSession {
        let mut session = Self {
            prng: Xorshift64::new(seed),
            tier: CurricularTier::from_u8(initial_tier),
            mastery: 0.50, // Initial baseline
            streak: 0,
            highest_streak: 0,
            consecutive_errors: 0,
            total_answered: 0,
            total_correct: 0,
            current_op1: 1,
            current_op2: 1,
            current_operator: '+',
            current_answer: 2,
            current_options: vec![2, 3, 4, 5],
            last_was_correct: true,
            tier_changed: 0,
        };
        session.generate_next_challenge();
        session
    }

    /// Resets the session with a new seed and starting tier
    pub fn reset(&mut self, seed: u64, initial_tier: u8) {
        self.prng = Xorshift64::new(seed);
        self.tier = CurricularTier::from_u8(initial_tier);
        self.mastery = 0.50;
        self.streak = 0;
        self.highest_streak = 0;
        self.consecutive_errors = 0;
        self.total_answered = 0;
        self.total_correct = 0;
        self.last_was_correct = true;
        self.tier_changed = 0;
        self.generate_next_challenge();
    }

    /// Generates a new challenge appropriate for the current tier
    pub fn generate_next_challenge(&mut self) {
        self.tier_changed = 0;

        match self.tier {
            CurricularTier::Tier1SumNoCarry => {
                // Sum without carry: a + b <= 10, a >= 1, b >= 1
                let op1 = self.prng.gen_range(1, 8);
                let max_op2 = 10 - op1;
                let op2 = self.prng.gen_range(1, max_op2.max(1));
                self.current_op1 = op1;
                self.current_op2 = op2;
                self.current_operator = '+';
                self.current_answer = op1 + op2;
            }
            CurricularTier::Tier2SumCarry => {
                // Sum with carry: sum > 10, up to 25
                let op1 = self.prng.gen_range(4, 14);
                let min_op2 = (11u32).saturating_sub(op1).max(2);
                let op2 = self.prng.gen_range(min_op2, 12);
                self.current_op1 = op1;
                self.current_op2 = op2;
                self.current_operator = '+';
                self.current_answer = op1 + op2;
            }
            CurricularTier::Tier3SubNoBorrow => {
                // Subtraction without borrow: strictly positive result >= 1
                // e.g. 18 - 5 = 13 (8 >= 5), or 9 - 4 = 5
                let mode = self.prng.gen_range(0, 1);
                if mode == 0 {
                    // Single digit: a in 2..=10, b in 1..=(a - 1)
                    let op1 = self.prng.gen_range(2, 10);
                    let op2 = self.prng.gen_range(1, op1 - 1);
                    self.current_op1 = op1;
                    self.current_op2 = op2;
                } else {
                    // Tens without borrow: e.g. 17 - 4 = 13, 19 - 6 = 13
                    let tens_digit = 10;
                    let unit1 = self.prng.gen_range(2, 9);
                    let unit2 = self.prng.gen_range(1, unit1 - 1);
                    self.current_op1 = tens_digit + unit1;
                    self.current_op2 = unit2;
                }
                self.current_operator = '-';
                self.current_answer = self.current_op1 - self.current_op2;
            }
            CurricularTier::Tier4SubBorrow => {
                // Subtraction with borrow: minuendo 11..30, units borrow needed
                // e.g. 23 - 7 (3 < 7), 14 - 8 (4 < 8)
                let unit1 = self.prng.gen_range(0, 5); // 0..=5
                let unit2 = self.prng.gen_range(unit1 + 2, 9); // unit2 > unit1
                let tens = self.prng.gen_range(1, 2) * 10;
                let op1 = tens + unit1;
                let op2 = unit2;
                self.current_op1 = op1;
                self.current_op2 = op2;
                self.current_operator = '-';
                self.current_answer = op1.saturating_sub(op2);
            }
            CurricularTier::Tier5MultIntro => {
                // Intro multiplication: tables 1 through 5
                let op1 = self.prng.gen_range(1, 5);
                let op2 = self.prng.gen_range(1, 10);
                self.current_op1 = op1;
                self.current_op2 = op2;
                self.current_operator = '×';
                self.current_answer = op1 * op2;
            }
            CurricularTier::Tier6MultAdvanced => {
                // Complete single-digit multiplication: tables 6 through 9 (or up to 10)
                let op1 = self.prng.gen_range(6, 9);
                let op2 = self.prng.gen_range(2, 10);
                self.current_op1 = op1;
                self.current_op2 = op2;
                self.current_operator = '×';
                self.current_answer = op1 * op2;
            }
        }

        self.generate_distractors();
    }

    /// Generates 3 plausible distractors + correct answer, shuffled
    fn generate_distractors(&mut self) {
        let answer = self.current_answer;
        let mut candidates = Vec::with_capacity(6);

        // Plausible distractor 1: off-by-one (answer + 1 or answer - 1)
        if answer > 1 {
            candidates.push(answer - 1);
        }
        candidates.push(answer + 1);

        // Plausible distractor 2: off-by-ten or off-by-two
        if answer > 2 {
            candidates.push(answer - 2);
        }
        candidates.push(answer + 2);
        if answer > 10 {
            candidates.push(answer - 10);
        }
        candidates.push(answer + 10);

        // Plausible distractor 3: alternate operator effect
        if self.current_operator == '+' {
            if self.current_op1 >= self.current_op2 && self.current_op1 - self.current_op2 > 0 {
                candidates.push(self.current_op1 - self.current_op2);
            }
            let mult = self.current_op1 * self.current_op2;
            if mult > 0 && mult < 100 {
                candidates.push(mult);
            }
        } else if self.current_operator == '-' {
            candidates.push(self.current_op1 + self.current_op2);
        } else if self.current_operator == '×' {
            candidates.push(self.current_op1 + self.current_op2);
            // Neighboring multiple
            if answer > self.current_op1 {
                candidates.push(answer - self.current_op1);
            }
            candidates.push(answer + self.current_op1);
        }

        // Filter: must be positive, distinct from answer, and unique
        let mut distractors: Vec<u32> = Vec::with_capacity(3);
        self.prng.shuffle(&mut candidates);

        for cand in candidates {
            if cand > 0 && cand != answer && !distractors.contains(&cand) {
                distractors.push(cand);
                if distractors.len() == 3 {
                    break;
                }
            }
        }

        // Fallback if not enough unique candidates
        let mut offset = 3u32;
        while distractors.len() < 3 {
            let alt = if self.prng.gen_range(0, 1) == 0 {
                answer + offset
            } else if answer > offset {
                answer - offset
            } else {
                answer + offset + 2
            };
            if alt > 0 && alt != answer && !distractors.contains(&alt) {
                distractors.push(alt);
            }
            offset += 1;
        }

        let mut options = vec![answer, distractors[0], distractors[1], distractors[2]];
        self.prng.shuffle(&mut options);
        self.current_options = options;
    }

    /// Evaluates user answer and updates EMA mastery, streaks, and tier FSM.
    /// Returns true if answer was correct.
    pub fn submit_answer(&mut self, user_answer: u32, elapsed_ms: u32) -> bool {
        self.total_answered += 1;
        let is_correct = user_answer == self.current_answer;
        self.last_was_correct = is_correct;

        // Calculate Performance Metric P in [0.0, 1.0]
        // Factoring both correctness and response latency for pedagogy
        let p: f32 = if is_correct {
            self.total_correct += 1;
            self.streak += 1;
            self.consecutive_errors = 0;
            if self.streak > self.highest_streak {
                self.highest_streak = self.streak;
            }

            if elapsed_ms <= 4000 {
                1.0 // Agile, solid mastery
            } else if elapsed_ms <= 8000 {
                0.85 // Thoughtful, correct
            } else {
                0.70 // Hesitant, but correct
            }
        } else {
            self.streak = 0;
            self.consecutive_errors += 1;
            0.0 // Incorrect
        };

        // Exponential Moving Average (EMA): M_k = 0.75 * M_{k-1} + 0.25 * P
        self.mastery = (0.75 * self.mastery + 0.25 * p).clamp(0.0, 1.0);

        // FSM Tier Progression / Regression Rules
        self.tier_changed = 0;
        let old_tier = self.tier;

        // Advancement condition: High mastery (>= 0.82) with sustained streak (>= 3)
        if self.mastery >= 0.82 && self.streak >= 3 && self.tier != CurricularTier::Tier6MultAdvanced {
            self.tier = self.tier.next();
            self.tier_changed = 1;
            // Calibrate baseline mastery for the new challenging tier
            self.mastery = 0.65;
        }
        // Regression condition: Low mastery (< 0.38) and multiple errors, not already on Tier 1
        else if self.mastery < 0.38 && self.consecutive_errors >= 2 && self.tier != CurricularTier::Tier1SumNoCarry {
            self.tier = self.tier.prev();
            self.tier_changed = -1;
            // Provide supportive baseline to rebuild confidence
            self.mastery = 0.55;
            self.consecutive_errors = 0;
        }

        let _ = old_tier;
        is_correct
    }

    // =========================================================================
    // Getters for JavaScript / WASM interoperability
    // =========================================================================

    pub fn get_tier(&self) -> u8 {
        self.tier.to_u8()
    }

    pub fn get_tier_name(&self) -> String {
        self.tier.name().to_string()
    }

    pub fn get_mastery(&self) -> f32 {
        self.mastery
    }

    pub fn get_mastery_percentage(&self) -> u32 {
        (self.mastery * 100.0).round() as u32
    }

    pub fn get_streak(&self) -> u32 {
        self.streak
    }

    pub fn get_highest_streak(&self) -> u32 {
        self.highest_streak
    }

    pub fn get_total_answered(&self) -> u32 {
        self.total_answered
    }

    pub fn get_total_correct(&self) -> u32 {
        self.total_correct
    }

    pub fn get_operand1(&self) -> u32 {
        self.current_op1
    }

    pub fn get_operand2(&self) -> u32 {
        self.current_op2
    }

    pub fn get_operator(&self) -> String {
        self.current_operator.to_string()
    }

    pub fn get_correct_answer(&self) -> u32 {
        self.current_answer
    }

    pub fn get_last_correct(&self) -> bool {
        self.last_was_correct
    }

    pub fn get_tier_changed(&self) -> i8 {
        self.tier_changed
    }

    /// Returns the 4 choice options as a JSON array string "[a, b, c, d]"
    pub fn get_options_json(&self) -> String {
        serde_json::to_string(&self.current_options).unwrap_or_else(|_| "[]".to_string())
    }

    /// Full state serialization for atomic DOM updates
    pub fn get_state_json(&self) -> String {
        let state = MathChallengeState {
            tier: self.tier.to_u8(),
            tier_name: self.tier.name().to_string(),
            operand1: self.current_op1,
            operand2: self.current_op2,
            operator: self.current_operator.to_string(),
            answer: self.current_answer,
            options: self.current_options.clone(),
            mastery: self.mastery,
            mastery_pct: (self.mastery * 100.0).round() as u32,
            streak: self.streak,
            highest_streak: self.highest_streak,
            total_answered: self.total_answered,
            total_correct: self.total_correct,
            last_was_correct: self.last_was_correct,
            tier_changed: self.tier_changed,
        };
        serde_json::to_string(&state).unwrap_or_else(|_| "{}".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ema_formula() {
        let mut session = MathSession::new(100, 1);
        let initial_m = session.get_mastery();
        assert!((initial_m - 0.50).abs() < 1e-4);

        // Submit correct answer fast (P = 1.0)
        // M_1 = 0.75 * 0.50 + 0.25 * 1.0 = 0.375 + 0.25 = 0.625
        let ans = session.get_correct_answer();
        session.submit_answer(ans, 2000);
        assert!((session.get_mastery() - 0.625).abs() < 1e-4);

        // Submit incorrect answer (P = 0.0)
        // M_2 = 0.75 * 0.625 + 0.25 * 0.0 = 0.46875
        session.submit_answer(ans + 999, 1000);
        assert!((session.get_mastery() - 0.46875).abs() < 1e-4);
    }

    #[test]
    fn test_all_tiers_generate_valid_ranges() {
        for t in 1..=6 {
            let mut session = MathSession::new(12345 + t as u64, t);
            for _ in 0..50 {
                session.generate_next_challenge();
                let op1 = session.get_operand1();
                let op2 = session.get_operand2();
                let op = session.get_operator();
                let ans = session.get_correct_answer();

                match t {
                    1 => {
                        assert_eq!(op, "+");
                        assert!(op1 + op2 <= 10);
                        assert_eq!(ans, op1 + op2);
                    }
                    2 => {
                        assert_eq!(op, "+");
                        assert_eq!(ans, op1 + op2);
                    }
                    3 => {
                        assert_eq!(op, "-");
                        assert!(op1 >= op2);
                        assert_eq!(ans, op1 - op2);
                    }
                    4 => {
                        assert_eq!(op, "-");
                        assert!(op1 >= op2);
                        assert_eq!(ans, op1 - op2);
                    }
                    5 | 6 => {
                        assert_eq!(op, "×");
                        assert_eq!(ans, op1 * op2);
                    }
                    _ => {}
                }

                // Verify options contain answer and has 4 unique elements
                let opts_json = session.get_options_json();
                let opts: Vec<u32> = serde_json::from_str(&opts_json).unwrap();
                assert_eq!(opts.len(), 4);
                assert!(opts.contains(&ans));
            }
        }
    }

    #[test]
    fn test_tier_advancement() {
        let mut session = MathSession::new(777, 1);
        assert_eq!(session.get_tier(), 1);

        // Deliver repeated fast correct answers to drive mastery >= 0.82 and streak >= 3
        for _ in 0..10 {
            let ans = session.get_correct_answer();
            session.submit_answer(ans, 1500);
            session.generate_next_challenge();
            if session.get_tier() > 1 {
                break;
            }
        }
        assert!(session.get_tier() >= 2);
    }
}
