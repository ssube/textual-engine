import { EventEmitter } from 'events';

import { Render } from '../../service/render';

const nameFromLevel = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal'
};

export class RenderStream extends EventEmitter {
  public writable: boolean = true;

  protected render: Render;

  constructor(render: Render) {
    super();

    this.render = render;
  }

  public write(record: any): boolean {
    return this.show(record);
  }

  public end(record: any): boolean {
    return this.show(record);
  }

  public show(record: any): boolean {
    this.render.showSync(this.format(record));
    return true;
  }

  public format(record: any): string {
    const level = record.level as keyof typeof nameFromLevel;
    const levelName = nameFromLevel[level];

    if (level <= 10) {
      const json = JSON.stringify(record);
      return `${levelName} - ${record.msg} (${json})`;
    } else {
      return `${levelName} - ${record.msg}`;
    }
  }
}