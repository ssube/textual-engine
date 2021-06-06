// numeric
export const BYTE_RANGE = 255;
export const HISTORY_SIZE = 20;
export const PORTAL_DEPTH = 4;
export const RENDER_DELAY = 50;
export const TEMPLATE_CHANCE = 100;

// common events
export const EVENT_COMMON_ERROR = 'error';
export const EVENT_COMMON_QUIT = 'quit';

// service events
export const EVENT_ACTOR_COMMAND = 'actor-command';
export const EVENT_ACTOR_JOIN = 'actor-join';
export const EVENT_ACTOR_OUTPUT = 'actor-output';
export const EVENT_ACTOR_ROOM = 'actor-room';
export const EVENT_LOCALE_BUNDLE = 'locale-bundle';
export const EVENT_LOADER_CONFIG = 'loader-config';
export const EVENT_LOADER_DONE = 'loader-done';
export const EVENT_LOADER_READ = 'loader-read';
export const EVENT_LOADER_SAVE = 'loader-save';
export const EVENT_LOADER_STATE = 'loader-state';
export const EVENT_LOADER_WORLD = 'loader-world';
export const EVENT_RENDER_OUTPUT = 'render-output';
export const EVENT_STATE_JOIN = 'state-join';
export const EVENT_STATE_LOAD = 'state-load';
export const EVENT_STATE_OUTPUT = 'state-output';
export const EVENT_STATE_ROOM = 'state-room';
export const EVENT_STATE_STEP = 'state-step';

export const EVENT_NAMES = [
  EVENT_ACTOR_COMMAND,
  EVENT_ACTOR_JOIN,
  EVENT_ACTOR_OUTPUT,
  EVENT_ACTOR_ROOM,
  EVENT_COMMON_ERROR,
  EVENT_COMMON_QUIT,
  EVENT_LOADER_CONFIG,
  EVENT_LOADER_READ,
  EVENT_LOADER_SAVE,
  EVENT_LOADER_STATE,
  EVENT_LOADER_WORLD,
  EVENT_LOCALE_BUNDLE,
  EVENT_RENDER_OUTPUT,
  EVENT_STATE_JOIN,
  EVENT_STATE_LOAD,
  EVENT_STATE_OUTPUT,
  EVENT_STATE_ROOM,
  EVENT_STATE_STEP,
] as const;

// script signals
export const SIGNAL_PREFIX = 'signal.';

export const SIGNAL_ENTER = 'signal.enter';
export const SIGNAL_GET = 'signal.get';
export const SIGNAL_HIT = 'signal.hit';
export const SIGNAL_STEP = 'signal.step';
export const SIGNAL_USE = 'signal.use';

// common verbs
export const VERB_PREFIX = 'verbs.';

export const VERB_DROP = 'verbs.common.drop';
export const VERB_HIT = 'verbs.common.hit';
export const VERB_LOOK = 'verbs.common.look';
export const VERB_MOVE = 'verbs.common.move';
export const VERB_TAKE = 'verbs.common.take';
export const VERB_USE = 'verbs.common.use';
export const VERB_WAIT = 'verbs.common.wait';

// meta commands
export const META_CREATE = 'verbs.meta.create';
export const META_DEBUG = 'verbs.meta.debug';
export const META_GRAPH = 'verbs.meta.graph';
export const META_HELP = 'verbs.meta.help';
export const META_LOAD = 'verbs.meta.load';
export const META_QUIT = 'verbs.meta.quit';
export const META_SAVE = 'verbs.meta.save';
export const META_WORLDS = 'verbs.meta.worlds';

export const META_VERBS = [
  META_CREATE,
  META_DEBUG,
  META_GRAPH,
  META_HELP,
  META_LOAD,
  META_QUIT,
  META_SAVE,
  META_WORLDS,
];

/**
 * Common verbs and meta commands.
 *
 * Should include all `META_*` and `VERB_*` constants from this file.
 */
export const COMMON_VERBS = [
  ...META_VERBS,
  VERB_DROP,
  VERB_HIT,
  VERB_LOOK,
  VERB_MOVE,
  VERB_TAKE,
  VERB_USE,
  VERB_WAIT,
] as const;

// common stats
export const STAT_HEALTH = 'health';
export const STAT_DAMAGE = 'damage';

export const COMMON_STATS = [
  STAT_HEALTH,
  STAT_DAMAGE,
] as const;
