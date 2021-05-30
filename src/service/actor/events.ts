import { Command } from '../../model/Command';
import { Actor } from '../../model/entity/Actor';

export interface ActorCommandEvent {
  actor?: Actor;
  command: Command;
}

export interface ActorJoinEvent {
  pid: string;
}
