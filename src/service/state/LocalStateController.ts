import { CreateParams, StateController } from '.';
import { Actor } from '../../models/entity/Actor';
import { Item } from '../../models/entity/Item';
import { Room } from '../../models/entity/Room';
import { Template } from '../../models/meta/Template';
import { ReactionConfig, SidebarConfig, State } from '../../models/State';
import { World } from '../../models/World';
import { ScriptController } from '../script';

export class LocalStateController implements StateController {
  protected state: State;
  protected script: ScriptController;
  protected world: World;

  /**
   * Create a new world state from a world template.
   */
  async from(world: World, params: CreateParams) {
    const state: State = {
      config: {
        reaction: ReactionConfig.REACTION_STAT,
        sidebar: SidebarConfig.NEVER_OPEN,
        seed: params.seed,
        world: world.meta.name,
      },
      focus: {
        actor: '',
        room: '',
      },
      input: [],
      rooms: [],
    };

    for (let i = 0; i < params.rooms; ++i) {
      state.rooms.push(this.createRoom(world.templates.rooms[0]));
    }

    state.focus.actor = state.rooms[0].actors[0].meta.name;
    state.focus.room = state.rooms[0].meta.name;

    this.state = state;
    this.world = world;
  }

  /**
   * Load an existing world state.
   */
  async load(state: State) {
    this.state = state;
  }

  /**
   * Save the current world state.
   */
  async save(): Promise<State> {
    return this.state;
  }

  /**
   * Step the internal world state, simulating some turns and time passing.
   */
  async step(time: number) {
    for (const room of this.state.rooms) {
      for (const actor of room.actors) {
        this.script.invoke(actor, 'step', {
          actor,
          room,
          time,
        });

        for (const item of actor.items) {
          this.script.invoke(item, 'step', {
            actor,
            item,
            room,
            time,
          });
        }
      }

      for (const item of room.items) {
        this.script.invoke(item, 'step', {
          item,
          room,
          time,
        });
      }
    }
  }

  protected createActor(template: Template<Actor>): Actor {
    const actor: Actor = {
      items: [],
      meta: {
        desc: template.base.meta.desc.base,
        name: template.base.meta.name.base,
      },
      skills: new Map(),
      slots: new Map(),
      stats: new Map(),
    };

    for (const itemTemplate of template.base.items) {
      actor.items.push(this.createItem(itemTemplate));
    }

    return actor;
  }

  protected createItem(template: Template<Item>): Item {
    return {
      meta: {
        desc: template.base.meta.desc.base,
        name: template.base.meta.name.base,
      },
      stats: new Map(),
      slots: new Map(),
    };
  }

  protected createRoom(template: Template<Room>): Room {
    return {
      actors: [],
      items: [],
      meta: {
        desc: template.base.meta.desc.base,
        name: template.base.meta.name.base,
      },
      slots: new Map(),
    };
  }
}