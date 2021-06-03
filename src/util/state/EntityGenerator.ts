import { constructorName, isNil, mergeMap, mustExist, NotFoundError } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';
import { WorldEntityType } from '../../model/entity';

import { Actor, ACTOR_TYPE, ActorType } from '../../model/entity/Actor';
import { Item, ITEM_TYPE } from '../../model/entity/Item';
import { Portal, PortalGroups, PortalLinkage } from '../../model/entity/Portal';
import { Room, ROOM_TYPE } from '../../model/entity/Room';
import { BaseModifier, Modifier, ModifierMetadata } from '../../model/mapped/Modifier';
import { BaseTemplate, Template, TemplateMetadata, TemplatePrimitive, TemplateRef } from '../../model/mapped/Template';
import { Metadata } from '../../model/Metadata';
import { WorldTemplate } from '../../model/world/Template';
import { INJECT_COUNTER, INJECT_LOGGER, INJECT_RANDOM, INJECT_TEMPLATE } from '../../module';
import { Counter } from '../../service/counter';
import { RandomGenerator } from '../../service/random';
import { TemplateService } from '../../service/template';
import { randomItem } from '../collection/array';
import { TEMPLATE_CHANCE } from '../constants';
import { findByTemplateId } from '../template';
import { ScriptMap } from '../types';

export interface EntityGeneratorOptions extends BaseOptions {
  [INJECT_COUNTER]?: Counter;
  [INJECT_LOGGER]?: Logger;
  [INJECT_RANDOM]?: RandomGenerator;
  [INJECT_TEMPLATE]?: TemplateService;
}

@Inject(INJECT_COUNTER, INJECT_LOGGER, INJECT_RANDOM, INJECT_TEMPLATE)
export class StateEntityGenerator {
  protected counter: Counter;
  protected logger: Logger;
  protected random: RandomGenerator;
  protected template: TemplateService;

  protected world?: WorldTemplate;

