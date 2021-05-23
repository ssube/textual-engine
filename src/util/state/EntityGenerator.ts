import { constructorName, isNil, mustExist, NotFoundError } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { Actor, ACTOR_TYPE, ActorType } from '../../model/entity/Actor';
import { Item, ITEM_TYPE } from '../../model/entity/Item';
import { Portal, PortalGroups } from '../../model/entity/Portal';
import { Room, ROOM_TYPE } from '../../model/entity/Room';
import { Metadata } from '../../model/meta/Metadata';
import { BaseTemplate, Template, TemplateMetadata } from '../../model/meta/Template';
import { World } from '../../model/World';
import { INJECT_COUNTER, INJECT_LOGGER, INJECT_RANDOM, INJECT_TEMPLATE } from '../../module';
import { RandomGenerator } from '../../service/random';
import { TemplateService } from '../../service/template';
import { randomItem } from '../array';
import { TEMPLATE_CHANCE } from '../constants';
import { Counter } from '../counter';
import { findByTemplateId } from '../template';

export interface EntityGeneratorOptions extends BaseOptions {
  [INJECT_COUNTER]?: Counter;
  [INJECT_LOGGER]?: Logger;
  [INJECT_RANDOM]?: RandomGenerator;
  [INJECT_TEMPLATE]?: TemplateService;

  world?: World;
}

@Inject(INJECT_COUNTER, INJECT_LOGGER, INJECT_RANDOM, INJECT_TEMPLATE)
export class StateEntityGenerator {
  protected counter: Counter;
  protected logger: Logger;
  protected random: RandomGenerator;
  protected template: TemplateService;

  protected world: World;

