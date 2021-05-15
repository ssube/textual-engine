import { mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject } from 'noicejs';

import { TemplateService } from '.';
import { BaseTemplate, TemplateNumber, TemplateString } from '../../model/meta/Template';
import { INJECT_RANDOM } from '../../module';
import { VerbMap, VerbSlot } from '../../util/types';
import { RandomGenerator } from '../random';

export interface PipeTemplateOptions extends BaseOptions {
  [INJECT_RANDOM]?: RandomGenerator;
}

@Inject(INJECT_RANDOM)
export class PipeTemplate implements TemplateService {
  protected readonly random: RandomGenerator;

  constructor(options: PipeTemplateOptions) {
    this.random = mustExist(options[INJECT_RANDOM]);
  }

  renderString(input: TemplateString): string {
    return input.base;
  }

  renderNumber(input: TemplateNumber): number {
    return this.random.nextInt(input.max, input.min);
  }

  renderNumberList(input: TemplateNumber[]): number[] {
    return input.map((it) => it.min);
  }

  renderStringList(input: TemplateString[]): string[] {
    return input.map((it) => it.base);
  }

  renderNumberMap(input: Map<string, TemplateNumber>): Map<string, number> {
    const result = new Map();

    for (const [key, value] of input) {
      result.set(key, this.renderNumber(value));
    }

    return result;
  }

  renderStringMap(input: Map<string, TemplateString>): Map<string, string> {
    const result = new Map();

    for (const [key, value] of input) {
      result.set(key, this.renderString(value));
    }

    return result;
  }

  renderVerbMap(input: Map<string, BaseTemplate<VerbSlot>>): VerbMap {
    const result = new Map();

    for (const [key, value] of input) {
      const verb: VerbSlot = {
        slot: value.slot.base,
        data: {},
      };

      result.set(key, verb);
    }

    return result;
  }
}