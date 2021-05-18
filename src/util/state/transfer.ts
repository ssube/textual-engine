import { Logger } from 'noicejs';

import { isActor } from '../../model/entity/Actor';
import { isItem } from '../../model/entity/Item';
import { isRoom, ROOM_TYPE } from '../../model/entity/Room';
import { State } from '../../model/State';
import { ScriptContext, TransferParams } from '../../service/script';
import { SLOT_ENTER } from '../constants';
import { searchState, searchStateString } from './search';

export class StateEntityTransfer {
  protected logger: Logger;
  protected state: State;

  constructor(logger: Logger, state: State) {
    this.logger = logger;
    this.state = state;
  }

  public async moveActor(transfer: TransferParams, context: ScriptContext): Promise<void> {
    const [targetRoom] = searchState(this.state, {
      meta: {
        id: transfer.target,
      },
      type: ROOM_TYPE,
    });
    if (!isRoom(targetRoom)) {
      this.logger.warn(transfer, 'destination room does not exist');
      return;
    }

    const [currentRoom] = searchState(this.state, {
      meta: {
        id: transfer.source,
      },
      type: ROOM_TYPE,
    });

    if (!isRoom(currentRoom)) {
      this.logger.warn(transfer, 'source room does not exist');
      return;
    }

    const targetActor = currentRoom.actors.find((it) => it.meta.id === transfer.moving);
    if (!isActor(targetActor)) {
      this.logger.warn(transfer, 'target actor does not exist');
      return;
    }

    // move the actor
    this.logger.debug(transfer, 'moving actor between rooms');
    currentRoom.actors.splice(currentRoom.actors.indexOf(targetActor), 1);
    targetRoom.actors.push(targetActor);

    await context.script.invoke(targetRoom, SLOT_ENTER, {
      actor: targetActor,
      data: {
        source: transfer.source,
      },
      focus: context.focus,
      transfer: this,
      state: this.state,
    });
  }

  public async moveItem(transfer: TransferParams, _context: ScriptContext): Promise<void> {
    if (transfer.source === transfer.target) {
      this.logger.debug(transfer, 'cannot transfer item between the same source and target');
      return;
    }

    // find source entity
    const [source] = searchState(this.state, {
      meta: {
        id: transfer.source,
      },
    });

    // find target entity
    const [target] = searchState(this.state, {
      meta: {
        id: transfer.target,
      },
    });

    // find moving item
    const [moving] = searchStateString(this.state, {
      meta: transfer.moving,
    });

    // ensure source and dest are both actor/room (types are greatly narrowed after these guards)
    if (isItem(source) || isItem(target) || !isItem(moving)) {
      this.logger.warn({ moving, source, target }, 'invalid entity type for item transfer');
      return;
    }

    const idx = source.items.indexOf(moving);
    if (idx < 0) {
      this.logger.warn({ moving, source }, 'source does not directly contain moving entity');
      return;
    }

    // move target from source to dest
    this.logger.debug({
      moving,
      source,
      target,
    }, 'moving item between entities');
    source.items.splice(idx, 1);
    target.items.push(moving);
  }
}
