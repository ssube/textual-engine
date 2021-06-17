import { doesExist, isNil, mergeMap, mustExist, NotFoundError, setOrPush } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { WorldEntityType } from '../../model/entity';
import { Actor, ACTOR_TYPE, ActorSource } from '../../model/entity/Actor';
import { Item, ITEM_TYPE } from '../../model/entity/Item';
import { Portal, PORTAL_TYPE, PortalLinkage } from '../../model/entity/Portal';
import { Room, ROOM_TYPE } from '../../model/entity/Room';
import { BaseModifier, Modifier, ModifierMetadata } from '../../model/mapped/Modifier';
import { Template, TemplateMetadata, TemplatePrimitive, TemplateRef } from '../../model/mapped/Template';
import { Metadata } from '../../model/Metadata';
import { WorldState } from '../../model/world/State';
import { WorldTemplate } from '../../model/world/Template';
import { INJECT_COUNTER, INJECT_LOGGER, INJECT_RANDOM, INJECT_TEMPLATE, InjectedOptions } from '../../module';
import { Counter } from '../../service/counter';
import { RandomGenerator } from '../../service/random';
import { CreateParams } from '../../service/state';
import { TemplateService } from '../../service/template';
import { randomItem } from '../collection/array';
import { TEMPLATE_CHANCE } from '../constants';
import { makeServiceLogger } from '../service';
import { matchIdSegments } from '../string';
import { findByBaseId } from '../template';
import { ScriptMap } from '../types';

@Inject(INJECT_COUNTER, INJECT_LOGGER, INJECT_RANDOM, INJECT_TEMPLATE)
export class StateEntityGenerator {
  protected counter: Counter;
  protected logger: Logger;
  protected random: RandomGenerator;
  protected template: TemplateService;

  protected world?: WorldTemplate;

