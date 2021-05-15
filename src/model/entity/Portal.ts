import { BaseTemplate } from '../meta/Template';

export interface Portal {
  /**
   * The portal display name.
   */
  name: string;

  /**
   * The source portal's group.
   */
  sourceGroup: string;

  /**
   * The target group in the destination room.
   */
  targetGroup: string;

  /**
   * The destination room.
   */
  dest: string;
}

export type PortalGroups = Map<string, {
  dests: Set<string>;
  portals: Set<BaseTemplate<Portal>>;
}>;