  constructor(options: EntityGeneratorOptions) {
    this.counter = mustExist(options[INJECT_COUNTER]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
    this.random = mustExist(options[INJECT_RANDOM]);
    this.template = mustExist(options[INJECT_TEMPLATE]);
  }

  public getWorld(): WorldTemplate {
    return mustExist(this.world);
  }

  public setWorld(world: WorldTemplate): void {
    this.world = world;
  }

  // take ID and look up template?
  public async createActor(template: Template<Actor>, actorType = ActorType.DEFAULT): Promise<Actor> {
    const actor: Actor = {
      type: 'actor',
      actorType,
      items: await this.createItemList(template.base.items),
      meta: await this.createMetadata(template.base.meta, ACTOR_TYPE),
      scripts: await this.createScripts(template.base.scripts, ACTOR_TYPE),
      stats: this.template.renderNumberMap(template.base.stats),
    };

    await this.modifyActor(actor, template.mods);

    return actor;
  }

  public async createActorList(templates: Array<TemplateRef>): Promise<Array<Actor>> {
    const world = this.getWorld();
    const actors = [];

    for (const templateRef of templates) {
      if (this.random.nextInt(TEMPLATE_CHANCE) > templateRef.chance) {
        continue;
      }

      const template = findByTemplateId(world.templates.actors, templateRef.id);
      this.logger.debug({
        template,
        templateRef,
      }, 'create actor for list');

      if (isNil(template)) {
        throw new NotFoundError('invalid item in room');
      }

      const item = await this.createActor(template);
      actors.push(item);
    }

    return actors;
  }

  public async createItem(template: Template<Item>): Promise<Item> {
    const item: Item = {
      type: ITEM_TYPE,
      meta: await this.createMetadata(template.base.meta, ITEM_TYPE),
      stats: this.template.renderNumberMap(template.base.stats),
      scripts: await this.createScripts(template.base.scripts, ITEM_TYPE),
    };

    await this.modifyItem(item, template.mods);

    return item;
  }

  public async createItemList(templates: Array<TemplateRef>): Promise<Array<Item>> {
    const world = this.getWorld();
    const items = [];

    for (const templateRef of templates) {
      if (this.random.nextInt(TEMPLATE_CHANCE) > templateRef.chance) {
        continue;
      }

      const template = findByTemplateId(world.templates.items, templateRef.id);
      this.logger.debug({
        template,
        templateRef,
      }, 'create item for list');

      if (isNil(template)) {
        throw new NotFoundError('invalid item in room');
      }

      const item = await this.createItem(template);
      items.push(item);
    }

    return items;
  }

  public async createRoom(template: Template<Room>): Promise<Room> {
    const room: Room = {
      type: ROOM_TYPE,
      actors: await this.createActorList(template.base.actors),
      items: await this.createItemList(template.base.items),
      meta: await this.createMetadata(template.base.meta, ROOM_TYPE),
      portals: [],
      scripts: await this.createScripts(template.base.scripts, ROOM_TYPE),
    };

    await this.modifyRoom(room, template.mods);

    return room;
  }

  public async createMetadata(template: TemplateMetadata, type: string): Promise<Metadata> {
    return {
      desc: this.template.renderString(template.desc),
      id: `${template.id}-${this.counter.next(type)}`,
      name: this.template.renderString(template.name),
      template: template.id,
    };
  }

  public async createScripts(template: TemplatePrimitive<ScriptMap>, type: WorldEntityType): Promise<ScriptMap> {
    const world = this.getWorld();
    const baseScripts = this.template.renderScriptMap(world.defaults[type].scripts);
    const scripts = this.template.renderScriptMap(template);
    return mergeMap(baseScripts, scripts);
  }

  /**
   * Select some modifiers and mutate the given actor.
   */
  public async modifyActor(target: Actor, available: Array<Modifier<Actor>>): Promise<void> {
    const selected = this.selectModifiers(available);

    for (const mod of selected) {
      await this.modifyMetadata(target.meta, mod.meta);
      // target.actorType cannot be modified

      target.stats = this.template.modifyNumberMap(target.stats, mod.stats);
      target.scripts = this.template.modifyScriptMap(target.scripts, mod.scripts);

      const items = await this.createItemList(mod.items);
      target.items.push(...items);
    }
  }

  /**
   * Select some modifiers and mutate the given item.
   */
  public async modifyItem(target: Item, available: Array<Modifier<Item>>): Promise<void> {
    const selected = this.selectModifiers(available);

    for (const mod of selected) {
      await this.modifyMetadata(target.meta, mod.meta);

      target.stats = this.template.modifyNumberMap(target.stats, mod.stats);
      target.scripts = this.template.modifyScriptMap(target.scripts, mod.scripts);
    }
  }

  /**
   * Select some modifiers and mutate the given room.
   */
  public async modifyRoom(target: Room, available: Array<Modifier<Room>>): Promise<void> {
    const selected = this.selectModifiers(available);

    for (const mod of selected) {
      await this.modifyMetadata(target.meta, mod.meta);

      // TODO: target.portals
      target.scripts = this.template.modifyScriptMap(target.scripts, mod.scripts);

      const actors = await this.createActorList(mod.actors);
      target.actors.push(...actors);

      const items = await this.createItemList(mod.items);
      target.items.push(...items);
    }
  }

  public async modifyMetadata(target: Metadata, mod: ModifierMetadata): Promise<void> {
    target.desc = this.template.modifyString(target.desc, mod.desc);
    target.name = this.template.modifyString(target.name, mod.name);
  }

  public selectModifiers<TBase>(mods: Array<Modifier<TBase>>): Array<BaseModifier<TBase>> {
    const excluded = new Set<string>();
    const selected = [];

    for (const mod of mods) {
      if (excluded.has(mod.id)) {
        continue;
      }

      const roll = this.random.nextInt(TEMPLATE_CHANCE);
      if (roll > mod.chance) {
        continue;
      }

      selected.push(mod.base);

      for (const e of mod.excludes) {
        excluded.add(e);
      }
    }

    return selected;
  }

  public async populateRoom(room: Room, depth: number): Promise<Array<Room>> {
    if (depth < 0) {
      return [];
    }

    const world = this.getWorld();

    // get template
    const templateRoom = findByTemplateId(world.templates.rooms, room.meta.template);
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

    // TODO: populate rooms here to avoid large-world stack overflows, first with direct recursion, then tail recursion
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

    const world = this.getWorld();
    const groups = this.groupPortals(templates);
    const portals: Array<Portal> = [];
    const rooms: Array<Room> = [];

    for (const [sourceGroup, group] of groups) {
      const potentialDests = Array.from(group.dests);
      const destTemplateId = randomItem(potentialDests, this.random);
      const destTemplate = findByTemplateId(world.templates.rooms, destTemplateId);

      if (isNil(destTemplate)) {
        throw new NotFoundError('invalid room in portal dest');
      }

      this.logger.debug({ destTemplateId, group, sourceGroup }, 'linking source group to destination template');

      const destRoom = await this.createRoom(destTemplate);
      rooms.push(destRoom);

      for (const portal of group.portals) {
        const link = this.template.renderString(portal.link) as PortalLinkage;
        const name = this.template.renderString(portal.name);
        const targetGroup = this.template.renderString(portal.targetGroup);

        portals.push({
          dest: destRoom.meta.id,
          link,
          name,
          sourceGroup,
          targetGroup,
        });

        if (link === PortalLinkage.BOTH) {
          destRoom.portals.push({
            dest: sourceId,
            link,
            name,
            sourceGroup: targetGroup,
            targetGroup: sourceGroup,
          });
        }
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
