import { doesExist, mergeMap, mustExist, setOrPush } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { equipItems, isDestPortal, zeroStep } from './index.js';
import { WorldEntityType } from '../../model/entity/index.js';
import { Actor, ACTOR_TYPE, ActorSource } from '../../model/entity/Actor.js';
import { Item, ITEM_TYPE } from '../../model/entity/Item.js';
import { Portal, PORTAL_TYPE, PortalLinkage } from '../../model/entity/Portal.js';
import { Room, ROOM_TYPE } from '../../model/entity/Room.js';
import { BaseModifier, Modifier, ModifierMetadata } from '../../model/mapped/Modifier.js';
import { Template, TemplateMetadata, TemplatePrimitive, TemplateRef } from '../../model/mapped/Template.js';
import { Metadata } from '../../model/Metadata.js';
import { ScriptMap } from '../../model/Script.js';
import { WorldState } from '../../model/world/State.js';
import { WorldTemplate } from '../../model/world/Template.js';
import { INJECT_COUNTER, INJECT_LOGGER, INJECT_RANDOM, INJECT_TEMPLATE, InjectedOptions } from '../../module/index.js';
import { Counter } from '../../service/counter/index.js';
import { RandomService } from '../../service/random/index.js';
import { CreateParams } from '../../service/state/index.js';
import { TemplateService } from '../../service/template/index.js';
import { randomItem } from '../collection/array.js';
import { TEMPLATE_CHANCE } from '../constants.js';
import { makeServiceLogger } from '../service/index.js';
import { hasText, matchIdSegments } from '../string.js';
import { findByBaseId } from '../template/index.js';

@Inject(INJECT_COUNTER, INJECT_LOGGER, INJECT_RANDOM, INJECT_TEMPLATE)
export class StateEntityGenerator {
  protected counter: Counter;
  protected logger: Logger;
  protected random: RandomService;
  protected template: TemplateService;

  protected world?: WorldTemplate;

  constructor(options: InjectedOptions) {
    this.counter = mustExist(options[INJECT_COUNTER]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);
    this.random = mustExist(options[INJECT_RANDOM]);
    this.template = mustExist(options[INJECT_TEMPLATE]);
  }

  public setWorld(world: WorldTemplate): void {
    this.world = world;
  }

  // take ID and look up template?
  public async createActor(template: Template<Actor>, source = ActorSource.BEHAVIOR): Promise<Actor> {
    const slots = this.template.renderStringMap(template.base.slots);
    const actor: Actor = {
      flags: this.template.renderStringMap(template.base.flags),
      items: await this.createItemList(template.base.items),
      meta: await this.createMetadata(template.base.meta, ACTOR_TYPE),
      scripts: await this.createScripts(template.base.scripts, ACTOR_TYPE),
      slots,
      source,
      stats: this.template.renderNumberMap(template.base.stats),
      type: 'actor',
    };

    await this.modifyActor(actor, template.mods);

    equipItems(actor, slots);

    return actor;
  }

  public async createActorList(templates: Array<TemplateRef>): Promise<Array<Actor>> {
    const world = this.getWorld();
    const actors = [];

    for (const templateRef of templates) {
      if (this.random.nextInt(TEMPLATE_CHANCE) > templateRef.chance) {
        continue;
      }

      this.logger.debug({
        templateRef,
      }, 'create actor for list');

      const template = findByBaseId(world.templates.actors, templateRef.id);
      const item = await this.createActor(template);
      actors.push(item);
    }

    return actors;
  }

  public async createItem(template: Template<Item>): Promise<Item> {
    const item: Item = {
      flags: this.template.renderStringMap(template.base.flags),
      meta: await this.createMetadata(template.base.meta, ITEM_TYPE),
      scripts: await this.createScripts(template.base.scripts, ITEM_TYPE),
      slot: this.template.renderString(template.base.slot),
      stats: this.template.renderNumberMap(template.base.stats),
      type: ITEM_TYPE,
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

      this.logger.debug({
        templateRef,
      }, 'create item for list');

      const template = findByBaseId(world.templates.items, templateRef.id);
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
      flags: this.template.renderStringMap(template.base.flags),
      group: {
        key: this.template.renderString(template.base.group.key),
        source: this.template.renderString(template.base.group.source),
        target: this.template.renderString(template.base.group.target),
      },
      link: this.template.renderString(template.base.link) as PortalLinkage,
      meta: await this.createMetadata(template.base.meta, PORTAL_TYPE),
      scripts: await this.createScripts(template.base.scripts, PORTAL_TYPE),
      stats: this.template.renderNumberMap(template.base.stats),
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

      this.logger.debug({
        templateRef,
      }, 'create portal for list');

      const template = findByBaseId(world.templates.portals, templateRef.id);
      const portal = await this.createPortal(template);
      portals.push(portal);
    }

    return portals;
  }

