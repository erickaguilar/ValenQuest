//! Deterministic Xorshift64* pseudo-random number generator.
//! Provides zero-dependency, fast, reproducible random number generation
//! fully compatible with wasm32-unknown-unknown targets.

#[derive(Debug, Clone)]
pub struct Xorshift64 {
    state: u64,
}

impl Xorshift64 {
    /// Creates a new generator with a seed.
    /// If seed is 0, a non-zero default seed is used.
    pub fn new(seed: u64) -> Self {
        let state = if seed == 0 {
            0xda94_2042_e4dd_58b5
        } else {
            seed
        };
        Self { state }
    }

    /// Generates next 64-bit pseudo-random unsigned integer.
    #[inline]
    pub fn next_u64(&mut self) -> u64 {
        let mut x = self.state;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.state = x;
        // Xorshift64* multiplication with Marsaglia multiplier
        x.wrapping_mul(0x2545_f491_4f6c_dd1d)
    }

    /// Generates next 32-bit pseudo-random unsigned integer.
    #[inline]
    pub fn next_u32(&mut self) -> u32 {
        (self.next_u64() >> 32) as u32
    }

    /// Generates a random integer within inclusive range [min, max].
    pub fn gen_range(&mut self, min: u32, max: u32) -> u32 {
        if min >= max {
            return min;
        }
        let range = (max - min + 1) as u64;
        let rand_val = self.next_u64() % range;
        min + rand_val as u32
    }

    /// Fisher-Yates shuffle for in-place slice randomization.
    pub fn shuffle<T>(&mut self, slice: &mut [T]) {
        let len = slice.len();
        if len <= 1 {
            return;
        }
        for i in (1..len).rev() {
            let j = (self.next_u64() % ((i + 1) as u64)) as usize;
            slice.swap(i, j);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_determinism() {
        let mut rng1 = Xorshift64::new(12345);
        let mut rng2 = Xorshift64::new(12345);
        for _ in 0..100 {
            assert_eq!(rng1.next_u64(), rng2.next_u64());
        }
    }

    #[test]
    fn test_zero_seed_fallback() {
        let mut rng = Xorshift64::new(0);
        let val = rng.next_u64();
        assert_ne!(val, 0);
    }

    #[test]
    fn test_gen_range() {
        let mut rng = Xorshift64::new(999);
        for _ in 0..1000 {
            let n = rng.gen_range(5, 15);
            assert!(n >= 5 && n <= 15);
        }
    }

    #[test]
    fn test_shuffle() {
        let mut rng = Xorshift64::new(42);
        let mut items = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let original = items.clone();
        rng.shuffle(&mut items);
        // Elements must remain identical as a set
        let mut sorted = items.clone();
        sorted.sort();
        assert_eq!(sorted, original);
    }
}
