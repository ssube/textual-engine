import { doesExist, InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { Instance as InkInstance, render } from 'ink';
import { Inject } from 'noicejs';
import * as React from 'react';

import { RenderService } from '.';
import { Frame } from '../../component/ink/Frame';
import { onceWithRemove } from '../../util/event';
import { OutputEvent, RoomEvent } from '../event';
import { BaseRender, BaseRenderOptions } from './BaseRender';

export interface InkState {
  input: string;
  prompt: string;
  output: Array<string>;
}

/**
 * Interface with Ink's React tree using an event emitter.
 */
@Inject(/* from base */)
export class InkRender extends BaseRender implements RenderService {
  protected inputStr: string;
  protected promptStr: string;

  protected output: Array<string>;

  protected ink?: InkInstance;

  constructor(options: BaseRenderOptions) {
    super(options);

    this.inputStr = '';
    this.promptStr = '';

    this.output = [];
  }

  public prompt(prompt: string): void {
    this.promptStr = prompt;
  }

  public async read(): Promise<string> {
    const { pending } = onceWithRemove<OutputEvent>(this.event, 'output');
    const event = await pending;

    return event.lines[0];
  }

  public async show(msg: string): Promise<void> {
    this.output.push(msg);
  }

  public async start(): Promise<void> {
    this.logger.debug('starting Ink render');

    this.renderRoot();
    this.prompt(`turn ${this.step.turn}`);

    this.event.on('actor-output', (output) => this.onOutput(output));
    this.event.on('state-room', (room) => this.onRoom(room));
    this.event.on('quit', () => this.onQuit());
  }

  public async stop(): Promise<void> {
    this.logger.debug('stopping Ink render');
    mustExist(this.ink).unmount();

    // TODO: remove event handlers from state
  }

  /**
   * Handler for lines received from the React tree.
   */
  public nextLine(line: string): void {
    this.logger.debug({ line }, 'handling line event from React');

    // update inner state
    this.inputStr = line;

    // append to buffer
    this.output.push(`${this.promptStr} > ${this.inputStr}`);

    // forward event to state
    this.event.emit('render-output', {
      lines: [line],
    });
  }

  /**
   * Handler for output line events received from state service.
   */
  public onOutput(event: OutputEvent): void {
    this.logger.debug({ event }, 'handling output event from state');

    if (!Array.isArray(event.lines)) {
      throw new InvalidArgumentError('please batch output');
    }

    this.output.push(...event.lines);
    this.step = event.step;

    this.renderRoot();
  }

  /**
   * Handler for step events received from state service.
   */
  public onRoom(event: RoomEvent): void {
    this.logger.debug({ event }, 'handling room event from state');

    this.prompt(`turn ${this.step.turn}`);

    this.renderRoot();
  }

  /**
   * Handler for quit events received from state service.
   */
  public onQuit(): void {
    this.logger.debug('handling quit event from state');
    this.output.push('game over');
  }

  protected renderRoot(): void {
    const elem = React.createElement(Frame, {
      onLine: (line: string) => this.nextLine(line),
      prompt: this.promptStr,
      output: this.output,
      step: this.step,
    });

    if (doesExist(this.ink)) {
      this.ink.rerender(elem);
    } else {
      this.ink = render(elem);
    }
  }
}
