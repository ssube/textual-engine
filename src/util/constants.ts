// numeric
export const BYTE_RANGE = 255;
export const PORTAL_DEPTH = 4;

// meta commands
export const META_DEBUG = 'debug';
export const META_GRAPH = 'graph';
export const META_HELP = 'help';
export const META_QUIT = 'quit';

// script slots
export const SLOT_ENTER = 'enter';
export const SLOT_HIT = 'hit';
export const SLOT_STEP = 'step';
export const SLOT_USE = 'use';

// common verbs
export const VERB_DROP = 'drop';
export const VERB_HIT = 'hit';
export const VERB_LOOK = 'look';
export const VERB_MOVE = 'move';
export const VERB_TAKE = 'take';
export const VERB_USE = 'use';
export const VERB_WAIT = 'wait';

/**
 * Common verbs and meta commands.
 *
 * Should include all `META_*` and `VERB_*` constants from this file.
 * Should really be replaced with config data.
 */
export const KNOWN_VERBS = [
  META_DEBUG,
  META_GRAPH,
  META_HELP,
  META_QUIT,
  VERB_DROP,
  VERB_HIT,
  VERB_LOOK,
  VERB_MOVE,
  VERB_TAKE,
  VERB_USE,
  VERB_WAIT,
];
