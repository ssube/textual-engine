import { Service } from '../index.js';
import { Command } from '../../model/Command.js';

export interface ActorService extends Service {
  last(): Promise<Command>;
}