  public async createRoom(template: Template<Room>): Promise<Room> {
    const room: Room = {
      actors: await this.createActorList(template.base.actors),
      flags: this.template.renderStringMap(template.base.flags),
      items: await this.createItemList(template.base.items),
      meta: await this.createMetadata(template.base.meta, ROOM_TYPE),
      portals: await this.createPortalList(template.base.portals),
      scripts: await this.createScripts(template.base.scripts, ROOM_TYPE),
      type: ROOM_TYPE,
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

  public async createState(params: CreateParams): Promise<WorldState> {
    const world = mustExist(this.world);

    // reseed the prng
    this.random.reseed(params.seed); // TODO: fast-forward to last state

    // pick a starting room and populate it
    const roomRef = randomItem(world.start.rooms, this.random);
    const roomTemplate = findByBaseId(world.templates.rooms, roomRef.id);

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
      step: zeroStep(),
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
      // target.source cannot be modified

      if (doesExist(mod.meta)) {
        await this.modifyMetadata(target.meta, mod.meta);
      }

      if (doesExist(mod.stats)) {
        target.stats = this.template.modifyNumberMap(target.stats, mod.stats);
      }

      if (doesExist(mod.scripts)) {
        target.scripts = this.template.modifyScriptMap(target.scripts, mod.scripts);
      }

      if (doesExist(mod.items)) {
        const items = await this.createItemList(mod.items);
        target.items.push(...items);
      }
    }
  }

  /**
   * Select some modifiers and mutate the given item.
   */
  public async modifyItem(target: Item, available: Array<Modifier<Item>>): Promise<void> {
    const selected = this.selectModifiers(available);

    for (const mod of selected) {
      if (doesExist(mod.meta)) {
        await this.modifyMetadata(target.meta, mod.meta);
      }

      if (doesExist(mod.stats)) {
        target.stats = this.template.modifyNumberMap(target.stats, mod.stats);
      }

      if (doesExist(mod.scripts)) {
        target.scripts = this.template.modifyScriptMap(target.scripts, mod.scripts);
      }
    }
  }

  public async modifyMetadata(target: Metadata, mod: ModifierMetadata): Promise<void> {
    target.desc = this.template.modifyString(target.desc, mod.desc);
    target.name = this.template.modifyString(target.name, mod.name);
  }

  public async modifyPortal(target: Portal, available: Array<Modifier<Portal>>): Promise<void> {
    const selected = this.selectModifiers(available);

    for (const mod of selected) {
      if (doesExist(mod.meta)) {
        await this.modifyMetadata(target.meta, mod.meta);
      }

      if (doesExist(mod.group)) {
        target.group.key = this.template.modifyString(target.group.key, mod.group.key);
        target.group.source = this.template.modifyString(target.group.source, mod.group.source);
        target.group.target = this.template.modifyString(target.group.target, mod.group.target);
      }

      if (doesExist(mod.link)) {
        target.link = this.template.modifyString(target.link, mod.link) as PortalLinkage;
      }

      if (doesExist(mod.scripts)) {
        target.scripts = this.template.modifyScriptMap(target.scripts, mod.scripts);
      }

      if (doesExist(mod.stats)) {
        target.stats = this.template.modifyNumberMap(target.stats, mod.stats);
      }
    }
  }

  /**
   * Select some modifiers and mutate the given room.
   */
  public async modifyRoom(target: Room, available: Array<Modifier<Room>>): Promise<void> {
    const selected = this.selectModifiers(available);

    for (const mod of selected) {
      if (doesExist(mod.meta)) {
        await this.modifyMetadata(target.meta, mod.meta);
      }

      if (doesExist(mod.scripts)) {
        target.scripts = this.template.modifyScriptMap(target.scripts, mod.scripts);
      }

      if (doesExist(mod.actors)) {
        const actors = await this.createActorList(mod.actors);
        target.actors.push(...actors);
      }

      if (doesExist(mod.items)) {
        const items = await this.createItemList(mod.items);
        target.items.push(...items);
      }

      if (doesExist(mod.portals)) {
        const portals = await this.createPortalList(mod.portals);
        target.portals.push(...portals);
      }
    }
  }

  public selectModifiers<TBase>(mods: Array<Modifier<TBase>>): Array<Partial<BaseModifier<TBase>>> {
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

  // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
  public async populateRoom(firstRoom: Room, searchRooms: Array<Room>, max: number): Promise<Array<Room>> {
    if (max <= 0) {
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
          setOrPush(sourceGroups, portal.group.source, portal);
        }
      }

      this.logger.debug({
        groups: Array.from(sourceGroups.keys()),
      }, 'finding destinations for portal groups');

      // group portals
      for (const [group, portals] of sourceGroups) {
        // pick a random destination room
        const groupTemplates = portals.map((it) => findByBaseId(world.templates.portals, it.meta.template));
        const potentialDests = groupTemplates.map((it) => it.base.dest).filter((it) => hasText(it.base));

        if (potentialDests.length === 0) {
          continue;
        }

        const destId = this.template.renderString(randomItem(potentialDests, this.random));

        this.logger.debug({
          destId,
          group,
          room,
        }, 'finding destination for portal group');

        // look for an existing room
        const groupKeys = new Set(portals.map((it) => it.group.key));
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
          if (matchIdSegments(it.meta.id, destId) === false) {
            return false;
          }

          // find unlinked portal in opposing group
          return it.portals.some((p) => {
            if (p.dest === '' && groupKeys.has(p.group.key) && p.group.target === group) {
              this.logger.debug({ destId, portal: p, room }, 'found unlinked destination portal');
              return true;
            } else {
              return false;
            }
          });
        });

        if (doesExist(existingRoom)) {
          this.logger.debug({
            room: existingRoom,
            group,
          }, 'linking portal group to existing room');

          for (const portal of portals) {
            portal.dest = existingRoom.meta.id;

            if (portal.link === PortalLinkage.BOTH) {
              // find existing portal
              const existingPortal = existingRoom.portals.find((it) => isDestPortal(portal, it));

              if (doesExist(existingPortal)) {
                existingPortal.dest = room.meta.id;
              } else {
                this.logger.debug({ portal, room }, 'portal does not have destination in existing room');
              }
            }
          }

          continue;
        }

        // or create a new one
        const destTemplate = findByBaseId(world.templates.rooms, destId);
        const destRoom = await this.createRoom(destTemplate);

        this.logger.debug({
          room: destRoom,
          group,
        }, 'linking portal group to new room');

        // link dest room
        for (const portal of portals) {
          portal.dest = destRoom.meta.id;

          if (portal.link === PortalLinkage.BOTH) {
            // find existing portal
            const existingPortal = destRoom.portals.find((it) => isDestPortal(portal, it));

            if (doesExist(existingPortal)) {
              existingPortal.dest = room.meta.id;
            } else {
              // or create reverse link
              const destPortal = await this.reversePortal(portal, room);
              destPortal.dest = room.meta.id;
              destRoom.portals.push(destPortal);
              this.logger.debug({ portal: destPortal, room }, 'inserting destination portal for new room without match');
            }
          }
        }

        // add room to queue
        addedRooms.push(destRoom);
        pendingRooms.push(destRoom);
      }
    }

    return addedRooms;
  }

  public async reversePortal(portal: Portal, room: Room): Promise<Portal> {
    const template = findByBaseId(this.getWorld().templates.portals, portal.meta.template);
    const reverse = await this.createPortal(template);

    reverse.dest = room.meta.id;
    reverse.link = PortalLinkage.BOTH;
    reverse.group.source = portal.group.target;
    reverse.group.target = portal.group.source;

    return reverse;
  }

  protected getWorld(): WorldTemplate {
    return mustExist(this.world);
  }
}
