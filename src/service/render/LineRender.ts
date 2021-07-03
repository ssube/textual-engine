import { doesExist, mustExist } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';
import { Inject, Logger } from 'noicejs';
import { stdin, stdout } from 'process';
import { createInterface, Interface as LineInterface } from 'readline';

import { RenderService } from '.';
import { ConfigError } from '../../error/ConfigError';
import { INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER, InjectedOptions } from '../../module';
import { onceEvent } from '../../util/async/event';
import { ClearResult, debounce } from '../../util/async/Throttle';
import { EVENT_ACTOR_OUTPUT, EVENT_RENDER_INPUT, EVENT_STATE_STEP, META_QUIT } from '../../util/constants';
import { zeroStep } from '../../util/entity';
import { makeSchema } from '../../util/schema';
import { makeServiceLogger } from '../../util/service';
import { ActorOutputEvent } from '../actor/events';
import { EventBus } from '../event';
import { LocaleService } from '../locale';
import { StepResult } from '../state';
import { StateStepEvent } from '../state/events';

export interface LineRenderConfig {
  throttle: number;
}

export const LINE_RENDER_SCHEMA: JSONSchemaType<LineRenderConfig> = {
  type: 'object',
  properties: {
    throttle: {
      type: 'number',
    },
  },
  required: ['throttle'],
};

@Inject(INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER)
export class LineRender implements RenderService {
  // services
  protected event: EventBus;
  protected logger: Logger;
  protected locale: LocaleService;
  protected step: StepResult;

  // next-line flags
  protected padPrompt: boolean;
  protected skipLine: boolean;

  protected readline: typeof createInterface;
  protected reader?: LineInterface;

  protected queuePrompt: ClearResult;

  constructor(options: InjectedOptions, /* istanbul ignore next */ readline = createInterface) {
    const config = mustExist(options.config);
    const schema = makeSchema(LINE_RENDER_SCHEMA);
    if (!schema(config)) {
      throw new ConfigError('invalid service config');
    }

    this.event = mustExist(options[INJECT_EVENT]);
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);

    // a pseudo-method
    this.queuePrompt = debounce(config.throttle, () => this.showPrompt());

    this.padPrompt = false;
    this.readline = readline;
    this.skipLine = false;
    this.step = zeroStep();
  }

  public async read(): Promise<string> {
    const reader = this.getReader();
    const pending = onceEvent<string>(reader, 'line');

    this.showPrompt();

    return pending;
  }

  public setPrompt(prompt: string): void {
    this.getReader().setPrompt(prompt);
  }

  public show(msg: string): void {
    this.showSync(msg);
  }

  public async start(): Promise<void> {
    this.reader = this.readline({
      input: stdin,
      output: stdout,
      prompt: '',
    });

    this.reader.on('line', (line) => this.onLine(line));
    this.reader.on('SIGINT', () => this.onSignal());

    this.event.on(EVENT_ACTOR_OUTPUT, (output) => this.onOutput(output));
    this.event.on(EVENT_STATE_STEP, (step) => this.onStep(step));

    this.showPrompt();
  }

  public async stop(): Promise<void> {
    this.queuePrompt.clear();
    this.event.removeGroup(this);

    if (doesExist(this.reader)) {
      this.reader.close();
    }
  }

  public update(): void {
    /* noop */
  }

  public onLine(line: string): void {
    if (this.skipLine) {
      return;
    }

    this.padPrompt = false;

    this.logger.debug({ line }, 'read line');
    this.event.emit(EVENT_RENDER_INPUT, {
      line,
    });

    this.queuePrompt.call();
  }

  public onSignal(): void {
    this.logger.debug('sending interrupt as quit command');
    this.event.emit(EVENT_RENDER_INPUT, {
      line: META_QUIT,
    });
  }

  /**
   * Handler for output line events received from actor service.
   */
  public onOutput(event: ActorOutputEvent): void {
    this.logger.debug({ event }, 'handling output event from actor');
    this.showSync(event.line);
  }

  public onStep(event: StateStepEvent): void {
    this.logger.debug({ event }, 'handling step event from state');
    this.step = event.step;
    this.showPrompt();
  }

  protected getReader(): LineInterface {
    return mustExist(this.reader);
  }

  protected showSync(msg: string): void {
    const reader = this.getReader();

    this.skipLine = true;

    // a prompt was being shown, move to a newline before output
    if (this.padPrompt) {
      this.padPrompt = false;
      reader.write('\n');
    }

    reader.write(msg);
    reader.write('\n');

    this.skipLine = false;
  }

  protected showPrompt(): void {
    this.padPrompt = true;
    this.setPrompt(`turn ${this.step.turn} > `);
    this.getReader().prompt();
  }
}
