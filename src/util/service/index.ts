import { constructorName, mustExist, Optional } from '@apextoaster/js-utils';
import { Logger } from 'noicejs';

export function makeServiceLogger(base: Optional<Logger>, svc: object): Logger {
  return mustExist(base).child({
    kind: constructorName(svc),
  });
}
