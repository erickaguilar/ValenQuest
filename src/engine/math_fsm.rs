//! Math FSM and Adaptive EMA Engine
//! Implements a 10-tier curricular progression state machine corresponding to
//! "La Leyenda de las Diez Lunas de Lumiria" with Exponential Moving Average (EMA)
//! mastery calculation, procedural problem generation, and distractor synthesis.

use wasm_bindgen::prelude::*;
use serde::Serialize;
use crate::engine::prng::Xorshift64;

/// 10 Curricular Tiers matching the 10 Astral Temples of Lumiria
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CurricularTier {
    /// Nivel 1: Manantial de Rocío (Sumas simples directas a + b <= 10)
    Tier1SumDirect = 1,
    /// Nivel 2: Bosque Susurrante (Suma y resta hasta 20 sin acarreos)
    Tier2SumSub20 = 2,
    /// Nivel 3: Vértice de Algodón (Suma de dos cifras con acarreo forzado)
    Tier3SumCarry = 3,
    /// Nivel 4: Caverna de Ámbar (Resta con transformación / desagrupación)
    Tier4SubBorrow = 4,
    /// Nivel 5: Palacio Prisma (Tablas 2, 3, 5 y 10)
    Tier5MultIntro = 5,
    /// Nivel 6: Reloj de las Arenas (Tablas 4, 6, 7, 8, 9, dobles y mitades)
    Tier6MultAdvanced = 6,
    /// Nivel 7: Mar de Coral Profundo (Reparto equitativo / división exacta)
    Tier7DivisionExact = 7,
    /// Nivel 8: Muralla de Nácar (Fracciones visuales: medios, cuartos, octavos)
    Tier8FractionsVisual = 8,
    /// Nivel 9: Cúspide de la Aurora (Operaciones combinadas con paréntesis)
    Tier9OrderOfOperations = 9,
    /// Nivel 10: Trono de las Estrellas (Acertijo numérico final y alta fluidez)
    Tier10HighFluencyRiddles = 10,
}

impl CurricularTier {
    pub fn from_u8(val: u8) -> Self {
        match val {
            1 => CurricularTier::Tier1SumDirect,
            2 => CurricularTier::Tier2SumSub20,
            3 => CurricularTier::Tier3SumCarry,
            4 => CurricularTier::Tier4SubBorrow,
            5 => CurricularTier::Tier5MultIntro,
            6 => CurricularTier::Tier6MultAdvanced,
            7 => CurricularTier::Tier7DivisionExact,
            8 => CurricularTier::Tier8FractionsVisual,
            9 => CurricularTier::Tier9OrderOfOperations,
            10 => CurricularTier::Tier10HighFluencyRiddles,
            _ => CurricularTier::Tier1SumDirect,
        }
    }

    pub fn to_u8(self) -> u8 {
        self as u8
    }

