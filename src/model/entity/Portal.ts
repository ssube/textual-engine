export interface Portal {
  dest: string; // TODO: should this be the room instance? id? matcher?
  group: string;
  name: string;
}

export type PortalGroups = Map<string, {
  dests: Set<string>;
  sources: Set<string>;
}>;
