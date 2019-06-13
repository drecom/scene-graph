import assert from 'power-assert';
import * as sinon from 'sinon';
import Three from '../../src/importer/Three';

import FbxLoader from '../../src/runtime_helper/loaders/FbxLoader';

class FakeLoader {
  load(url, onLoad, onProgress, onError) {
    // noop
  }
}

describe('Three', () => {
  describe('import', () => {
    const three = new Three();

    // fixtures
    const gameObject = {
      id: 'gameObjectId',
      name: 'gameObject',
      constructorName: 'GameObject',
      transform3d: {
        x: 0, y: 0, z: 0,
        scale: { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0, w: 1 }
      }
    };
    const meshRenderer = {
      id: 'meshRendereObjectId',
      name: 'meshRendereObject',
      constructorName: 'GameObject',
      transform3d: {
        x: 0, y: 0, z: 0,
        scale: { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0, w: 1 }
      },
      meshRenderer: {
        mesh: {
          url: 'path/to/mesh.fbx'
        },
        materials: [
          { url: 'path/to/material_1.tga' },
          { url: 'path/to/material_2.tga' }
        ]
      }
    };

    const metadata = {
      width:  640,
      height: 1136,
      positiveCoord: {
        xRight: true,
        yDown:  true
      },
      format: 'unity'
    };

    describe('import', () => {
      const graph = {
        scene: [ gameObject ],
        metadata: metadata
      };

      it ('should return THREE.Group instance', () => {
        const root = three.import(graph);
        assert.ok(root.constructor.name === 'Group');
      });
      it ('should invoke callback', () => {
        const spyCallback = sinon.spy();
        three.import(graph, spyCallback, {});
        assert.ok(spyCallback.calledOnce);
      });

      describe('when plugin given', () => {
        it('should invoke extendRuntimeObjects', () => {
          const plugin = {
            createRuntimeObject: ()=>{},
            extendRuntimeObjects: ()=>{}
          };
          const extendRuntimeObjectsSpy = sinon.spy(plugin, 'createRuntimeObject');

          three.addPlugin(plugin);
          three.import({
            scene: [ gameObject ],
            metadata: metadata
          });

          assert.ok(extendRuntimeObjectsSpy.called);
        });

        it('should not occurs error when extendRuntimeObjects not implement', () => {
          const plugin = {
            extendRuntimeObjects: ()=>{}
          };

          three.addPlugin(plugin);
          assert.doesNotThrow(() => {
            three.import({
              scene: [ gameObject ],
              metadata: metadata
            });
          });
        });
      });
    });

    describe('createAssetMap', () =>{
      let onAddLoaderAsset;

      before(() => {
        onAddLoaderAsset = sinon.spy(three, 'onAddLoaderAsset');
      });
      after(() => {
        three.onAddLoaderAsset.restore();
      });

      describe('scene graph with no assets', () => {
        const graph = {
          scene: [ gameObject ],
          metadata: metadata
        };

        it ('should not invoke onAddLoaderAsset', () => {
          three.createAssetMap(graph);
          assert.ok(onAddLoaderAsset.notCalled);
        });

        it ('should returns map with no items', () => {
          const map = three.createAssetMap(graph);
          assert.strictEqual(map.size, 0);
        });
      });

      describe('scene graph with assets', () => {
        const graph = {
          scene: [ meshRenderer ],
          metadata: metadata
        };

        it ('should invoke onAddLoaderAsset', () => {
          three.createAssetMap(graph);
          assert.ok(onAddLoaderAsset.called);
        });

        it ('should returns map with items', () => {
          const map = three.createAssetMap(graph);
          assert.ok(map.size > 0);
        });
      });
    });

    describe('getThreeLoaderByAssetType', () => {
      let type;
      let format;

      const subject = () => three.getThreeLoaderByAssetType(type, format);

      describe('when format is unity', () => {
        before(() => { format = 'unity'; });

        describe('when type is "fbx"', () => {
          before(() => { type = 'fbx'; });

          it ('should return FbxLoader', () => {
            assert.strictEqual(subject().constructor.name, 'FbxLoader');
          });
        });
        describe('when type is "mat"', () => {
          before(() => { type = 'mat'; });

          it ('should return TgaLoader', () => {
            assert.strictEqual(subject().constructor.name, 'TgaLoader');
          });
        });
      });
    });
  });
});
