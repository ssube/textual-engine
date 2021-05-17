import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

export function setupTests(): void {
  chai.use(chaiAsPromised);
}

setupTests();
