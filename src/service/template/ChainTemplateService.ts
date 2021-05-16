import { mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject } from 'noicejs';

import { TemplateService } from '.';
import { BaseTemplate, TemplateNumber, TemplateString } from '../../model/meta/Template';
import { INJECT_RANDOM } from '../../module';
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
      joiners: ['-'],
      random: this.random,
    });
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
    return this.random.nextInt(input.max, input.min);
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

  public renderVerbMap(input: Map<string, BaseTemplate<VerbSlot>>): VerbMap {
    const result = new Map();

    for (const [key, value] of input) {
      const verb: VerbSlot = {
        slot: this.renderString(value.slot),
        data: {}, // TODO
      };

      result.set(key, verb);
    }

    return result;
  }
}