  constructor(options: InjectedOptions) {
    this.counter = mustExist(options[INJECT_COUNTER]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);
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
  public async createActor(template: Template<Actor>, source = ActorSource.BEHAVIOR): Promise<Actor> {
    const actor: Actor = {
      type: 'actor',
      source,
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

      const template = findByBaseId(world.templates.actors, templateRef.id);
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

      const template = findByBaseId(world.templates.items, templateRef.id);
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

  public async createMetadata(template: TemplateMetadata, type: string): Promise<Metadata> {
    return {
      desc: this.template.renderString(template.desc),
      id: `${template.id}-${this.counter.next(type)}`,
      name: this.template.renderString(template.name),
      template: template.id,
    };
  }

  public async createPortal(template: Template<Portal>): Promise<Portal> {
    const portal: Portal = {
      dest: '',
      groupKey: this.template.renderString(template.base.groupKey),
      groupSource: this.template.renderString(template.base.groupSource),
      groupTarget: this.template.renderString(template.base.groupTarget),
      link: this.template.renderString(template.base.link) as PortalLinkage,
      meta: await this.createMetadata(template.base.meta, PORTAL_TYPE),
      scripts: this.template.renderScriptMap(template.base.scripts),
      type: PORTAL_TYPE,
    };

    await this.modifyPortal(portal, template.mods);

    return portal;
  }

  public async createPortalList(templates: Array<TemplateRef>): Promise<Array<Portal>> {
    const world = this.getWorld();
    const portals = [];

    for (const templateRef of templates) {
      if (this.random.nextInt(TEMPLATE_CHANCE) > templateRef.chance) {
        continue;
      }

      const template = findByBaseId(world.templates.portals, templateRef.id);
      this.logger.debug({
        template,
        templateRef,
      }, 'create portal for list');

      if (isNil(template)) {
        throw new NotFoundError('invalid portal in room');
      }

      const portal = await this.createPortal(template);
      portals.push(portal);
    }

    return portals;
  }

  public async createRoom(template: Template<Room>): Promise<Room> {
    const room: Room = {
      type: ROOM_TYPE,
      actors: await this.createActorList(template.base.actors),
      items: await this.createItemList(template.base.items),
      meta: await this.createMetadata(template.base.meta, ROOM_TYPE),
      portals: await this.createPortalList(template.base.portals),
      scripts: await this.createScripts(template.base.scripts, ROOM_TYPE),
    };

    await this.modifyRoom(room, template.mods);

    return room;
  }

  public async createScripts(template: TemplatePrimitive<ScriptMap>, type: WorldEntityType): Promise<ScriptMap> {
    const world = this.getWorld();
    const baseScripts = this.template.renderScriptMap(world.defaults[type].scripts);
    const scripts = this.template.renderScriptMap(template);
    return mergeMap(baseScripts, scripts);
  }

  public async createState(world: WorldTemplate, params: CreateParams): Promise<WorldState> {
    // reseed the prng
    this.random.reseed(params.seed); // TODO: fast-forward to last state

    // pick a starting room and populate it
    const roomRef = randomItem(world.start.rooms, this.random);
    const roomTemplate = findByBaseId(world.templates.rooms, roomRef.id);
    if (isNil(roomTemplate)) {
      throw new NotFoundError('invalid start room');
    }

    this.logger.debug({
      roomRef,
      roomTemplate,
    }, 'creating start room');

    const startRoom = await this.createRoom(roomTemplate);
    const rooms = await this.populateRoom(startRoom, [], params.depth);
    rooms.unshift(startRoom);

    const meta = await this.createMetadata(world.meta, 'world');
    return {
      meta,
      rooms,
      start: {
        room: startRoom.meta.id,
      },
      step: {
        time: 0,
        turn: 0,
      },
      world: {
        ...params,
      },
    };
  }

  /**
   * Select some modifiers and mutate the given actor.
   */
  public async modifyActor(target: Actor, available: Array<Modifier<Actor>>): Promise<void> {
    const selected = this.selectModifiers(available);

    for (const mod of selected) {
      await this.modifyMetadata(target.meta, mod.meta);
      // target.source cannot be modified

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

  public async modifyMetadata(target: Metadata, mod: ModifierMetadata): Promise<void> {
    target.desc = this.template.modifyString(target.desc, mod.desc);
    target.name = this.template.modifyString(target.name, mod.name);
  }

  public async modifyPortal(target: Portal, available: Array<Modifier<Portal>>): Promise<void> {
    const selected = this.selectModifiers(available);

    for (const mod of selected) {
      await this.modifyMetadata(target.meta, mod.meta);

      target.groupKey = this.template.modifyString(target.groupKey, mod.groupKey);
      target.groupSource = this.template.modifyString(target.groupSource, mod.groupSource);
      target.groupTarget = this.template.modifyString(target.groupTarget, mod.groupTarget);
      target.link = this.template.modifyString(target.link, mod.link) as PortalLinkage;
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

      target.scripts = this.template.modifyScriptMap(target.scripts, mod.scripts);

      const actors = await this.createActorList(mod.actors);
      target.actors.push(...actors);

      const items = await this.createItemList(mod.items);
      target.items.push(...items);

      const portals = await this.createPortalList(mod.portals);
      target.portals.push(...portals);
    }
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

  public async populateRoom(firstRoom: Room, searchRooms: Array<Room>, max: number): Promise<Array<Room>> {
    if (max < 0) {
      return [];
    }

    const world = this.getWorld();

    const addedRooms = [];
    const pendingRooms = [firstRoom];

    while (pendingRooms.length > 0 && addedRooms.length < max) {
      const room = mustExist(pendingRooms.shift());
      this.logger.debug({ depth: max, room }, 'populating room with portals');

      // group portals
      const sourceGroups = new Map<string, Array<Portal>>();
      for (const portal of room.portals) {
        if (portal.dest === '') {
          setOrPush(sourceGroups, portal.groupSource, portal);
        }
      }

      this.logger.debug({
        groups: Array.from(sourceGroups.keys()),
      }, 'finding destinations for portal groups');

      // group portals
      for (const [group, portals] of sourceGroups) {
        // pick a random destination room
        const groupTemplates = portals.map((it) => findByBaseId(world.templates.portals, it.meta.template));
        const potentialDests = groupTemplates.map((it) => it.base.dest);
        const destId = this.template.renderString(randomItem(potentialDests, this.random));

        this.logger.debug({
          destId,
          group,
        }, 'selected destination for portal group');

        // look for an existing room
        const existingRoom = [
          ...searchRooms,
          ...addedRooms,
          ...pendingRooms,
        ].find((it) => {
          if (it.meta.id === room.meta.id) {
            // prevent links to self
            return false;
          }

          // if room is a valid dest
          if (matchIdSegments(it.meta.id, destId)) {
            // find unlinked portal in opposing group
            return it.portals.some((p) => p.dest === '' && p.groupTarget === group);
          } else {
            return false;
          }
        });

        if (doesExist(existingRoom)) {
          this.logger.debug({
            existingRoom,
            group,
          }, 'linking portal group to existing room');

          for (const portal of portals) {
            portal.dest = existingRoom.meta.id;
          }

          continue;
        }

        // or create a new one
        const destTemplate = findByBaseId(world.templates.rooms, destId);
        const destRoom = await this.createRoom(destTemplate);

        this.logger.debug({
          destRoom,
          group,
        }, 'linking portal group to new room');

        // link dest room
        for (const portal of portals) {
          portal.dest = destRoom.meta.id;

          if (portal.link === PortalLinkage.BOTH) {
            // create reverse link
            const destPortal = await this.reversePortal(portal);
            destPortal.dest = room.meta.id;
            destRoom.portals.push(destPortal);
          }
        }

        // add room to queue
        addedRooms.push(destRoom);
        pendingRooms.push(destRoom);
        // rooms.push(...await this.populateRoom(destRoom, depth - 1)); // TODO: TCO
      }
    }

    return addedRooms;
  }

  public async reversePortal(portal: Portal): Promise<Portal> {
    return {
      ...portal,
      groupSource: portal.groupTarget,
      groupTarget: portal.groupSource,
      meta: {
        desc: portal.meta.desc,
        id: `${portal.meta.template}-${this.counter.next(PORTAL_TYPE)}`,
        name: portal.meta.name,
        template: portal.meta.template,
      },
    };
  }
}