  constructor(options: EntityGeneratorOptions) {
    this.counter = mustExist(options[INJECT_COUNTER]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
    this.random = mustExist(options[INJECT_RANDOM]);
    this.template = mustExist(options[INJECT_TEMPLATE]);
    this.world = mustExist(options.world);
  }

  public async createActor(template: Template<Actor>, actorType = ActorType.DEFAULT): Promise<Actor> {
    const items = [];
    for (const itemTemplateRef of template.base.items) {
      if (this.random.nextInt(TEMPLATE_CHANCE) > itemTemplateRef.chance) {
        continue;
      }

      const itemTemplate = findByTemplateId(this.world.templates.items, itemTemplateRef.id);
      if (isNil(itemTemplate)) {
        throw new NotFoundError('invalid item in actor');
      }

      const item = await this.createItem(itemTemplate);
      items.push(item);
    }

    return {
      type: 'actor',
      actorType,
      items,
      meta: await this.createMetadata(template.base.meta, ACTOR_TYPE),
      skills: this.template.renderNumberMap(template.base.skills),
      slots: this.template.renderStringMap(template.base.slots),
      stats: this.template.renderNumberMap(template.base.stats),
    };
  }

  public async createItem(template: Template<Item>): Promise<Item> {
    return {
      type: ITEM_TYPE,
      meta: await this.createMetadata(template.base.meta, ITEM_TYPE),
      stats: this.template.renderNumberMap(template.base.stats),
      slots: this.template.renderStringMap(template.base.slots),
      verbs: this.template.renderVerbMap(template.base.verbs),
    };
  }

  public async createRoom(template: Template<Room>): Promise<Room> {
    const actors = [];
    for (const actorTemplateRef of template.base.actors) {
      if (this.random.nextInt(TEMPLATE_CHANCE) > actorTemplateRef.chance) {
        continue;
      }

      const actorTemplate = findByTemplateId(this.world.templates.actors, actorTemplateRef.id);
      this.logger.debug({
        actors: this.world.templates.actors,
        actorTemplateId: actorTemplateRef,
        actorTemplate,
      }, 'create actor for room');

      if (isNil(actorTemplate)) {
        throw new NotFoundError('invalid actor in room');
      }

      const actor = await this.createActor(actorTemplate);
      actors.push(actor);
    }

    const items = [];
    for (const itemTemplateRef of template.base.items) {
      if (this.random.nextInt(TEMPLATE_CHANCE) > itemTemplateRef.chance) {
        continue;
      }

      const itemTemplate = findByTemplateId(this.world.templates.items, itemTemplateRef.id);
      this.logger.debug({
        items: this.world.templates.items,
        itemTemplateId: itemTemplateRef,
        itemTemplate,
      }, 'create item for room');

      if (isNil(itemTemplate)) {
        throw new NotFoundError('invalid item in room');
      }

      const item = await this.createItem(itemTemplate);
      items.push(item);
    }

    return {
      type: ROOM_TYPE,
      actors,
      items,
      meta: await this.createMetadata(template.base.meta, ROOM_TYPE),
      portals: [],
      slots: this.template.renderStringMap(template.base.slots),
      verbs: this.template.renderVerbMap(template.base.verbs),
    };
  }

  public async createMetadata(template: TemplateMetadata, type: string): Promise<Metadata> {
    return {
      desc: this.template.renderString(template.desc),
      id: `${template.id}-${this.counter.next(type)}`,
      name: this.template.renderString(template.name),
      template: template.id,
    };
  }

  public async populateRoom(room: Room, depth: number): Promise<Array<Room>> {
    if (depth < 0) {
      return [];
    }

    // get template
    const templateRoom = findByTemplateId(mustExist(this.world).templates.rooms, room.meta.template);
    const templatePortals = templateRoom.base.portals.filter((it) => {
      this.logger.debug({ it, room }, 'looking for portal matching template in room');

      return room.portals.some((p) =>
        p.name === it.name.base && p.sourceGroup === it.sourceGroup.base
      ) === false;
    });

    if (templatePortals.length === 0) {
      this.logger.debug({ room }, 'portals have already been populated');
      return [];
    }

    // extend map
    this.logger.debug({
      portals: templatePortals,
      room,
    }, `populating ${templatePortals.length} new portals of ${templateRoom.base.portals.length} in room ${room.meta.id}`);

    const {portals, rooms} = await this.populatePortals(templatePortals, room.meta.id, depth);
    room.portals.push(...portals);

    return rooms;
  }

  /**
   * Gather portal destinations from a room by group.
   */
  protected groupPortals(portals: Array<BaseTemplate<Portal>>): PortalGroups {
    const groups: PortalGroups = new Map();

    for (const portal of portals) {
      this.logger.debug({
        portal,
      }, 'grouping portal');
      const groupName = this.template.renderString(portal.sourceGroup);
      const group = groups.get(groupName);

      if (group) {
        group.dests.add(this.template.renderString(portal.dest));
        group.portals.add(portal);
      } else {
        groups.set(groupName, {
          dests: new Set([
            this.template.renderString(portal.dest),
          ]),
          portals: new Set([portal]),
        });
      }
    }

    this.logger.debug({ groups: Object.fromEntries(groups.entries()) }, 'grouped portals');

    return groups;
  }

  protected async populatePortals(templates: Array<BaseTemplate<Portal>>, sourceId: string, depth: number): Promise<{
    portals: Array<Portal>;
    rooms: Array<Room>;
  }> {
    if (depth < 0) {
      return {
        portals: [],
        rooms: [],
      };
    }

    const groups = this.groupPortals(templates);
    const portals: Array<Portal> = [];
    const rooms: Array<Room> = [];

    for (const [sourceGroup, group] of groups) {
      const potentialDests = Array.from(group.dests);
      const destTemplateId = randomItem(potentialDests, this.random);
      const destTemplate = findByTemplateId(this.world.templates.rooms, destTemplateId);

      if (isNil(destTemplate)) {
        throw new NotFoundError('invalid room in portal dest');
      }

      this.logger.debug({ destTemplateId, group, sourceGroup }, 'linking source group to destination template');

      const destRoom = await this.createRoom(destTemplate);
      rooms.push(destRoom);

      for (const portal of group.portals) {
        const name = this.template.renderString(portal.name);
        const targetGroup = this.template.renderString(portal.targetGroup);

        portals.push({
          name,
          sourceGroup,
          targetGroup,
          dest: destRoom.meta.id,
        });

        destRoom.portals.push({
          name,
          sourceGroup: targetGroup,
          targetGroup: sourceGroup,
          dest: sourceId,
        });
      }

      const further = await this.populateRoom(destRoom, depth - 1);
      rooms.push(...further);
    }

    return {
      portals,
      rooms,
    };
  }
}
