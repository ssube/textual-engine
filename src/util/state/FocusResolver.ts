import { doesExist, InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { BaseOptions } from 'noicejs';

import { findRoom, searchState } from '.';
import { WorldEntity } from '../../model/entity';
import { Actor, ACTOR_TYPE, isActor } from '../../model/entity/Actor';
import { ITEM_TYPE } from '../../model/entity/Item';
import { isRoom, Room, ROOM_TYPE } from '../../model/entity/Room';
import { State } from '../../model/State';
import { LocaleContext } from '../../service/locale';
import { ScriptFocus } from '../../service/script';

export type FocusChangeRoom = (room: Room) => Promise<void>;
export type FocusChangeActor = (actor: Actor) => Promise<void>;
export type FocusShow = (line: string, context?: LocaleContext) => Promise<void>;

interface FocusEvents {
  onActor: FocusChangeActor;
  onRoom: FocusChangeRoom;
  onShow: FocusShow;
}

interface StateFocusResolverOptions extends BaseOptions {
  events?: FocusEvents;
  state?: State;
}

export enum ShowMessageVolume {
  SELF = 'self', // narrowest scope
  ROOM = 'room',
  WORLD = 'world',
}

interface ShowSource {
  source: WorldEntity;
  volume: ShowMessageVolume;
}

/**
 * Manages the `focus` field within world state, along with filtering output based on the current focus.
 */
export class StateFocusResolver implements ScriptFocus {
  protected state: State;

  protected onActor: FocusChangeActor;
  protected onRoom: FocusChangeRoom;
  protected onShow: FocusShow;

  constructor(options: StateFocusResolverOptions) {
    this.state = mustExist(options.state);

    const events = mustExist(options.events);
    this.onActor = events.onActor;
    this.onRoom = events.onRoom;
    this.onShow = events.onShow;
  }

  public async setActor(id: string): Promise<void> {
    const [actor] = searchState(this.state, {
      meta: {
        id,
      },
      type: ACTOR_TYPE,
    });

    if (isActor(actor)) {
      this.state.focus.actor = id;

      await this.onActor(actor);
    } else {
      throw new InvalidArgumentError('unable to find actor ID in state');
    }
  }

  public async setRoom(id: string): Promise<void> {
    const [room] = searchState(this.state, {
      meta: {
        id,
      },
      type: ROOM_TYPE,
    });

    if (isRoom(room)) {
      this.state.focus.room = id;

      await this.onRoom(room);
    } else {
      throw new InvalidArgumentError('unable to find room ID in state');
    }
  }

  public async show(msg: string, context?: LocaleContext, source?: ShowSource): Promise<void> {
    if (doesExist(source) && this.showCheck(source) === false) {
      return;
    }

    await this.onShow(msg, context);
  }

  public showCheck(source: ShowSource): boolean {
    if (source.volume === ShowMessageVolume.SELF) {
      return source.source.meta.id === this.state.focus.actor; // currently focused actor
    }

    if (source.volume === ShowMessageVolume.ROOM) {
      if (source.source.type === ROOM_TYPE) {
        return source.source.meta.id === this.state.focus.room;
      } else {
        const rooms = findRoom(this.state, {
          meta: {
            id: source.source.meta.id,
          }
        });

        return doesExist(rooms.find((it) => it.meta.id === this.state.focus.room));
      }
    }

    return true;
  }
}
