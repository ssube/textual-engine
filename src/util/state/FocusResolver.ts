import { doesExist, InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { BaseOptions } from 'noicejs';

import { findRoom, searchState } from '.';
import { WorldEntity } from '../../model/entity';
import { Actor, ACTOR_TYPE, isActor } from '../../model/entity/Actor';
import { isRoom, Room, ROOM_TYPE } from '../../model/entity/Room';
import { State } from '../../model/State';
import { LocaleContext } from '../../service/locale';

export type FocusChangeRoom = (room: Room) => Promise<void>;
export type FocusChangeActor = (actor: Actor) => Promise<void>;
export type FocusQuit = () => Promise<void>;
export type FocusShow = (line: string, context?: LocaleContext) => Promise<void>;

export interface FocusEvents {
  onActor: FocusChangeActor;
  onQuit: FocusQuit;
  onRoom: FocusChangeRoom;
  onShow: FocusShow;
}

export enum ShowMessageVolume {
  SELF = 'self', // narrowest scope
  ROOM = 'room',
  WORLD = 'world',
}

export interface ShowSource {
  source: WorldEntity;
  volume: ShowMessageVolume;
}

interface StateFocusResolverOptions extends BaseOptions {
  events?: FocusEvents;
  state?: State;
}

/**
 * Manages the `focus` field within world state, along with filtering output based on the current focus.
 */
export class StateFocusResolver {
  protected onActor: FocusChangeActor;
  protected onQuit: FocusQuit;
  protected onRoom: FocusChangeRoom;
  protected onShow: FocusShow;

  protected state?: State;

  constructor(options: StateFocusResolverOptions) {
    const events = mustExist(options.events);
    this.onActor = events.onActor;
    this.onQuit = events.onQuit;
    this.onRoom = events.onRoom;
    this.onShow = events.onShow;
  }

  public setState(state: State): void {
    this.state = state;
  }

  /**
   * Set the currently-focused actor.
   */
  public async setActor(id: string): Promise<void> {
    const state = mustExist(this.state);
    const [actor] = searchState(state, {
      meta: {
        id,
      },
      type: ACTOR_TYPE,
    });

    if (isActor(actor)) {
      state.focus.actor = id;

      await this.onActor(actor);
    } else {
      throw new InvalidArgumentError('unable to find actor ID in state');
    }
  }

  /**
   * Set the currently-focused room.
   */
  public async setRoom(id: string): Promise<void> {
    const state = mustExist(this.state);
    const [room] = searchState(state, {
      meta: {
        id,
      },
      type: ROOM_TYPE,
    });

    if (isRoom(room)) {
      state.focus.room = id;

      await this.onRoom(room);
    } else {
      throw new InvalidArgumentError('unable to find room ID in state');
    }
  }

  public async quit(): Promise<void> {
    await this.onQuit();
  }

  /**
   * Display a message from an entity.
   */
  public async show(msg: string, context?: LocaleContext, source?: ShowSource): Promise<void> {
    if (doesExist(source) && this.showCheck(source) === false) {
      return;
    }

    await this.onShow(msg, context);
  }

  public showCheck(source: ShowSource): boolean {
    const state = mustExist(this.state);
    if (source.volume === ShowMessageVolume.SELF) {
      return source.source.meta.id === state.focus.actor; // currently focused actor
    }

    if (source.volume === ShowMessageVolume.ROOM) {
      if (source.source.type === ROOM_TYPE) {
        return source.source.meta.id === state.focus.room;
      } else {
        const rooms = findRoom(state, {
          meta: {
            id: source.source.meta.id,
          }
        });

        return doesExist(rooms.find((it) => it.meta.id === state.focus.room));
      }
    }

    return true;
  }
}
