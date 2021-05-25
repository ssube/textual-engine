import { Service } from '..';
import { Command } from '../../model/Command';

export interface ActorService extends Service {
  last(): Promise<Command>;
}
