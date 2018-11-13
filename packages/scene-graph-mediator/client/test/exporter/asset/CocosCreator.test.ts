import { SchemaJson, Sprite, Node } from '@drecom/scene-graph-schema';
import { expect } from 'chai';
import { spy } from 'sinon';
import { describe, it } from 'mocha';

import CocosCreator from '../../../src/exporter/asset/CocosCreator';
import AssetExportMapEntity from '../../../src/interface/AssetExportMapEntity';

const mockUrl  = 'http://127.0.0.1';
const mockPath = '/dev/null';

const nodeFixture: Node = {
  id: '',
  name: '',
  constructorName: '',
  transform: {
    x: 0,
    y: 0,
    anchor: {
      x:0,
      y: 0,
    }
  }
};
const sceneGraphFixture: SchemaJson = {
  scene: [
    nodeFixture
  ],
  metadata: {
    width: 0,
    height: 0,
    positiveCoord: {
      xRight: true,
      yDown: true
    }
  }
};

const mockPlugin = {
  extendSceneGraph: () => {},
  getExportMapExtendPaths: () => {
    return [];
  }
};

const sceneGraphMapFixture = new Map<string, SchemaJson>([['testGraph', sceneGraphFixture]]);

describe('AssetExporter::CocosCreator',  () => {
  let instance = new CocosCreator();

  describe('getIdentifier', () => {
    const subject = instance.getIdentifier.bind(instance);

    it('should return not empty string', () => {
      expect(typeof subject()).to.equal('string');
      expect(subject().length).to.greaterThan(0);
    });
  });

  describe('createExportMap', () => {
    const subject = instance.createExportMap.bind(instance);

    describe('when plugins are given', () => {
      it('should invoke exposed pluginPostProcess method', () => {
        const pluginPostProcessSpy = spy(instance, 'pluginPostProcess');

        subject(sceneGraphMapFixture, mockPath, mockPath, 'testNameSPace', new Map([['testPlugin', mockPlugin]]));
        expect(pluginPostProcessSpy.getCalls().length).to.greaterThan(0);

        pluginPostProcessSpy.restore();
      });
      it('should invoke exposed plugin\'s getExportMapExtendPaths method', () => {
        const extendSceneGraphSpy = spy(mockPlugin, 'getExportMapExtendPaths');

        subject(sceneGraphMapFixture, mockPath, mockPath, 'testNameSPace', new Map([['testPlugin', mockPlugin]]));
        expect(extendSceneGraphSpy.getCalls().length).to.greaterThan(0);

        extendSceneGraphSpy.restore();
      });
    });

    describe('when plugins are not given', () => {
      it('should not invoke exposed getExportMapExtendPaths method', () => {
        const extendSceneGraphSpy = spy(mockPlugin, 'getExportMapExtendPaths');

        subject(sceneGraphMapFixture, mockPath, mockPath, 'testNameSPace');
        expect(extendSceneGraphSpy.getCalls().length).to.equal(0);

        extendSceneGraphSpy.restore();
      });
    });
  });

  describe('replacePaths', () => {
    const subject = instance.replacePaths.bind(instance);
    const subjectSprite: Sprite = {};

    const exportMapEntityFixture: AssetExportMapEntity = {
      localSrcPath:  '',
      localDestPath: '',
      url: mockUrl
    };

    describe('when scene graph node contains sprite', () => {
      nodeFixture.sprite = subjectSprite;

      describe('when sprite has url property', () => {
        subjectSprite.url = mockPath;

        it ('should set url of export map entity to scene graph node\'s url', () => {
          expect(subjectSprite.url).to.equal(mockPath);

          subject(
            new Map<string, SchemaJson>([['testGraph', sceneGraphFixture]]),
            new Map<string, AssetExportMapEntity>([[subjectSprite.url as string, exportMapEntityFixture]])
          );

          expect(subjectSprite.url).to.equal(mockUrl);
        });
      });
      describe('when sprite has atlasUrl property', () => {
        it ('should set url of export map entity to scene graph node\'s atlasUrl', () => {
          subjectSprite.atlasUrl = mockPath;

          it ('should set url of export map entity to scene graph node ', () => {
            expect(subjectSprite.atlasUrl).to.equal(mockPath);

            subject(
              new Map<string, SchemaJson>([['testGraph', sceneGraphFixture]]),
              new Map<string, AssetExportMapEntity>([[subjectSprite.atlasUrl as string, exportMapEntityFixture]])
            );

            expect(subjectSprite.atlasUrl).to.equal(mockUrl);
          });
        });
      });
    });

    describe('when plugins are given', () => {
      it('should invoke plugin\'s replaceExtendedPaths', () => {
        const replaceExtendedPathsSpy = spy();

        subject(
          new Map<string, SchemaJson>(),
          new Map<string, AssetExportMapEntity>(),
          new Map([['testPlugin', { replaceExtendedPaths: replaceExtendedPathsSpy }]])
        );

        expect(replaceExtendedPathsSpy.getCalls().length).to.greaterThan(0);
      });
    });

    describe('when plugins are not given', () => {
      it('should not invoke plugin\'s replaceExtendedPaths', () => {
        const replaceExtendedPathsSpy = spy();

        subject(new Map<string, SchemaJson>(), new Map<string, AssetExportMapEntity>());

        expect(replaceExtendedPathsSpy.getCalls().length).to.equal(0);
      });
    });
  });
});
