// numeric
export const BYTE_RANGE = 255;
export const PORTAL_DEPTH = 4;
export const TEMPLATE_CHANCE = 100;

// meta commands
export const META_DEBUG = 'verbs.meta.debug';
export const META_GRAPH = 'verbs.meta.graph';
export const META_HELP = 'verbs.meta.help';
export const META_LOAD = 'verbs.meta.load';
export const META_QUIT = 'verbs.meta.quit';
export const META_SAVE = 'verbs.meta.save';

// script slots
export const SLOT_ENTER = 'enter';
export const SLOT_GET = 'get';
export const SLOT_HIT = 'hit';
export const SLOT_STEP = 'step';
export const SLOT_USE = 'use';

// common verbs
export const VERB_DROP = 'verbs.common.drop';
export const VERB_HIT = 'verbs.common.hit';
export const VERB_LOOK = 'verbs.common.look';
export const VERB_MOVE = 'verbs.common.move';
export const VERB_TAKE = 'verbs.common.take';
export const VERB_USE = 'verbs.common.use';
export const VERB_WAIT = 'verbs.common.wait';

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
  META_LOAD,
  META_QUIT,
  META_SAVE,
  VERB_DROP,
  VERB_HIT,
  VERB_LOOK,
  VERB_MOVE,
  VERB_TAKE,
  VERB_USE,
  VERB_WAIT,
];
