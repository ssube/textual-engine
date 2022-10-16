import { InvalidArgumentError, isNone } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { isActor, ReadonlyActor } from '../../model/entity/Actor.js';
import { isItem, ReadonlyItem } from '../../model/entity/Item.js';
import { isRoom, ReadonlyRoom } from '../../model/entity/Room.js';
import { INJECT_LOGGER, InjectedOptions } from '../../module/index.js';
import { ScriptContext } from '../../service/script/index.js';
import { remove } from '../collection/array.js';
import { SIGNAL_ENTER, SIGNAL_GET } from '../constants.js';
import { makeServiceLogger } from '../service/index.js';

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

export interface RoomTransfer {
  moving: undefined;
  source: ReadonlyRoom;
  target: ReadonlyRoom;
}

export type EntityTransfer = ActorTransfer | ItemTransfer | RoomTransfer;

export function isActorTransfer(tx: EntityTransfer): tx is ActorTransfer {
  return isActor(tx.moving);
}

export function isItemTransfer(tx: EntityTransfer): tx is ItemTransfer {
  return isItem(tx.moving);
}

export function isRoomTransfer(tx: EntityTransfer): tx is RoomTransfer {
  return isNone(tx.moving);
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

    const sourceActors = remove(source.actors, (it) => it.meta.id === moving.meta.id);
    await context.state.update(source, { actors: sourceActors });

    const targetActors = [...target.actors, transfer.moving];
    await context.state.update(target, { actors: targetActors });

    this.logger.debug(transfer, 'sending room entry signal');

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
    this.logger.debug(transfer, 'moving item between entities');

    const sourceItems = remove(source.items, (it) => it.meta.id === moving.meta.id);
    await context.state.update(source, { items: sourceItems });

    const targetItems = [...target.items, transfer.moving];
    await context.state.update(target, { items: targetItems });

    this.logger.debug(transfer, 'sending item get signal');

    await context.script.invoke(target, SIGNAL_GET, {
      ...context,
      item: moving,
      data: new Map([
        ['source', source.meta.id],
        ['target', target.meta.id],
      ]),
    });
  }

  public async moveRoom(transfer: RoomTransfer, context: ScriptContext): Promise<void> {
    const { source, target } = transfer;

    if (!isRoom(source)) {
      throw new InvalidArgumentError('source entity must be a room');
    }

    if (!isRoom(target)) {
      throw new InvalidArgumentError('target entity must be a room');
    }

    this.logger.debug(transfer, 'moving all entities between rooms');

    const movingActors = Array.from(source.actors);
    const movingItems = Array.from(source.items);
    await context.state.update(source, {
      actors: [],
      items: [],
    });

    const actors = [...target.actors, ...movingActors];
    const items = [...target.items, ...movingItems];
    await context.state.update(target, {
      actors,
      items,
    });

    for (const moving of movingActors) {
      await context.state.enter({
        actor: moving,
        room: target,
      });

      await context.script.invoke(target, SIGNAL_ENTER, {
        ...context,
        actor: moving,
        data: new Map([
          ['source', source.meta.id],
          ['target', target.meta.id],
        ]),
      });
    }

    for (const moving of movingItems) {
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
}
