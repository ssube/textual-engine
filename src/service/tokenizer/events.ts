import { Command } from '../../model/Command.js';

/**
 * A parsed command without actor.
 */
export interface TokenCommandEvent {
  command: Command;
}
