import { doesExist, InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';

import { TemplateService } from './index.js';
import { ModifierPrimitive } from '../../model/mapped/Modifier.js';
import { BaseTemplate, TemplateNumber, TemplateString } from '../../model/mapped/Template.js';
import { ScriptMap, ScriptRef } from '../../model/Script.js';
import { INJECT_LOCALE, INJECT_RANDOM, InjectedOptions } from '../../module/index.js';
import { JoinChain } from '../../util/template/JoinChain.js';
import { splitChain } from '../../util/template/SplitChain.js';
import { LocaleService } from '../locale/index.js';
import { RandomService } from '../random/index.js';

@Inject(INJECT_LOCALE, INJECT_RANDOM)
export class ChainTemplateService implements TemplateService {
  protected readonly joiner: JoinChain;
  protected readonly locale: LocaleService;
  protected readonly random: RandomService;

  constructor(options: InjectedOptions) {
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.random = mustExist(options[INJECT_RANDOM]);
    this.joiner = new JoinChain({
      joiners: [' '],
      random: this.random,
    });
  }

  public modifyNumber(base: number, mod: TemplateNumber): number {
    const offset = this.random.nextInt(mod.max, mod.min);
    return base + offset;
  }

  public modifyString(base: string, mod: TemplateString): string {
    const key = this.renderString(mod);
    return this.locale.translate(key, { base });
  }

  public modifyNumberList(base: Array<number>, mod: Array<TemplateNumber>): Array<number> {
    return base.map((it, idx) => this.modifyNumber(it, mod[idx]));
  }

  public modifyStringList(base: Array<string>, mod: Array<TemplateString>): Array<string> {
    return base.map((it, idx) => this.modifyString(it, mod[idx]));
  }

  public modifyNumberMap(base: Map<string, number>, mod: Map<string, TemplateNumber>): Map<string, number> {
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

  public modifyStringMap(base: Map<string, string>, mod: Map<string, TemplateString>): Map<string, string> {
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

  /**
   * @todo implement script modifiers
   */
  public modifyScriptMap(target: ScriptMap, _mods: ModifierPrimitive<ScriptMap>): ScriptMap {
    return target;
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

  /**
   * @todo use step when it is > 1
   */
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

  public renderScriptMap(input: Map<string, BaseTemplate<ScriptRef>>): ScriptMap {
    const result = new Map();

    for (const [key, value] of input) {
      const verb: ScriptRef = {
        data: this.renderPrimitiveMap(value.data),
        name: this.renderString(value.name),
      };

      result.set(key, verb);
    }

    return result;
  }
}
