import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';

export function setupTests(): void {
  chai.use(chaiAsPromised);
  chai.use(sinonChai);
}

setupTests();
