import { SchemaJson, MeshRenderer, Node } from '@drecom/scene-graph-schema';
import { expect } from 'chai';
import { spy } from 'sinon';
import { describe, it } from 'mocha';

import { sgmed } from '@drecom/scene-graph-mediator-cli';

import DefaultAssetExporter from '../../../src/exporter/asset/DefaultAssetExporter';

const mockUrl  = 'http://127.0.0.1';
const mockPath = __filename;

const nodeFixture: Node = {
  id: '',
  name: '',
  constructorName: '',
  transform3d: {
    x: 0,
    y: 0,
    z: 0,
    rotation: {
      x: 0,
      y: 0,
      z: 0
    }
  }
};
const meshRendererFixture: Node = {
  id: '',
  name: '',
  constructorName: '',
  transform3d: {
    x: 0,
    y: 0,
    z: 0,
    rotation: {
      x: 0,
      y: 0,
      z: 0
    }
  },
  meshRenderer: {
    mesh: {
      url: mockPath
    },
    materials: [
      {
        url: mockPath
      }
    ]
  }
};
const sceneGraphFixture: SchemaJson = {
  scene: [
    nodeFixture,
    meshRendererFixture
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
} as any;

const sceneGraphMapFixture = new Map<string, SchemaJson>([['testGraph', sceneGraphFixture]]);

describe('AssetExporter::DefaultAssetExporter',  () => {
  let instance = new DefaultAssetExporter();

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
    const subjectMeshRenderer: MeshRenderer = {};

    const exportMapEntityFixture: sgmed.AssetExportMapEntity = {
      localSrcPath:  '',
      localDestPath: '',
      url: mockUrl
    };

    describe('when scene graph node contains meshRenderer', () => {
      nodeFixture.meshRenderer = subjectMeshRenderer;

      describe('when meshRenderer has mesh.url property', () => {
        before(() => { subjectMeshRenderer.mesh = { url: mockPath }; });

        it ('should set url of export map entity to scene graph node\'s mesh.url', () => {
          expect(subjectMeshRenderer.mesh!.url).to.equal(mockPath);

          subject(
            new Map<string, SchemaJson>([['testGraph', sceneGraphFixture]]),
            new Map<string, sgmed.AssetExportMapEntity>([[subjectMeshRenderer.mesh!.url as string, exportMapEntityFixture]])
          );

          expect(subjectMeshRenderer.mesh!.url).to.equal(mockUrl);
        });
      });
      describe('when meshRenderer has materials property consists of object contains url property ', () => {
        it ('should set url of export map entity to scene graph node\'s materials[].url', () => {
          before(() => { subjectMeshRenderer.materials = [{  url: mockPath }]; });

          it ('should set url of export map entity to scene graph node ', () => {
            expect(subjectMeshRenderer.materials![0].url).to.equal(mockPath);

            subject(
              new Map<string, SchemaJson>([['testGraph', sceneGraphFixture]]),
              new Map<string, sgmed.AssetExportMapEntity>([[subjectMeshRenderer.materials![0].url as string, exportMapEntityFixture]])
            );

            expect(subjectMeshRenderer.materials![0].url).to.equal(mockUrl);
          });
        });
      });
    });

    describe('when plugins are given', () => {
      it('should invoke plugin\'s replaceExtendedPaths', () => {
        const replaceExtendedPathsSpy = spy();

        subject(
          new Map<string, SchemaJson>(),
          new Map<string, sgmed.AssetExportMapEntity>(),
          new Map([['testPlugin', { replaceExtendedPaths: replaceExtendedPathsSpy } as any]])
        );

        expect(replaceExtendedPathsSpy.getCalls().length).to.greaterThan(0);
      });
    });

    describe('when plugins are not given', () => {
      it('should not invoke plugin\'s replaceExtendedPaths', () => {
        const replaceExtendedPathsSpy = spy();

        subject(new Map<string, SchemaJson>(), new Map<string, sgmed.AssetExportMapEntity>());

        expect(replaceExtendedPathsSpy.getCalls().length).to.equal(0);
      });
    });
  });

  describe('forEachExportingAsset', () => {
    const subject = (instance as any).forEachExportingAsset.bind(instance);
    const mockNode = {
      meshRenderer: {
        mesh: {
          url: '/dev/null',
          stubPropery: true
        }
      }
    };

    it('should invoke callback when any exporting asset is detected', () => {
      const callbackSpy = spy();
      subject(mockNode, callbackSpy);
      expect(callbackSpy.calledOnce).to.be.true;
    });

    it('should pass parent object to callback as first argument', () => {
      let invoked = false;
      subject(mockNode, (owner: any, _key: string, _path: string, _parentAsset?: string) => {
        expect(owner.stubPropery).to.be.true;
        invoked = true;
      });

      expect(invoked).to.be.true;
    });

    it('should pass key name of asset path to callback as second argument', () => {
      let invoked = false;
      subject(mockNode, (_owner: any, key: string, _path: string, _parentAsset?: string) => {
        expect(key).to.equal('url');
        invoked = true;
      });

      expect(invoked).to.be.true;
    });

    it('should pass asset path to callback as third argument', () => {
      let invoked = false;
      subject(mockNode, (_owner: any, _key: string, path: string, _parentAsset?: string) => {
        expect(path).to.equal(mockNode.meshRenderer.mesh.url);
        invoked = true;
      });

      expect(invoked).to.be.true;
    });

    it('should never pass fourth argument', () => {
      let invoked = false;
      subject(mockNode, (_owner: any, _key: string, _path: string, parentAsset?: string) => {
        expect(parentAsset).to.be.undefined;
        invoked = true;
      });

      expect(invoked).to.be.true;
    });
  });

  describe('createExportMapEntity', () => {
    const args = [
      '/asset/root/base/path',
      '/asset/root',
      '/dest/dir',
      '/url/namespace',
      '/asset/root/move/path'
    ];

    describe('when fifth argument is given', () => {
      const subject = (instance as any).createExportMapEntity(...args);

      it('should return object that has localSrcPath property with same value as first argument', () => {
        expect(subject.localSrcPath).to.equal(args[0]);
      });
      it('should return object that has localDestPath property consists of a part of fifth argument', () => {
        const relPath = args[4].replace(args[1], '');
        const macthes = RegExp(`${relPath}$`).test(subject.localDestPath);
        expect(macthes).to.be.true;
      });
      it('should return object that has url property consists of a part of fifth argument', () => {
        const relPath = args[4].replace(args[1], '');
        const matches = RegExp(`${relPath}$`).test(subject.url);
        expect(matches).to.be.true;
      });
    });

    describe('when fifth argument is not given', () => {
      const subject = (instance as any).createExportMapEntity(...args.slice(0, 4));

      it('should return object that has localSrcPath property with same value as first argument', () => {
        expect(subject.localSrcPath).to.equal(args[0]);
      });
      it('should return object that has localDestPath property consists of a part of first argument', () => {
        const relPath = args[0].replace(args[1], '');
        const macthes = RegExp(`${relPath}$`).test(subject.localDestPath);
        expect(macthes).to.be.true;
      });
      it('should return object that has url property consists of a part of first argument', () => {
        const relPath = args[0].replace(args[1], '');
        const matches = RegExp(`${relPath}$`).test(subject.url);
        expect(matches).to.be.true;
      });
    });
  });
});
