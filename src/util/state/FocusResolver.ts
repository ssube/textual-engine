import { mustExist } from '@apextoaster/js-utils';
import { BaseOptions, InvalidTargetError } from 'noicejs';

import { searchState } from '.';
import { WorldEntity } from '../../model/entity';
import { Actor, ACTOR_TYPE, isActor } from '../../model/entity/Actor';
import { isRoom, Room, ROOM_TYPE } from '../../model/entity/Room';
import { LocaleContext } from '../../model/file/Locale';
import { State } from '../../model/State';
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
      throw new InvalidTargetError('unable to find actor ID in state');
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
      throw new InvalidTargetError('unable to find room ID in state');
    }
  }

  /**
   * @todo filter output to the room/actor with focus
   */
  public async show(msg: string, context?: LocaleContext, _source?: WorldEntity): Promise<void> {
    await this.onShow(msg, context);
  }
}
