import { Room } from './entity/Room';

export enum ReactionConfig {
  PLAYER_FIRST = 'player',
  REACTION_STAT = 'reaction',
}

export enum SidebarConfig {
  NEVER_OPEN = 'never',
  ALWAYS_OPEN = 'always',
}

/**
 * @todo needs a better name
 */
export interface State {
  config: {
    reaction: ReactionConfig;
    seed: string;
    sidebar: SidebarConfig;
    world: string;
  };

  focus: {
    actor: string;
    room: string;
  };

  input: Map<string, Array<string>>;
  rooms: Array<Room>;
}
