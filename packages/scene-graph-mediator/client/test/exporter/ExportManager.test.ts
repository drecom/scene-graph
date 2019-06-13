import { expect } from 'chai';
import { spy } from 'sinon';
import { describe, it } from 'mocha';

import ExportManager from '../../src/exporter/ExportManager';

describe('ExportManager',  () => {
  describe('static methods', () => {
    describe('registerExporterClass', () => {
      const subject = ExportManager.registerExporterClass.bind(ExportManager);
      it('should set new entity to exporters property', () => {
        expect((ExportManager as any).exporters.size).to.equal(0);
        subject('test', {} as any, {} as any);
        expect((ExportManager as any).exporters.size).to.equal(1);
      });
    });
  });

  describe('instance methods', () => {
    const instance = new ExportManager();

    describe('loadPlugins', () => {
      const subject = instance.loadPlugins.bind(instance);

      describe('when invalid path was given', () => {
        it('should throw uncaught error', () => {
          expect(() => subject('/dev/null')).to.throw(Error);
        });
      });
    });

    describe('exportScene', () => {
      const subject = instance.exportScene.bind(instance);

      const validRuntimeName   = 'test_runtime';
      const invalidRuntimeName = 'invalid_test_runtime';

      const stubExporters = { scene: {} as any, asset: {} };
      before(() => {
        (ExportManager as any).exporters = new Map();
        (ExportManager as any).exporters.set(validRuntimeName, stubExporters);
      });

      describe('when valid runtime identifier was given', () => {
        before(() => { stubExporters.scene = spy(); });

        it('should instantiate scene exporter class', () => {
          try {
            subject(validRuntimeName, [], '');
          } catch(e) {}
          expect(stubExporters.scene.calledWithNew()).to.be.true;
        });
      });

      describe('when invalid runtime identifier was given', () => {
        before(() => { stubExporters.scene = spy(); });

        it('should throw managed error', () => {
          expect(() => subject(invalidRuntimeName, [], '')).to.throw(Error);
          expect(stubExporters.scene.calledWithNew()).to.be.false;
        });
      });
    });

    describe('exportAsset', () => {
      const subject = instance.exportAsset.bind(instance);

      const validRuntimeName   = 'test_runtime';
      const invalidRuntimeName = 'invalid_test_runtime';

      const stubExporters = { scene: {}, asset: {} as any };
      before(() => {
        (ExportManager as any).exporters = new Map();
        (ExportManager as any).exporters.set(validRuntimeName, stubExporters);
      });

      describe('when valid runtime identifier was given', () => {
        before(() => { stubExporters.asset = spy(); });

        it('should instantiate asset exporter class', () => {
          try {
            subject(new Map(), validRuntimeName, [], '');
          } catch(e) {}
          expect(stubExporters.asset.calledWithNew()).to.be.true;
        });
      });

      describe('when invalid runtime identifier was given', () => {
        before(() => { stubExporters.asset = spy(); });

        it('should throw managed error', () => {
          expect(() => subject(new Map(), invalidRuntimeName, [], '')).to.throw(Error);
          expect(stubExporters.asset.calledWithNew()).to.be.false;
        });
      });
    });
  });
});
