import { expect } from 'chai';
import { SinonSpy, spy, stub } from 'sinon';
import { describe, it } from 'mocha';

import ExportManager from '../../src/exporter/ExportManager';

describe('ExportManager',  () => {
  describe('static methods', () => {
    const Klass = ExportManager;

    describe('getSceneExporterClass', () => {
      const subject = Klass.getSceneExporterClass;

      describe('when valid runtime id was given', () => {
        it('should return exporter class', () => {
          expect(subject('cc')).to.not.equal(undefined);
          expect(subject('cc')).to.not.equal(null);
        });
      });

      describe('when invalid runtime id was given', () => {
        it('should return exporter class', () => {
          expect(subject('undefined runtime id')).to.equal(null);
        });
      });
    });

    describe('getAssetExporterClass', () => {
      const subject = Klass.getAssetExporterClass;

      describe('when valid runtime id was given', () => {
        it('should return exporter class', () => {
          expect(subject('cc')).to.not.equal(undefined);
          expect(subject('cc')).to.not.equal(null);
        });
      });

      describe('when invalid runtime id was given', () => {
        it('should not return exporter class', () => {
          expect(subject('undefined runtime id')).to.equal(null);
        });
      });
    });
  });

  describe('instance methods', () => {
    const instance = new ExportManager();

    describe('loadPlugins', () => {
      const subject = instance.loadPlugins.bind(instance);

      describe('when valid path was given', () => {
        it('should throw uncaught error', () => {
          expect(() => subject('/dev/null')).to.throw(Error);
        });
      });
    });

    describe('exportScene', () => {
      const subject = instance.exportScene.bind(instance);

      let exporterInstanceSpies: SinonSpy[] = [];

      class ExportSceneStub {
        public createSceneGraphSchemas!: SinonSpy;

        constructor() {
          this.createSceneGraphSchemas = spy();
          exporterInstanceSpies = [
            this.createSceneGraphSchemas
          ];
        }
      };

      it('should call exposed interface of SceneExporter', () => {
        const stubbed = stub(ExportManager, 'getSceneExporterClass');
        stubbed.callsFake(() => { return ExportSceneStub; });

        subject('invalid runtime id', [], '');
        exporterInstanceSpies.forEach((item) => expect(item.calledOnce).to.equal(true));

        stubbed.reset();
      });

      describe('when invalid runtime identifier was given', () => {
        it('should throw managed error', () => {
          expect(() => subject('invalid runtime id', [], '')).to.throw(Error);
        });
      });
    });

    describe('exportAsset', () => {
      const subject = instance.exportAsset.bind(instance);

      let exporterInstanceSpies: SinonSpy[] = [];

      class ExportAssetStub {
        public createExportMap!: SinonSpy;
        public replacePaths!:    SinonSpy;

        constructor() {
          this.createExportMap = spy();
          this.replacePaths    = spy();

          exporterInstanceSpies = [
            this.createExportMap,
            this.replacePaths
          ];
        }
      };

      it('should call exposed interface of AssetExporter', () => {
        const stubbed = stub(ExportManager, 'getAssetExporterClass');
        stubbed.callsFake(() => { return ExportAssetStub; });

        subject('invalid runtime id', [], '');
        exporterInstanceSpies.forEach((item) => expect(item.calledOnce).to.equal(true));

        stubbed.reset();
      });

      describe('when invalid runtime identifier was given', () => {
        it('should throw managed error', () => {
          expect(() => subject(null, 'invalid runtime id', [], '')).to.throw(Error);
        });
      });
    });
  });
});
