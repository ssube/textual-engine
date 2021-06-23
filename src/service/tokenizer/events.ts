import { Command } from '../../model/Command';

/**
 * A parsed command without actor.
 */
export interface TokenCommandEvent {
  command: Command;
}
