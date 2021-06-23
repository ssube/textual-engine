import { defer, doesExist } from '@apextoaster/js-utils';
import { useFocusManager } from 'ink';

export function removeEscapes(frame?: string): string {
  if (doesExist(frame)) {
    // eslint-disable-next-line no-control-regex
    return frame.replace(/\u001B\[\d*m/g, '');
  } else {
    return '';
  }
}

export async function sendKeys(stream: any, interval: number, keys: Array<string>): Promise<void> {
  for (const key of keys) {
    stream.write(key);
    await defer(interval);
  }
}

export const FocusWrapper = (props: any) => {
  useFocusManager();

  return props.children;
};
