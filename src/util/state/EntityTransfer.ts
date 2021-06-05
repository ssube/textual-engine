import { constructorName, InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { Actor, isActor } from '../../model/entity/Actor';
import { isItem, Item } from '../../model/entity/Item';
import { isRoom, Room } from '../../model/entity/Room';
import { WorldState } from '../../model/world/State';
import { INJECT_LOGGER } from '../../module';
import { ScriptContext } from '../../service/script';
import { SIGNAL_ENTER, SIGNAL_GET } from '../constants';

export interface ActorTransfer {
  moving: Actor;
  source: Room;
  target: Room;
}

export interface ItemTransfer {
  moving: Item;
  source: Actor | Room;
  target: Actor | Room;
}

interface EntityTransferOptions extends BaseOptions {
  [INJECT_LOGGER]?: Logger;
}

@Inject(INJECT_LOGGER)
export class StateEntityTransfer {
  protected logger: Logger;

  constructor(options: EntityTransferOptions) {
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
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
    source.actors.splice(idx, 1);
    target.actors.push(transfer.moving);

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
    source.items.splice(idx, 1);
    target.items.push(moving);

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
