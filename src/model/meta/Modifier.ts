import { SkillMap, StatMap, VerbMap } from '../../util/types';

export interface Modifier {
  name: {
    prefix: string;
    suffix: string;
  };
  desc: {
    prefix: string;
    suffix: string;
  };
  skills: SkillMap;
  stats: StatMap;
  verbs: VerbMap;
}
