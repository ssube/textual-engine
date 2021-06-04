import { Command } from '../../model/Command';
import { Actor } from '../../model/entity/Actor';
import { Room } from '../../model/entity/Room';

export interface ActorCommandEvent {
  command: Command;
  actor?: Actor;
  room?: Room;
}

export interface ActorJoinEvent {
  pid: string;
}
