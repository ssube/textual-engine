// service symbols
export const INJECT_COUNTER = Symbol('inject-counter');
export const INJECT_LOADER = Symbol('inject-loader');
export const INJECT_LOCALE = Symbol('inject-locale');
export const INJECT_LOGGER = Symbol('inject-logger');
export const INJECT_PARSER = Symbol('inject-parser');
export const INJECT_RANDOM = Symbol('inject-random');
export const INJECT_RENDER = Symbol('inject-render');
export const INJECT_SCRIPT = Symbol('inject-script-ctrl');
export const INJECT_STATE = Symbol('inject-state-ctrl');
export const INJECT_TEMPLATE = Symbol('inject-template');

/**
 * Get the input for a particular actor.
 */
export const INJECT_INPUT_ACTOR = Symbol('inject-input-actor');

/**
 * Get the input for the player actor (shortcut to input-actor for the focused actor).
 */
export const INJECT_INPUT_PLAYER = Symbol('inject-input-player');
