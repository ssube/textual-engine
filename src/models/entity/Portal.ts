export interface Portal {
  dest: string;
  group: string;
  name: string;
}

export type PortalGroups = Map<string, {
  dests: Set<string>;
  sources: Set<string>;
}>;
