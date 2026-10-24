//! KidsLearn-WASM Engine Entrypoint
//! Exports adaptive math session FSM and reading fluency modules to WebAssembly.

pub mod engine;

pub use engine::math_fsm::MathSession;
pub use engine::reading::ReadingSession;
pub use engine::prng::Xorshift64;

use wasm_bindgen::prelude::*;

/// Returns engine version and build info for client telemetry
#[wasm_bindgen]
pub fn get_engine_version() -> String {
    "KidsLearn-WASM Engine v2.2.0 (Rust+Wasm)".to_string()
}

#[cfg(test)]
#[path = "tests/math_tests.rs"]
mod math_tests;

