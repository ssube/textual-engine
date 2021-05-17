import { doesExist } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';
import { render } from 'ink';
import * as React from 'react';

import { Render } from '.';
import { onceWithRemove, RemoveResult } from '../../util/event';
import { StepResult } from '../state';
import { BaseRender, BaseRenderOptions } from './BaseRender';
import { Frame } from './component/ink/Frame';

export interface InkState {
  input: string;
  prompt: string;
  output: Array<string>;
}

export type InkStateDispatch = (input: string) => RemoveResult<InkState>;
export type InkQuitDispatch = () => RemoveResult<void>;

/**
 * Interface with Ink's React tree using an event emitter.
 * Is that the right way to do it? Who knows? Not me. :D
 */
export class InkRender extends BaseRender implements Render {
  protected emits: EventEmitter;
  protected output: Array<string>;
  protected promptStr: string;

  constructor(options: BaseRenderOptions) {
    super(options);

    this.emits = new EventEmitter();
    this.output = [];
    this.promptStr = '';
  }

  public prompt(prompt: string): void {
    this.promptStr = prompt;
  }

  public read(): Promise<string> {
    const { pending } = onceWithRemove<string>(this.emits, 'line');

    return pending;
  }

  public async show(msg: string): Promise<void> {
    this.output.push(msg);
  }

  public showSync(msg: string): void {
    this.output.push(msg);
  }

  public async start(): Promise<void> {
    const root = React.createElement(Frame, {
      onLine: (line: string) => this.onLine(line),
      onQuit: () => this.onQuit(),
    });

    render(root);

    this.running = true;
  }

  public async stop(): Promise<void> {
    this.emits.emit('quit');
  }

  public async showStep(result: StepResult): Promise<void> {
    // add the turn marker
    result.output.unshift(`turn ${result.turn} > ${result.line}`);

    await super.showStep(result);

    const state: InkState = {
      input: '',
      prompt: this.promptStr,
      output: result.output,
    };
    this.emits.emit('step', state);
  }

  protected onLine(line: string): RemoveResult<InkState> {
    return onceWithRemove(this.emits, 'step', () => {
      this.emits.emit('line', line);
    });
  }

  protected onQuit(): RemoveResult<void> {
    return onceWithRemove(this.emits, 'quit');
  }
}
