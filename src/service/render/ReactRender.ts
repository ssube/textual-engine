import { InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';
import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import { RenderService } from '.';
import { Frame } from '../../component/react/Frame';
import { onceWithRemove } from '../../util/event';
import { StepResult } from '../state';
import { BaseRender, BaseRenderOptions } from './BaseRender';

export interface InkState {
  input: string;
  prompt: string;
  output: Array<string>;
}

/**
 * Interface with React tree using an event emitter.
 */
@Inject(/* from base */)
export class ReactRender extends BaseRender implements RenderService {
  protected inputStr: string;
  protected promptStr: string;

  protected output: Array<string>;

  constructor(options: BaseRenderOptions) {
    super(options);

    this.inputStr = '';
    this.promptStr = '';

    this.output = [];
  }

  public prompt(prompt: string): void {
    this.promptStr = prompt;
  }

  public read(): Promise<string> {
    const { pending } = onceWithRemove<string>(this.state, 'output');

    return pending;
  }

  public async show(msg: string): Promise<void> {
    this.output.push(msg);
  }

  public async start(): Promise<void> {
    this.logger.debug('starting React render');

    this.renderRoot();
    this.prompt(`turn ${this.step.turn}`);

    this.state.on('output', (output) => this.onOutput(output));
    this.state.on('quit', () => this.onQuit());
    this.state.on('step', (step) => this.onStep(step));
  }

  public async stop(): Promise<void> {
    this.logger.debug('stopping React render');

    const elem = mustExist(document.getElementById('app'));
    unmountComponentAtNode(elem);

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
    this.state.emit('line', line);
  }

  /**
   * Handler for output line events received from state service.
   */
  public onOutput(lines: Array<string>): void {
    if (!Array.isArray(lines)) {
      throw new InvalidArgumentError('please batch output');
    }

    this.logger.debug({ lines }, 'handling output event from state');
    this.output.push(...lines);

    this.renderRoot();
  }

  /**
   * Handler for step events received from state service.
   */
  public onStep(result: StepResult): void {
    this.logger.debug(result, 'handling step event from state');
    this.step = result;

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
    render([elem], document.getElementById('app'));
  }
}
