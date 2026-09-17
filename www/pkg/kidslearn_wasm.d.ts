/* tslint:disable */
/* eslint-disable */

/**
 * Main adaptive math game session
 */
export class MathSession {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Advances to the next curricular tier (called upon beating the Portal Challenge)
     */
    advance_tier(): number;
    /**
     * Clears the portal ready state
     */
    clear_portal_ready(): void;
    /**
     * Manually sets/forces the current tier (e.g. from saved profile)
     */
    force_tier(tier: number): void;
    /**
     * Generates a new challenge appropriate for the current tier
     */
    generate_next_challenge(): void;
    get_correct_answer(): number;
    get_expression(): string;
    get_highest_streak(): number;
    get_last_correct(): boolean;
    get_mastery(): number;
    get_mastery_percentage(): number;
    get_operand1(): number;
    get_operand2(): number;
    get_operator(): string;
    /**
     * Returns the 4 choice options as a JSON array string "[a, b, c, d]"
     */
    get_options_json(): string;
    /**
     * Full state serialization for atomic DOM updates
     */
    get_state_json(): string;
    get_streak(): number;
    get_tier(): number;
    get_tier_changed(): number;
    get_tier_name(): string;
    get_total_answered(): number;
    get_total_correct(): number;
    is_portal_ready(): boolean;
    /**
     * Creates a new math session with deterministic PRNG seed and initial tier
     */
    constructor(seed: bigint, initial_tier: number);
    /**
     * Resets the session with a new seed and starting tier
     */
    reset(seed: bigint, initial_tier: number): void;
    /**
     * Evaluates user answer and updates EMA mastery, streaks, and tier FSM.
     * Returns true if answer was correct.
     */
    submit_answer(user_answer: number, elapsed_ms: number): boolean;
}

/**
 * Reading session state exported to WASM
 */
export class ReadingSession {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Calculates Words Per Minute (WPM)
     */
    static calculate_wpm(word_count: number, elapsed_ms: number): number;
    /**
     * Syllabifies the active story text
     */
    get_active_story_syllables(): string;
    /**
     * Returns JSON catalog of available stories
     */
    get_stories_json(): string;
    constructor();
    /**
     * Syllabifies an entire text and returns a JSON list of WordSyllables
     */
    parse_text_syllables(text: string): string;
    /**
     * Selects active story by ID
     */
    select_story(id: number): boolean;
}

/**
 * Returns engine version and build info for client telemetry
 */
export function get_engine_version(): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_mathsession_free: (a: number, b: number) => void;
    readonly __wbg_readingsession_free: (a: number, b: number) => void;
    readonly get_engine_version: (a: number) => void;
    readonly mathsession_advance_tier: (a: number) => number;
    readonly mathsession_clear_portal_ready: (a: number) => void;
    readonly mathsession_force_tier: (a: number, b: number) => void;
    readonly mathsession_generate_next_challenge: (a: number) => void;
    readonly mathsession_get_correct_answer: (a: number) => number;
    readonly mathsession_get_expression: (a: number, b: number) => void;
    readonly mathsession_get_highest_streak: (a: number) => number;
    readonly mathsession_get_last_correct: (a: number) => number;
    readonly mathsession_get_mastery: (a: number) => number;
    readonly mathsession_get_mastery_percentage: (a: number) => number;
    readonly mathsession_get_operand1: (a: number) => number;
    readonly mathsession_get_operand2: (a: number) => number;
    readonly mathsession_get_operator: (a: number, b: number) => void;
    readonly mathsession_get_options_json: (a: number, b: number) => void;
    readonly mathsession_get_state_json: (a: number, b: number) => void;
    readonly mathsession_get_streak: (a: number) => number;
    readonly mathsession_get_tier: (a: number) => number;
    readonly mathsession_get_tier_changed: (a: number) => number;
    readonly mathsession_get_tier_name: (a: number, b: number) => void;
    readonly mathsession_get_total_answered: (a: number) => number;
    readonly mathsession_get_total_correct: (a: number) => number;
    readonly mathsession_is_portal_ready: (a: number) => number;
    readonly mathsession_new: (a: bigint, b: number) => number;
    readonly mathsession_reset: (a: number, b: bigint, c: number) => void;
    readonly mathsession_submit_answer: (a: number, b: number, c: number) => number;
    readonly readingsession_calculate_wpm: (a: number, b: number) => number;
    readonly readingsession_get_active_story_syllables: (a: number, b: number) => void;
    readonly readingsession_get_stories_json: (a: number, b: number) => void;
    readonly readingsession_new: () => number;
    readonly readingsession_parse_text_syllables: (a: number, b: number, c: number, d: number) => void;
    readonly readingsession_select_story: (a: number, b: number) => number;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_export: (a: number, b: number, c: number) => void;
    readonly __wbindgen_export2: (a: number, b: number) => number;
    readonly __wbindgen_export3: (a: number, b: number, c: number, d: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
