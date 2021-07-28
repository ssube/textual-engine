import { DataFile } from '../../model/file/Data.js';

/**
 * Data file parser.
 *
 * This service is used by the loaders and does not listen to events.
 */
export interface Parser {
  /**
   * Parse a data file from a string.
   */
  load(data: string): DataFile;

  /**
   * Serialize a data file into a string.
   */
  save(data: DataFile): string;
}
