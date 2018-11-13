import { expect } from 'chai';
import { SinonSpy, spy } from 'sinon';
import { describe, it, before, after } from 'mocha';

import AssetFileMap from '../../src/asset/AssetFileMap';

describe('AssetFileMap',  () => {
  const mockArg = '/dev/null';
  describe('constructor', () => {
    it('should set passed value to own assetRoot property', () => {
      const instance = new AssetFileMap(mockArg);
      expect((instance as any).assetRoot).to.equal(mockArg);
    });
    it('should allocate empty Map to own entities property', () => {
      const instance = new AssetFileMap(mockArg);
      expect((instance as any).entities.constructor.name).to.equal('Map');
    });

    describe('when argument is not an absolute path', () => {
      it('should throw error', () => {
        expect(() => new AssetFileMap('dev/null')).to.throw(Error);
      });
    });
  });

  describe('instance methods', () => {
    let instance = new AssetFileMap(mockArg);

    describe('clear', () => {
      const subject = instance.clear.bind(instance);
      let clearSpy: SinonSpy;

      before(() => { clearSpy = spy((instance as any).entities, 'clear'); });
      after(() => clearSpy.restore());

      it('should wrap clear method of entity property', () => {
        subject();
        expect(clearSpy.calledOnce).to.equal(true);
      });
    });

    describe('get', () => {
      const subject = instance.get.bind(instance);
      let getSpy: SinonSpy;

      before(() => { getSpy = spy((instance as any).entities, 'get'); });
      after(() => getSpy.restore());

      it('should wrap get method of entity property', () => {
        subject();
        expect(getSpy.calledOnce).to.equal(true);
      });
    });

    describe('forEach', () => {
      const subject = instance.forEach.bind(instance);
      let forEachSpy: SinonSpy;

      before(() => { forEachSpy = spy((instance as any).entities, 'forEach'); });
      after(() => forEachSpy.restore());

      it('should wrap forEach method of entity property', () => {
        subject(() => {});
        expect(forEachSpy.calledOnce).to.equal(true);
      });
    });
  });
});
