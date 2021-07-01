import { InvalidArgumentError } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { isActor, ReadonlyActor } from '../../model/entity/Actor';
import { isItem, ReadonlyItem } from '../../model/entity/Item';
import { isRoom, ReadonlyRoom } from '../../model/entity/Room';
import { INJECT_LOGGER, InjectedOptions } from '../../module';
import { ScriptContext } from '../../service/script';
import { SIGNAL_ENTER, SIGNAL_GET } from '../constants';
import { makeServiceLogger } from '../service';

export interface ActorTransfer {
  moving: ReadonlyActor;
  source: ReadonlyRoom;
  target: ReadonlyRoom;
}

export interface ItemTransfer {
  moving: ReadonlyItem;
  source: ReadonlyActor | ReadonlyRoom;
  target: ReadonlyActor | ReadonlyRoom;
}

@Inject(INJECT_LOGGER)
export class StateEntityTransfer {
  protected logger: Logger;

  constructor(options: InjectedOptions) {
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);
  }

  /**
   * Move an actor from one room to another.
   */
  public async moveActor(transfer: ActorTransfer, context: ScriptContext): Promise<void> {
    const { moving, source, target } = transfer;

    if (!isActor(moving)) {
      throw new InvalidArgumentError('moving entity must be an actor');
    }

    if (!isRoom(source)) {
      throw new InvalidArgumentError('source entity must be a room');
    }

    if (!isRoom(target)) {
      throw new InvalidArgumentError('target entity must be a room');
    }

    const idx = source.actors.indexOf(moving);
    if (idx < 0) {
      throw new InvalidArgumentError('source entity does not contain moving entity');
    }

    // move the actor
    this.logger.debug(transfer, 'moving actor between rooms');

    // TODO: should not mutate here
    (source.actors as Array<ReadonlyActor>).splice(idx, 1);
    (target.actors as Array<ReadonlyActor>).push(transfer.moving);

    await context.state.enter({
      actor: moving,
      room: target,
    });

    await context.script.invoke(target, SIGNAL_ENTER, {
      ...context,
      actor: transfer.moving,
      data: new Map([
        ['source', transfer.source.meta.id],
        ['target', transfer.target.meta.id],
      ]),
    });
  }

  /**
   * Move an item from one actor or room to another.
   */
  public async moveItem(transfer: ItemTransfer, context: ScriptContext): Promise<void> {
    const { moving, source, target } = transfer;

    if (!isItem(moving)) {
      throw new InvalidArgumentError('moving entity must be an item');
    }

    if (isItem(source)) {
      throw new InvalidArgumentError('source entity must be an actor or room');
    }

    if (isItem(target)) {
      throw new InvalidArgumentError('target entity must be an actor or room');
    }

    // check this before the more expensive indexOf
    if (source === target) {
      this.logger.debug({ transfer }, 'source and target entity are the same, skipping transfer');
      return;
    }

    const idx = source.items.indexOf(moving);
    if (idx < 0) {
      throw new InvalidArgumentError('source entity does not contain moving entity');
    }

    // move target from source to dest
    this.logger.debug({
      source,
      target,
      transfer,
    }, 'moving item between entities');

    // TODO: mutate elsewhere
    (source.items as Array<ReadonlyItem>).splice(idx, 1);
    (target.items as Array<ReadonlyItem>).push(moving);

    await context.script.invoke(target, SIGNAL_GET, {
      ...context,
      item: moving,
      data: new Map([
        ['source', source.meta.id],
        ['target', target.meta.id],
      ]),
    });
  }
}

export function isActorTransfer(tx: ActorTransfer | ItemTransfer): tx is ActorTransfer {
  return isActor(tx.moving);
}

export function isItemTransfer(tx: ActorTransfer | ItemTransfer): tx is ItemTransfer {
  return isItem(tx.moving);
}
