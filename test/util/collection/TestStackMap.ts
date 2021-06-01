import { expect } from 'chai';

import { StackMap } from '../../../src/util/collection/StackMap';

describe('stack map', () => {
  it('should push items onto the existing list for existing keys', async () => {
    const map = new StackMap();
    expect(map.push('foo', 1)).to.equal(1);
    expect(map.push('foo', 1)).to.equal(2);
  });

  it('should push items onto a new list for missing keys', async () => {
    const map = new StackMap();
    expect(map.push('foo', 1)).to.equal(1);
    expect(map.push('bar', 1)).to.equal(1);
    expect(map.size).to.equal(2);
  });

  it('should pop undefined from missing keys', async () => {
    const map = new StackMap();
    expect(map.pop('foo')).to.equal(undefined);
  });

  it('should pop items from existing keys', async () => {
    const key = 'foo';
    const map = new StackMap();
    map.push(key, 1);
    map.push(key, 2);
    map.push(key, 3);

    expect(map.pop(key)).to.equal(3);
    expect(map.pop(key)).to.equal(2);
    expect(map.pop(key)).to.equal(1);
  });

  it('should get an empty list for missing keys', async () => {
    const map = new StackMap();
    map.push('foo', 1);

    expect(map.get('foo')).to.deep.equal([1]);
    expect(map.get('bar')).to.deep.equal([]);
  });

  it('should clear items normally', async () => {
    const map = new StackMap();
    map.push('foo', 1);
    map.push('bar', 1);
    expect(map.size).to.equal(2);

    map.clear();
    expect(map.size).to.equal(0);
  });
});
