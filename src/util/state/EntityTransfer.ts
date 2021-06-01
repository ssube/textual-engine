import { constructorName, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { searchState } from '.';
import { WorldEntity } from '../../model/entity';
import { Actor, isActor } from '../../model/entity/Actor';
import { isItem, Item } from '../../model/entity/Item';
import { isRoom, ROOM_TYPE } from '../../model/entity/Room';
import { WorldState } from '../../model/world/State';
import { INJECT_LOGGER } from '../../module';
import { ScriptContext } from '../../service/script';
import { SLOT_ENTER, SLOT_GET } from '../constants';

export interface TransferParams<TEntity extends WorldEntity> {
  /**
   * The entity to transfer.
   */
  moving: TEntity;

  /**
   * The source container from which `id` will be transferred.
   */
  source: string;

  /**
   * The target container into which `id` will be transferred.
   */
  target: string;
}

interface EntityTransferOptions extends BaseOptions {
  [INJECT_LOGGER]?: Logger;
}

@Inject(INJECT_LOGGER)
export class StateEntityTransfer {
  protected logger: Logger;
  protected state?: WorldState;

  constructor(options: EntityTransferOptions) {
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
  }

  public setState(state: WorldState): void {
    this.state = state;
  }

  /**
   * Move an actor from one room to another.
   */
  public async moveActor(transfer: TransferParams<Actor>, context: ScriptContext): Promise<void> {
    const state = mustExist(this.state);

    if (!isActor(transfer.moving)) {
      this.logger.warn(transfer, 'moving entity is not an actor');
      return;
    }

    const [target] = searchState(state, {
      meta: {
        id: transfer.target,
      },
      type: ROOM_TYPE,
    });
    if (!isRoom(target)) {
      this.logger.warn(transfer, 'destination room does not exist');
      return;
    }

    const [source] = searchState(state, {
      meta: {
        id: transfer.source,
      },
      type: ROOM_TYPE,
    });
    if (!isRoom(source)) {
      this.logger.warn(transfer, 'source room does not exist');
      return;
    }

    const idx = source.actors.indexOf(transfer.moving);
    if (idx < 0) {
      this.logger.warn({ source, transfer }, 'source does not directly contain moving entity');
      return;
    }

    // move the actor
    this.logger.debug(transfer, 'moving actor between rooms');
    source.actors.splice(idx, 1);
    target.actors.push(transfer.moving);

    await context.script.invoke(target, SLOT_ENTER, {
      ...context,
      actor: transfer.moving,
      data: new Map([
        ['source', transfer.source],
      ]),
    });
  }

  /**
   * Move an item from one actor or room to another.
   */
  public async moveItem(transfer: TransferParams<Item>, context: ScriptContext): Promise<void> {
    const state = mustExist(this.state);

    if (!isItem(transfer.moving)) {
      this.logger.warn({ transfer }, 'moving entity is not an item');
      return;
    }

    if (transfer.source === transfer.target) {
      this.logger.debug({ transfer }, 'cannot transfer item between the same source and target');
      return;
    }

    // find source entity
    const [source] = searchState(state, {
      meta: {
        id: transfer.source,
      },
    });

    // find target entity
    const [target] = searchState(state, {
      meta: {
        id: transfer.target,
      },
    });

    // ensure source and dest are both actor/room (types are greatly narrowed after these guards)
    if (isItem(source) || isItem(target)) {
      this.logger.warn({ source, target, transfer }, 'invalid source or target entity type');
      return;
    }

    const idx = source.items.indexOf(transfer.moving);
    if (idx < 0) {
      this.logger.warn({ source, transfer }, 'source does not directly contain moving entity');
      return;
    }

    // move target from source to dest
    this.logger.debug({
      source,
      target,
      transfer,
    }, 'moving item between entities');
    source.items.splice(idx, 1);
    target.items.push(transfer.moving);

    await context.script.invoke(target, SLOT_GET, {
      ...context,
      item: transfer.moving,
      data: new Map([
        ['source', transfer.source],
      ]),
    });
  }
}
