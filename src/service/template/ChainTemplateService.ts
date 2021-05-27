import { doesExist, InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject } from 'noicejs';

import { TemplateService } from '.';
import { ModifierNumber, ModifierString } from '../../model/meta/Modifier';
import { BaseTemplate, TemplateNumber, TemplateString } from '../../model/meta/Template';
import { INJECT_RANDOM } from '../../module';
import { hasText } from '../../util/string';
import { JoinChain } from '../../util/template/JoinChain';
import { splitChain } from '../../util/template/SplitChain';
import { VerbMap, VerbSlot } from '../../util/types';
import { RandomGenerator } from '../random';

export interface PipeTemplateOptions extends BaseOptions {
  [INJECT_RANDOM]?: RandomGenerator;
}

@Inject(INJECT_RANDOM)
export class ChainTemplateService implements TemplateService {
  protected readonly joiner: JoinChain;
  protected readonly random: RandomGenerator;

  constructor(options: PipeTemplateOptions) {
    this.random = mustExist(options[INJECT_RANDOM]);
    this.joiner = new JoinChain({
      joiners: [' '],
      random: this.random,
    });
  }

  public modifyNumber(base: number, mod: ModifierNumber): number {
    return base + mod.offset;
  }

  public modifyString(base: string, mod: ModifierString): string {
    return [mod.prefix, base, mod.suffix].filter(hasText).join(' ');
  }

  public modifyNumberList(base: Array<number>, mod: Array<ModifierNumber>): Array<number> {
    return base.map((it, idx) => this.modifyNumber(it, mod[idx]));
  }

  public modifyStringList(base: Array<string>, mod: Array<ModifierString>): Array<string> {
    return base.map((it, idx) => this.modifyString(it, mod[idx]));
  }

  public modifyNumberMap(base: Map<string, number>, mod: Map<string, ModifierNumber>): Map<string, number> {
    const result = new Map();
    for (const [key, value] of base.entries()) {
      const modValue = mod.get(key);
      if (doesExist(modValue)) {
        result.set(key, this.modifyNumber(value, modValue));
      } else {
        result.set(key, value);
      }
    }
    return result;
  }

  public modifyStringMap(base: Map<string, string>, mod: Map<string, ModifierString>): Map<string, string> {
    const result = new Map();
    for (const [key, value] of base.entries()) {
      const modValue = mod.get(key);
      if (doesExist(modValue)) {
        result.set(key, this.modifyString(value, modValue));
      } else {
        result.set(key, value);
      }
    }
    return result;
  }

  public renderString(input: TemplateString): string {
    const chain = splitChain(input.base, {
      group: {
        start: '(',
        end: ')',
      },
      split: '|',
    });
    return this.joiner.render(chain);
  }

  public renderNumber(input: TemplateNumber): number {
    if (input.step < 0) {
      throw new InvalidArgumentError('template step must be greater than 0');
    }

    if (input.step < 1) {
      const range = input.max - input.min;
      const next = this.random.nextFloat() % range;
      return (Math.floor(next / input.step) * input.step) + input.min;
    } else {
      return this.random.nextInt(input.max, input.min);
    }
  }

  public renderNumberList(input: Array<TemplateNumber>): Array<number> {
    return input.map((it) => this.renderNumber(it));
  }

  public renderStringList(input: Array<TemplateString>): Array<string> {
    return input.map((it) => this.renderString(it));
  }

  public renderNumberMap(input: Map<string, TemplateNumber>): Map<string, number> {
    const result = new Map();

    for (const [key, value] of input) {
      result.set(key, this.renderNumber(value));
    }

    return result;
  }

  public renderStringMap(input: Map<string, TemplateString>): Map<string, string> {
    const result = new Map();

    for (const [key, value] of input) {
      result.set(key, this.renderString(value));
    }

    return result;
  }

  public renderPrimitiveMap(input: Map<string, TemplateNumber | TemplateString>): Map<string, number | string> {
    const result = new Map();

    for (const [key, value] of input) {
      if (value.type === 'number') {
        result.set(key, this.renderNumber(value));
      } else {
        result.set(key, this.renderString(value));
      }
    }

    return result;
  }

  public renderVerbMap(input: Map<string, BaseTemplate<VerbSlot>>): VerbMap {
    const result = new Map();

    for (const [key, value] of input) {
      const verb: VerbSlot = {
        slot: this.renderString(value.slot),
        data: this.renderPrimitiveMap(value.data),
      };

      result.set(key, verb);
    }

    return result;
  }
}
