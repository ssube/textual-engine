import { InvalidTargetError } from 'noicejs';

import { WorldEntity } from '../../model/entity';
import { Actor, ACTOR_TYPE, isActor } from '../../model/entity/Actor';
import { isRoom, Room, ROOM_TYPE } from '../../model/entity/Room';
import { LocaleContext } from '../../model/file/Locale';
import { State } from '../../model/State';
import { searchState } from './search';

export type RoomFocusChange = (room: Room) => Promise<void>;
export type ActorFocusChange = (actor: Actor) => Promise<void>;

export class StateFocusBuffer {
  protected buffer: Array<string>;
  protected state: State;

  protected onActor: ActorFocusChange;
  protected onRoom: RoomFocusChange;

  constructor(state: State, onActor: ActorFocusChange, onRoom: RoomFocusChange) {
    this.buffer = [];
    this.state = state;

    this.onActor = onActor;
    this.onRoom = onRoom;
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

  public async show(msg: string, _context?: LocaleContext, _source?: WorldEntity): Promise<void> {
    this.buffer.push(msg); // TODO: translate before sending to render?
  }

  public flush(): Array<string> {
    const result = this.buffer;
    this.buffer = [];
    return result;
  }
}
