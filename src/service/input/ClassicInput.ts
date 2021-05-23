import { getOrDefault, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject } from 'noicejs';
import { Command, Input } from '.';
import { INJECT_LOCALE } from '../../module';
import { LocaleService } from '../locale';
import { LocalScriptService } from '../script/LocalScriptService';

const REMOVED_WORDS = new Set([
  'a',
  'an',
  'at',
  'on',
  'the',
  'to',
  'toward',
  'towards',
]);

const SPLIT_CHAR = ' ';

interface ClassicInputOptions extends BaseOptions {
  [INJECT_LOCALE]?: LocaleService;
}

@Inject(INJECT_LOCALE)
export class ClassicInput implements Input {
  protected history: Array<Command>;
  protected locale: LocaleService;
  protected verbs: Map<string, string>;

  constructor(options: ClassicInputOptions) {
    this.history = [];
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.verbs = new Map();
  }

  public async tokenize(input: string): Promise<Array<string>> {
    return input.split(SPLIT_CHAR);
  }

  public async parse(input: string): Promise<Command> {
    const rawTokens = await this.tokenize(input);
    const tokens = rawTokens.map((it) => it.toLocaleLowerCase()).filter((it) => REMOVED_WORDS.has(it) === false);
    const [rawVerb, ...targets] = tokens;

    const verb = getOrDefault(this.verbs, rawVerb, rawVerb); // get the translation or return the raw verb
    const cmd: Command = {
      index: 0,
      input,
      verb,
      target: '',
    };

    // 2+ segments and the last one is all digits
    const last = targets[targets.length - 1];
    if (targets.length > 1 && /^[0-9]+$/.test(last)) {
      targets.pop();
      cmd.index = parseInt(last, 10);
    }

    cmd.target = targets.join(SPLIT_CHAR);

    this.history.unshift(cmd);

    return cmd;
  }

  public async last(): Promise<Command> {
    return this.history[0];
  }

  public translate(verbs: Array<string>) {
    this.verbs.clear();

    for (const verb of verbs) {
      const translated = this.locale.translate(verb);
      this.verbs.set(translated, `${verb}`); // trick i18next into translating them back
    }
  }
}