    pub fn name(self) -> &'static str {
        match self {
            CurricularTier::Tier1SumDirect => "Nivel 1: Manantial de Rocío",
            CurricularTier::Tier2SumSub20 => "Nivel 2: Bosque Susurrante",
            CurricularTier::Tier3SumCarry => "Nivel 3: Vértice de Algodón",
            CurricularTier::Tier4SubBorrow => "Nivel 4: Caverna de Ámbar",
            CurricularTier::Tier5MultIntro => "Nivel 5: Palacio Prisma",
            CurricularTier::Tier6MultAdvanced => "Nivel 6: Reloj de las Arenas",
            CurricularTier::Tier7DivisionExact => "Nivel 7: Mar de Coral Profundo",
            CurricularTier::Tier8FractionsVisual => "Nivel 8: Muralla de Nácar",
            CurricularTier::Tier9OrderOfOperations => "Nivel 9: Cúspide de la Aurora",
            CurricularTier::Tier10HighFluencyRiddles => "Nivel 10: Trono de las Estrellas",
        }
    }

    pub fn next(self) -> Self {
        match self {
            CurricularTier::Tier1SumDirect => CurricularTier::Tier2SumSub20,
            CurricularTier::Tier2SumSub20 => CurricularTier::Tier3SumCarry,
            CurricularTier::Tier3SumCarry => CurricularTier::Tier4SubBorrow,
            CurricularTier::Tier4SubBorrow => CurricularTier::Tier5MultIntro,
            CurricularTier::Tier5MultIntro => CurricularTier::Tier6MultAdvanced,
            CurricularTier::Tier6MultAdvanced => CurricularTier::Tier7DivisionExact,
            CurricularTier::Tier7DivisionExact => CurricularTier::Tier8FractionsVisual,
            CurricularTier::Tier8FractionsVisual => CurricularTier::Tier9OrderOfOperations,
            CurricularTier::Tier9OrderOfOperations => CurricularTier::Tier10HighFluencyRiddles,
            CurricularTier::Tier10HighFluencyRiddles => CurricularTier::Tier10HighFluencyRiddles,
        }
    }

    pub fn prev(self) -> Self {
        match self {
            CurricularTier::Tier1SumDirect => CurricularTier::Tier1SumDirect,
            CurricularTier::Tier2SumSub20 => CurricularTier::Tier1SumDirect,
            CurricularTier::Tier3SumCarry => CurricularTier::Tier2SumSub20,
            CurricularTier::Tier4SubBorrow => CurricularTier::Tier3SumCarry,
            CurricularTier::Tier5MultIntro => CurricularTier::Tier4SubBorrow,
            CurricularTier::Tier6MultAdvanced => CurricularTier::Tier5MultIntro,
            CurricularTier::Tier7DivisionExact => CurricularTier::Tier6MultAdvanced,
            CurricularTier::Tier8FractionsVisual => CurricularTier::Tier7DivisionExact,
            CurricularTier::Tier9OrderOfOperations => CurricularTier::Tier8FractionsVisual,
            CurricularTier::Tier10HighFluencyRiddles => CurricularTier::Tier9OrderOfOperations,
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
    pub expression: String,
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
    pub portal_ready: bool,
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
    current_operator: String,
    current_expression: String,
    current_answer: u32,
    current_options: Vec<u32>,
    /// Valores de error genuino del reto vigente (trampas pedagógicas).
    /// Se recalculan en cada `generate_next_challenge` y tienen prioridad
    /// como distractores por ser los más diagnósticos (ej. olvidar el
    /// acarreo, confundir ÷ con el divisor, ignorar la precedencia).
    pedagogical_traps: Vec<u32>,
    last_was_correct: bool,
    tier_changed: i8,
    portal_ready: bool,
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
            current_operator: "+".to_string(),
            current_expression: String::new(),
            current_answer: 2,
            current_options: vec![2, 3, 4, 5],
            pedagogical_traps: Vec::new(),
            last_was_correct: true,
            tier_changed: 0,
            portal_ready: false,
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
        self.portal_ready = false;
        self.generate_next_challenge();
    }

    /// Manually sets/forces the current tier (e.g. from saved profile)
    pub fn force_tier(&mut self, tier: u8) {
        self.tier = CurricularTier::from_u8(tier);
        self.tier_changed = 0;
        self.portal_ready = false;
        self.generate_next_challenge();
    }

    /// Advances to the next curricular tier (called upon beating the Portal Challenge)
    pub fn advance_tier(&mut self) -> u8 {
        self.tier = self.tier.next();
        self.tier_changed = 1;
        self.portal_ready = false;
        self.mastery = 0.65;
        self.streak = 0;
        self.generate_next_challenge();
        self.tier.to_u8()
    }

    /// Clears the portal ready state
    pub fn clear_portal_ready(&mut self) {
        self.portal_ready = false;
    }

    /// Generates a new challenge appropriate for the current tier
    pub fn generate_next_challenge(&mut self) {
        self.tier_changed = 0;
        self.current_expression.clear();
        self.pedagogical_traps.clear();

        match self.tier {
            // Nivel 1: Manantial de Rocío (Sumas simples directas a + b <= 10,
            // incluyendo el conteo con cero: 0 + b como identidad aditiva)
            CurricularTier::Tier1SumDirect => {
                let op1 = self.prng.gen_range(0, 9);
                let max_op2 = 10 - op1;
                let op2 = self.prng.gen_range(1, max_op2.max(1));
                self.current_op1 = op1;
                self.current_op2 = op2;
                self.current_operator = "+".to_string();
                self.current_answer = op1 + op2;
            }

            // Nivel 2: Bosque Susurrante (Suma y resta hasta 20 sin acarreos)
            CurricularTier::Tier2SumSub20 => {
                let mode = self.prng.gen_range(0, 1);
                if mode == 0 {
                    // Suma hasta 20 sin acarreo (ej. 12 + 5 = 17)
                    let op1 = self.prng.gen_range(10, 17);
                    let max_op2 = 19 - op1;
                    let op2 = self.prng.gen_range(1, max_op2.max(1));
                    self.current_op1 = op1;
                    self.current_op2 = op2;
                    self.current_operator = "+".to_string();
                    self.current_answer = op1 + op2;
                } else {
                    // Resta sin llevada (ej. 17 - 4 = 13)
                    let op1 = self.prng.gen_range(11, 19);
                    let max_sub = (op1 % 10).max(1);
                    let op2 = self.prng.gen_range(1, max_sub);
                    self.current_op1 = op1;
                    self.current_op2 = op2;
                    self.current_operator = "-".to_string();
                    self.current_answer = op1 - op2;
                }
            }

            // Nivel 3: Vértice de Algodón (Suma de dos cifras con acarreo forzado)
            CurricularTier::Tier3SumCarry => {
                // op1: 14..=39 con unidad 4..=9
                let tens = self.prng.gen_range(1, 3) * 10;
                let unit1 = self.prng.gen_range(4, 9);
                let op1 = tens + unit1;
                // op2 forces carry: unit1 + op2 >= 10
                let min_op2 = (10u32).saturating_sub(unit1).max(2);
                let op2 = self.prng.gen_range(min_op2 + 1, 9);
                self.current_op1 = op1;
                self.current_op2 = op2;
                self.current_operator = "+".to_string();
                self.current_answer = op1 + op2;
            }

            // Nivel 4: Caverna de Ámbar (Resta con transformación / desagrupar decenas)
            CurricularTier::Tier4SubBorrow => {
                // Minuendo con unidad menor que sustraendo (ej. 23 - 7, 42 - 8)
                let tens = self.prng.gen_range(2, 5) * 10;
                let unit1 = self.prng.gen_range(1, 5);
                let op1 = tens + unit1;
                let op2 = self.prng.gen_range(unit1 + 2, 9);
                self.current_op1 = op1;
                self.current_op2 = op2;
                self.current_operator = "-".to_string();
                self.current_answer = op1 - op2;
            }

            // Nivel 5: Palacio Prisma (Tablas 2, 3, 5 y 10 + factor faltante)
            CurricularTier::Tier5MultIntro => {
                let tables = [2, 3, 5, 10];
                let idx = self.prng.gen_range(0, 3) as usize;
                let table = tables[idx];
                let mult = self.prng.gen_range(2, 10);
                if self.prng.gen_range(0, 3) == 0 {
                    // Factor faltante: t × ? = p (1 de cada 4 retos)
                    let product = table * mult;
                    self.current_op1 = table;
                    self.current_op2 = mult;
                    self.current_operator = "×".to_string();
                    self.current_expression = format!("{} × ? = {}", table, product);
                    self.current_answer = mult;
                    // Trampas: responder el producto y la tabla vecina.
                    self.pedagogical_traps.push(product);
                    if mult > 2 {
                        self.pedagogical_traps.push(mult - 1);
                    }
                    if mult < 10 {
                        self.pedagogical_traps.push(mult + 1);
                    }
                } else {
                    self.current_op1 = table;
                    self.current_op2 = mult;
                    self.current_operator = "×".to_string();
                    self.current_answer = table * mult;
                    // Trampas de tabla vecina: el error clásico es desplazarse
                    // una fila en la misma tabla (ej. 3×4=12 → 9 / 15).
                    if mult > 1 {
                        self.pedagogical_traps.push(table * (mult - 1));
                    }
                    if mult < 10 {
                        self.pedagogical_traps.push(table * (mult + 1));
                    }
                }
            }

            // Nivel 6: Reloj de las Arenas (Tablas 4, 6, 7, 8, 9, dobles y mitades)
            CurricularTier::Tier6MultAdvanced => {
                let mode = self.prng.gen_range(0, 2);
                if mode == 0 {
                    // Mitades de números pares
                    let q = self.prng.gen_range(4, 20);
                    self.current_op1 = q * 2;
                    self.current_op2 = 2;
                    self.current_operator = "÷".to_string();
                    self.current_expression = format!("Mitad de {}", self.current_op1);
                    self.current_answer = q;
                    // Trampa: responder el dividendo en vez de su mitad.
                    self.pedagogical_traps.push(self.current_op1);
                } else if mode == 1 {
                    // Dobles de números (base 4..=20)
                    let a = self.prng.gen_range(4, 20);
                    self.current_op1 = a;
                    self.current_op2 = 2;
                    self.current_operator = "×".to_string();
                    self.current_expression = format!("Doble de {}", a);
                    self.current_answer = a * 2;
                    // Trampa: responder la base en vez del doble.
                    self.pedagogical_traps.push(a);
                } else {
                    // Tablas 4, 6, 7, 8, 9
                    let tables = [4, 6, 7, 8, 9];
                    let idx = self.prng.gen_range(0, 4) as usize;
                    let op1 = tables[idx];
                    let op2 = self.prng.gen_range(2, 10);
                    self.current_op1 = op1;
                    self.current_op2 = op2;
                    self.current_operator = "×".to_string();
                    self.current_answer = op1 * op2;
                    // Trampas de tabla vecina (igual que Nivel 5).
                    if op2 > 1 {
                        self.pedagogical_traps.push(op1 * (op2 - 1));
                    }
                    if op2 < 10 {
                        self.pedagogical_traps.push(op1 * (op2 + 1));
                    }
                }
            }

            // Nivel 7: Mar de Coral Profundo (Reparto equitativo / división exacta,
            // incluyendo dividendo faltante: ? ÷ d = q)
            CurricularTier::Tier7DivisionExact => {
                let divisor = self.prng.gen_range(2, 9);
                let quotient = self.prng.gen_range(2, 11);
                let dividend = divisor * quotient;
                self.current_op1 = dividend;
                self.current_op2 = divisor;
                self.current_operator = "÷".to_string();
                if self.prng.gen_range(0, 3) == 0 {
                    // Dividendo faltante (1 de cada 4 retos)
                    self.current_expression = format!("? ÷ {} = {}", divisor, quotient);
                    self.current_answer = dividend;
                    // Trampas: responder el cociente o el divisor.
                    self.pedagogical_traps.push(quotient);
                    self.pedagogical_traps.push(divisor);
                } else {
                    self.current_answer = quotient;
                    // Trampa: responder con el divisor en vez del cociente.
                    self.pedagogical_traps.push(divisor);
                }
            }

            // Nivel 8: Muralla de Nácar (Fracciones visuales: medios, cuartos,
            // octavos; con numerador 1 o k: k/den de N gemas)
            CurricularTier::Tier8FractionsVisual => {
                let den_idx = self.prng.gen_range(0, 2);
                let den = match den_idx {
                    0 => 2u32, // Medios
                    1 => 4u32, // Cuartos
                    _ => 8u32, // Octavos
                };
                let factor = self.prng.gen_range(2, 7);
                let total = den * factor;
                // Numerador: 1 (unitario) o k>=2 cuando el denominador lo admite.
                let num = if den > 2 && self.prng.gen_range(0, 2) == 0 {
                    self.prng.gen_range(2, den - 1)
                } else {
                    1
                };
                self.current_op1 = num;
                self.current_op2 = total;
                self.current_operator = "de".to_string();
                self.current_expression = format!("{}/{} de {} gemas", num, den, total);
                self.current_answer = num * total / den;
                // Trampas de densidad confundida: responder con otra
                // fracción del mismo total (ej. 1/4 en vez de 3/4).
                for alt_den in [2u32, 4u32, 8u32] {
                    let alt = total / alt_den;
                    if alt != self.current_answer {
                        self.pedagogical_traps.push(alt);
                    }
                }
            }

            // Nivel 9: Cúspide de la Aurora (Operaciones combinadas con paréntesis)
            CurricularTier::Tier9OrderOfOperations => {
                let mode = self.prng.gen_range(0, 2);
                match mode {
                    0 => {
                        // (a × b) + c
                        let a = self.prng.gen_range(2, 6);
                        let b = self.prng.gen_range(2, 6);
                        let c = self.prng.gen_range(2, 12);
                        self.current_op1 = a * b;
                        self.current_op2 = c;
                        self.current_operator = "+".to_string();
                        self.current_expression = format!("({} × {}) + {}", a, b, c);
                        self.current_answer = (a * b) + c;
                        // Trampas: ignorar la precedencia a×(b+c) y
                        // confundir el signo (a×b)-c.
                        self.pedagogical_traps.push(a * (b + c));
                        if self.current_op1 > c {
                            self.pedagogical_traps.push(self.current_op1 - c);
                        }
                    }
                    1 => {
                        // (a × b) - c
                        let a = self.prng.gen_range(3, 7);
                        let b = self.prng.gen_range(2, 6);
                        let mult = a * b;
                        let c = self.prng.gen_range(1, mult.saturating_sub(2).max(1));
                        self.current_op1 = mult;
                        self.current_op2 = c;
                        self.current_operator = "-".to_string();
                        self.current_expression = format!("({} × {}) - {}", a, b, c);
                        self.current_answer = mult - c;
                        // Trampas: a×(b-c) por precedencia y (a×b)+c por signo.
                        if let Some(diff) = b.checked_sub(c) {
                            self.pedagogical_traps.push(a * diff);
                        }
                        self.pedagogical_traps.push(mult + c);
                    }
                    _ => {
                        // a + (b × c)
                        let a = self.prng.gen_range(3, 15);
                        let b = self.prng.gen_range(2, 4);
                        let c = self.prng.gen_range(2, 6);
                        self.current_op1 = a;
                        self.current_op2 = b * c;
                        self.current_operator = "+".to_string();
                        self.current_expression = format!("{} + ({} × {})", a, b, c);
                        self.current_answer = a + (b * c);
                        // Trampa: operar de izquierda a derecha (a+b)×c.
                        self.pedagogical_traps.push((a + b) * c);
                    }
                }
            }

            // Nivel 10: Trono de las Estrellas (Acertijo numérico final y alta fluidez)
            CurricularTier::Tier10HighFluencyRiddles => {
                let mode = self.prng.gen_range(0, 2);
                if mode == 0 {
                    // Doble de a + triple de b
                    let a = self.prng.gen_range(4, 12);
                    let b = self.prng.gen_range(2, 6);
                    self.current_op1 = a * 2;
                    self.current_op2 = b * 3;
                    self.current_operator = "+".to_string();
                    self.current_expression = format!("(Doble de {}) + (Triple de {})", a, b);
                    self.current_answer = (a * 2) + (b * 3);
                    // Trampas: olvidar un operador (a+3b / 2a+b).
                    self.pedagogical_traps.push(a + (b * 3));
                    self.pedagogical_traps.push((a * 2) + b);
                } else if mode == 1 {
                    // (a × b) + (c × d)
                    let a = self.prng.gen_range(2, 5);
                    let b = self.prng.gen_range(3, 6);
                    let c = self.prng.gen_range(2, 5);
                    let d = self.prng.gen_range(2, 6);
                    let p1 = a * b;
                    let p2 = c * d;
                    self.current_op1 = p1;
                    self.current_op2 = p2;
                    self.current_operator = "+".to_string();
                    self.current_expression = format!("({} × {}) + ({} × {})", a, b, c, d);
                    self.current_answer = p1 + p2;
                    // Trampa: restar los productos en vez de sumarlos.
                    self.pedagogical_traps.push(p1.abs_diff(p2));
                } else {
                    // (a × b) - Mitad de c
                    let a = self.prng.gen_range(3, 7);
                    let b = self.prng.gen_range(3, 7);
                    let half_q = self.prng.gen_range(2, 6);
                    let c = half_q * 2;
                    self.current_op1 = a * b;
                    self.current_op2 = half_q;
                    self.current_operator = "-".to_string();
                    self.current_expression = format!("({} × {}) - (Mitad de {})", a, b, c);
                    self.current_answer = (a * b) - half_q;
                    // Trampas: olvidar la resta y confundir el signo.
                    self.pedagogical_traps.push(a * b);
                    self.pedagogical_traps.push((a * b) + half_q);
                }
            }
        }

        self.generate_distractors();
    }

    /// Generates 3 plausible distractors + correct answer, shuffled.
    ///
    /// Calibración por tier (auditoría FSM-vs-docs):
    /// - La vecindad numérica (±1, ±2, ±3) escala con la magnitud del tier;
    ///   el salto ±10 solo aparece cuando la respuesta lo admite (ans > 10),
    ///   para no ofrecer descartes por absurdo en los niveles iniciales.
    /// - Cada tier impone un tope de plausibilidad a los offsets genéricos
    ///   (N1 ≤ 12, N2 ≤ 22, N8 ≤ total de gemas). Las trampas pedagógicas
    ///   del reto (errores genuinos) nunca se recortan: son diagnósticas.
    /// - Los comodines ×2 / ÷2 genéricos se eliminan: se reemplazan por
    ///   trampas específicas (tabla vecina, dividendo, divisor, densidades).
    fn generate_distractors(&mut self) {
        use CurricularTier::*;
        let answer = self.current_answer;
        let ans_i = answer as i32;
        let mut candidates: Vec<u32> = Vec::with_capacity(12);

        // 1. Trampas pedagógicas del reto vigente (máxima prioridad).
        candidates.extend(self.pedagogical_traps.iter().copied());

        // 2. Vecindad numérica calibrada por tier.
        //    ten_mode: 0 = sin ±10, 1 = ±10 si ans > 10, 2 = ±10 solo si ans > 20
        //    (cocientes pequeños de N7 no admiten +10, dividendos grandes sí).
        let (mut offsets, ten_mode, offset_cap): (Vec<i32>, u8, Option<u32>) =
            match self.tier {
                Tier1SumDirect => (vec![-2, -1, 1, 2], 0, Some(12)),
                Tier2SumSub20 => (vec![-3, -2, -1, 1, 2, 3], 0, Some(22)),
                Tier3SumCarry | Tier4SubBorrow => (vec![-3, -2, -1, 1, 2, 3], 1, None),
                Tier5MultIntro => (vec![-2, -1, 1, 2], 1, None),
                Tier6MultAdvanced => {
                    if self.current_expression.starts_with("Mitad")
                        || self.current_expression.starts_with("Doble")
                    {
                        (vec![-2, -1, 1, 2], 0, None)
                    } else {
                        (vec![-2, -1, 1, 2], 1, None)
                    }
                }
                Tier7DivisionExact => (vec![-2, -1, 1, 2], 2, None),
                Tier8FractionsVisual => (vec![-2, -1, 1, 2], 1, Some(self.current_op2)),
                Tier9OrderOfOperations | Tier10HighFluencyRiddles => {
                    (vec![-3, -2, -1, 1, 2, 3], 1, None)
                }
            };

        // El salto ±10 (olvidar/acumular una decena) solo si es plausible.
        if answer > 10 && ten_mode == 1 {
            offsets.push(-10);
            offsets.push(10);
        } else if ten_mode == 2 && answer > 20 {
            offsets.push(-10);
            offsets.push(10);
        } else if self.tier == CurricularTier::Tier2SumSub20 && answer > 10 {
            // En N2 solo el olvido de la decena (13 → 3), nunca el +10.
            offsets.push(-10);
        }

        for off in offsets {
            let v = ans_i + off;
            if v <= 0 {
                continue;
            }
            let v = v as u32;
            if let Some(cap) = offset_cap {
                if v > cap {
                    continue;
                }
            }
            candidates.push(v);
        }

        // 3. Trampa de signo en los niveles aditivos (error genuino,
        // siempre plausible porque nace de los propios operandos).
        // Respeta el tope del tier igual que los offsets genéricos.
        if matches!(
            self.tier,
            Tier1SumDirect | Tier2SumSub20 | Tier3SumCarry | Tier4SubBorrow
        ) {
            let sign_trap = if self.current_operator == "+" && self.current_op1 > self.current_op2
            {
                Some(self.current_op1 - self.current_op2)
            } else if self.current_operator == "-" {
                Some(self.current_op1 + self.current_op2)
            } else {
                None
            };
            if let Some(trap) = sign_trap {
                let capped_out = offset_cap.map_or(false, |cap| trap > cap);
                if !capped_out {
                    candidates.push(trap);
                }
            }
        }

        // Filter: strictly positive, distinct from answer, unique.
        // Prioritizes traps (pushed first) over generic neighborhood.
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

        // Fallback if not enough unique candidates: preferir valores dentro
        // del tope y relajarlo solo si no hay alternativa.
        let mut offset = 3u32;
        let mut relaxed = offset_cap.is_none();
        while distractors.len() < 3 {
            let alt = if self.prng.gen_range(0, 1) == 0 {
                answer + offset
            } else if answer > offset {
                answer - offset
            } else {
                answer + offset + 2
            };
            if !relaxed {
                if let Some(cap) = offset_cap {
                    if alt > cap {
                        offset += 1;
                        if offset > 12 {
                            relaxed = true;
                        }
                        continue;
                    }
                }
            }
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
        // El Trono de las Estrellas (N10) exige alta fluidez mental:
        // la banda de "acierto rápido" se estrecha a t <= 3500 ms
        // según la matriz curricular (el resto de tiers usa 4000 ms).
        let fast_band_ms = if self.tier == CurricularTier::Tier10HighFluencyRiddles {
            3500
        } else {
            4000
        };
        let p: f32 = if is_correct {
            self.total_correct += 1;
            self.streak += 1;
            self.consecutive_errors = 0;
            if self.streak > self.highest_streak {
                self.highest_streak = self.streak;
            }

            if elapsed_ms <= fast_band_ms {
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

        // Portal listo: maestría alta (>= 0.82) con racha sostenida (>= 3).
        // El avance de tier NO es automático: ocurre en advance_tier(),
        // tras superar el Desafío de Portal (la UI abre el portal del
        // templo vigente). Vale también en el Nivel 10 (victoria final).
        if self.mastery >= 0.82 && self.streak >= 3 && !self.portal_ready {
            self.tier_changed = 1;
            self.portal_ready = true;
        }
        // Regression condition: Low mastery (< 0.38) and multiple errors, not on Tier 1
        else if self.mastery < 0.38 && self.consecutive_errors >= 2 && self.tier != CurricularTier::Tier1SumDirect {
            self.tier = self.tier.prev();
            self.tier_changed = -1;
            self.portal_ready = false;
            // Provide supportive baseline to rebuild confidence
            self.mastery = 0.55;
            self.consecutive_errors = 0;
        }

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
        self.current_operator.clone()
    }

    pub fn get_expression(&self) -> String {
        self.current_expression.clone()
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

    pub fn is_portal_ready(&self) -> bool {
        self.portal_ready
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
            operator: self.current_operator.clone(),
            expression: self.current_expression.clone(),
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
            portal_ready: self.portal_ready,
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
    fn test_all_10_tiers_generate_valid_ranges() {
        for t in 1..=10 {
            let mut session = MathSession::new(12345 + t as u64, t);
            for _ in 0..30 {
                session.generate_next_challenge();
                let ans = session.get_correct_answer();
                assert!(ans > 0, "Answer must be strictly positive in tier {}", t);

                // Verify options contain answer and has 4 unique positive elements
                let opts_json = session.get_options_json();
                let opts: Vec<u32> = serde_json::from_str(&opts_json).unwrap();
                assert_eq!(opts.len(), 4, "Tier {} must provide 4 options", t);
                assert!(opts.contains(&ans), "Tier {} options must contain the correct answer", t);
                for &opt in &opts {
                    assert!(opt > 0, "All options in tier {} must be positive", t);
                }
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
            if session.is_portal_ready() {
                break;
            }
            session.generate_next_challenge();
        }
        // El portal se arma SIN auto-avance: el tier cambia en advance_tier().
        assert_eq!(session.get_tier(), 1);
        assert!(session.is_portal_ready());
        assert_eq!(session.get_tier_changed(), 1);
        let next = session.advance_tier();
        assert_eq!(next, 2);
        assert_eq!(session.get_tier(), 2);
        assert!(!session.is_portal_ready());
    }

    #[test]
    fn test_advance_tier_method() {
        let mut session = MathSession::new(101, 1);
        assert_eq!(session.get_tier(), 1);
        let next_tier = session.advance_tier();
        assert_eq!(next_tier, 2);
        assert_eq!(session.get_tier(), 2);
    }

    #[test]
    fn test_tier1_options_bounded_no_absurd_distractors() {
        // N1 (a + b <= 10): ningún distractor puede superar 12.
        // El +10 / ×2 genérico enseñaba a descartar por absurdo.
        for seed in 0..300u64 {
            let mut session = MathSession::new(seed, 1);
            for _ in 0..5 {
                session.generate_next_challenge();
                let ans = session.get_correct_answer();
                assert!(ans <= 10, "N1 answer out of range: {}", ans);
                let opts: Vec<u32> =
                    serde_json::from_str(&session.get_options_json()).unwrap();
                assert_eq!(opts.len(), 4);
                assert!(opts.contains(&ans));
                for &opt in &opts {
                    assert!(opt > 0 && opt <= 12, "N1 absurd option {} (seed {})", opt, seed);
                }
            }
        }
    }

    #[test]
    fn test_tier2_tens_drop_trap() {
        // N2: el olvido de la decena (13 → 3) debe poder aparecer.
        let mut seen_tens_drop = false;
        for seed in 0..150u64 {
            let mut session = MathSession::new(seed, 2);
            for _ in 0..10 {
                session.generate_next_challenge();
                let ans = session.get_correct_answer();
                let opts: Vec<u32> =
                    serde_json::from_str(&session.get_options_json()).unwrap();
                if ans > 10 && opts.contains(&(ans - 10)) {
                    seen_tens_drop = true;
                }
                // Tope de plausibilidad "hasta 20".
                for &opt in &opts {
                    assert!(opt <= 22, "N2 absurd option {}", opt);
                }
            }
        }
        assert!(seen_tens_drop, "tens-drop trap never surfaced in N2");
    }

    #[test]
    fn test_tier5_table_neighbors_eventually_surface() {
        // N5: la trampa diagnóstica es la tabla vecina (3×4=12 → 9/15).
        let mut seen_neighbor = false;
        for seed in 0..120u64 {
            let mut session = MathSession::new(seed, 5);
            for _ in 0..8 {
                session.generate_next_challenge();
                let table = session.get_operand1();
                let mult = session.get_operand2();
                let ans = session.get_correct_answer();
                let opts: Vec<u32> =
                    serde_json::from_str(&session.get_options_json()).unwrap();
                let lower = mult > 1 && opts.contains(&(table * (mult - 1)));
                let upper = mult < 10 && opts.contains(&(table * (mult + 1)));
                if lower || upper {
                    seen_neighbor = true;
                }
                assert!(opts.contains(&ans));
            }
        }
        assert!(seen_neighbor, "table-neighbor trap never surfaced in N5");
    }

    #[test]
    fn test_tier6_covers_halves_doubles_and_tables() {
        // N6 debe generar las 3 modalidades documentadas (mitades, dobles, tablas).
        let mut seen_half = false;
        let mut seen_double = false;
        let mut seen_times = false;
        for seed in 0..200u64 {
            let mut session = MathSession::new(seed + 1_000_000, 6);
            session.generate_next_challenge();
            let expr = session.get_expression();
            let op = session.get_operator();
            if expr.starts_with("Mitad de") {
                seen_half = true;
                // La mitad de un par N es N/2.
                assert_eq!(session.get_correct_answer(), session.get_operand1() / 2);
            } else if expr.starts_with("Doble de") {
                seen_double = true;
                assert_eq!(session.get_correct_answer(), session.get_operand1() * 2);
            } else if op == "×" {
                seen_times = true;
            }
        }
        assert!(seen_half && seen_double && seen_times);
    }

    #[test]
    fn test_tier8_options_bounded_by_gem_total() {
        // N8: ninguna opción supera el total de gemas del enunciado.
        for seed in 0..300u64 {
            let mut session = MathSession::new(seed, 8);
            for _ in 0..5 {
                session.generate_next_challenge();
                let total = session.get_operand2();
                let opts: Vec<u32> =
                    serde_json::from_str(&session.get_options_json()).unwrap();
                assert!(opts.contains(&session.get_correct_answer()));
                for &opt in &opts {
                    assert!(opt > 0 && opt <= total, "N8 option {} exceeds total {}", opt, total);
                }
            }
        }
    }

    #[test]
    fn test_tier5_missing_factor_mode() {
        // N5: el modo "t × ? = p" debe aparecer y su respuesta es el factor.
        let mut seen = false;
        for seed in 0..200u64 {
            let mut session = MathSession::new(seed + 5_000_000, 5);
            session.generate_next_challenge();
            let expr = session.get_expression();
            if expr.contains('?') {
                seen = true;
                // "t × ? = p" → t * respuesta == p
                let parts: Vec<&str> = expr.split_whitespace().collect();
                assert_eq!(parts.len(), 5, "formato inesperado: {}", expr);
                let t: u32 = parts[0].parse().unwrap();
                let p: u32 = parts[4].parse().unwrap();
                assert_eq!(t * session.get_correct_answer(), p);
                assert_eq!(session.get_operand1(), t);
            }
        }
        assert!(seen, "el modo factor faltante nunca apareció en N5");
    }

    #[test]
    fn test_tier7_missing_dividend_mode() {
        // N7: "? ÷ d = q" responde el dividendo exacto.
        let mut seen = false;
        for seed in 0..200u64 {
            let mut session = MathSession::new(seed + 7_000_000, 7);
            session.generate_next_challenge();
            let expr = session.get_expression();
            if expr.starts_with("? ÷") {
                seen = true;
                let ans = session.get_correct_answer();
                assert_eq!(ans, session.get_operand1());
                assert_eq!(ans % session.get_operand2(), 0);
            }
        }
        assert!(seen, "el modo dividendo faltante nunca apareció en N7");
    }

    #[test]
    fn test_tier8_numerator_mode() {
        // N8: "k/den de N" con k>=2 responde k*N/den (< N).
        let mut seen = false;
        for seed in 0..300u64 {
            let mut session = MathSession::new(seed + 8_000_000, 8);
            session.generate_next_challenge();
            let expr = session.get_expression();
            if !expr.starts_with("1/") {
                seen = true;
                let slash = expr.find('/').unwrap();
                let space = expr.find(' ').unwrap();
                let k: u32 = expr[..slash].parse().unwrap();
                let den: u32 = expr[slash + 1..space].parse().unwrap();
                assert!(k >= 2, "numerador esperado >= 2: {}", expr);
                let total = session.get_operand2();
                assert_eq!(session.get_correct_answer(), k * total / den);
                assert!(session.get_correct_answer() < total);
            }
        }
        assert!(seen, "el modo numerador nunca apareció en N8");
    }

    #[test]
    fn test_tier1_zero_identity_surfaces() {
        // N1: "0 + b" (identidad aditiva) debe aparecer.
        let mut seen = false;
        for seed in 0..200u64 {
            let mut session = MathSession::new(seed + 9_000_000, 1);
            session.generate_next_challenge();
            if session.get_operand1() == 0 {
                seen = true;
                assert_eq!(session.get_correct_answer(), session.get_operand2());
            }
        }
        assert!(seen, "el conteo con cero nunca apareció en N1");
    }

    #[test]
    fn test_tier10_fast_band_is_3500ms() {
        // N10: P = 1.0 solo con t <= 3500 ms (el resto usa 4000 ms).
        let mut s10 = MathSession::new(7, 10);
        let ans = s10.get_correct_answer();
        s10.submit_answer(ans, 3500);
        assert!((s10.get_mastery() - 0.625).abs() < 1e-4);

        let mut s10b = MathSession::new(7, 10);
        let ansb = s10b.get_correct_answer();
        s10b.submit_answer(ansb, 3501);
        // P = 0.85 → 0.75*0.50 + 0.25*0.85 = 0.5875
        assert!((s10b.get_mastery() - 0.5875).abs() < 1e-4);

        // N1 conserva la banda de 4000 ms.
        let mut s1 = MathSession::new(7, 1);
        let ans1 = s1.get_correct_answer();
        s1.submit_answer(ans1, 3600);
        assert!((s1.get_mastery() - 0.625).abs() < 1e-4);
    }

    #[test]
    fn test_all_tiers_distractor_invariants() {
        // Invariantes globales tras la calibración: 4 únicas, positivas,
        // con respuesta incluida, en todos los tiers y sin pánicos.
        for t in 1..=10u8 {
            for seed in 0..100u64 {
                let mut session = MathSession::new(seed * 7919 + t as u64, t);
                for _ in 0..5 {
                    session.generate_next_challenge();
                    let ans = session.get_correct_answer();
                    let opts: Vec<u32> =
                        serde_json::from_str(&session.get_options_json()).unwrap();
                    assert_eq!(opts.len(), 4, "tier {} must offer 4 options", t);
                    assert!(opts.contains(&ans), "tier {} must include answer", t);
                    let mut dedup = opts.clone();
                    dedup.sort();
                    dedup.dedup();
                    assert_eq!(dedup.len(), 4, "tier {} duplicates: {:?}", t, opts);
                    assert!(opts.iter().all(|&o| o > 0));
                }
            }
        }
    }
}
