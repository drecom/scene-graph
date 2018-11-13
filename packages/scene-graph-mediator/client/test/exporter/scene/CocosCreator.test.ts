import { expect } from 'chai';
import { SinonStub, fake, spy, stub } from 'sinon';
import { describe, it, before, after } from 'mocha';

import CocosCreator from '../../../src/exporter/scene/CocosCreator';
import AssetFileMap from '../../../src/asset/AssetFileMap';

const MockSceneJson = require('../../fixture/mock_scene.fire.json');

describe('SceneExporter::CocosCreator',  () => {
  let instance = new CocosCreator();


  describe('getIdentifier', () => {
    const subject = instance.getIdentifier.bind(instance);

    it('should return not empty string', () => {
      expect(typeof subject()).to.equal('string');
      expect(subject().length).to.greaterThan(0);
    });
  });

  describe('createSceneGraphSchemas', () => {
    const subject = instance.createSceneGraphSchemas.bind(instance);

    let scanStub: SinonStub;

    before(() => {
      instance.loadSceneFile    = fake.returns({});
      instance.createSceneGraph = fake.returns({});

      scanStub = stub(AssetFileMap.prototype, 'scan');
    });
    after(() => {
      scanStub.reset();
      instance = new CocosCreator();
    });

    it('should invoke exposed api (loadSceneFile, createSceneGraph)', () => {
      subject(['/dev/null'], '/dev/null');

      expect((instance.loadSceneFile as any).getCalls().length).to.greaterThan(0);
      expect((instance.createSceneGraph as any).getCalls().length).to.greaterThan(0);
    });

    describe('when plugins are given', () => {
      it('should invoke exposed pluginPostProcess method', () => {
        const pluginPostProcessSpy = spy(instance, 'pluginPostProcess');

        subject(['/dev/null'], '/dev/null', new Map([['testPlugin', { extendSceneGraph: () => {}}]]));
        expect(pluginPostProcessSpy.getCalls().length).to.greaterThan(0);

        pluginPostProcessSpy.restore();
      });

      it('should invoke exposed plugin\'s extendSceneGraph method', () => {
        const extendSceneGraphSpy = spy();

        subject(['/dev/null'], '/dev/null', new Map([['testPlugin', { extendSceneGraph: extendSceneGraphSpy }]]));
        expect(extendSceneGraphSpy.getCalls().length).to.greaterThan(0);
      });
    });

    describe('when plugins are not given', () => {
      it('should not invoke exposed pluginPostProcess method', () => {
        const pluginPostProcessSpy = spy(instance, 'pluginPostProcess');

        subject(['/dev/null'], '/dev/null');
        expect(pluginPostProcessSpy.getCalls().length).to.equal(0);

        pluginPostProcessSpy.restore();
      });
    });
  });

  describe('pluginPostProcess', () => {
    const subject = instance.pluginPostProcess.bind(instance);

    it('should invoke extendSceneGraph of own plugins', () => {
      const extendSceneGraphSpy = spy();

      const plugins = new Map();
      plugins.set('testPlugin', { extendSceneGraph: extendSceneGraphSpy });

      subject({}, [], new Map(), plugins);
      expect(extendSceneGraphSpy.getCalls().length).to.greaterThan(0);
    });
  });

  describe('createSceneGraph', () => {
    const subject = instance.createSceneGraph.bind(instance);

    it('should return object with runtime specific metadata', () => {
      const graph = subject(['/dev/null'], '/dev/null');

      expect(graph.metadata.positiveCoord.xRight).to.equal(true);
      expect(graph.metadata.positiveCoord.yDown).to.equal(false);
      expect(graph.metadata.baseCoordinate.x).to.equal('center');
      expect(graph.metadata.baseCoordinate.y).to.equal('center');
      expect(graph.metadata.format).to.equal(instance.getIdentifier());
    });

    it('should only assign cc.Node type as scene graph nodes', () => {
      const graph = subject(MockSceneJson);
      const nodes = MockSceneJson.filter((item: any) => {
        return item.__type__ === 'cc.Node';
      });
      expect(graph.scene.length).to.equal(nodes.length);
    });

    it('should assign index in scene file as node id', () => {
      const graph = subject(MockSceneJson);
      graph.scene.forEach((node: any) => {
        const cocosNode = MockSceneJson[parseInt(node.id)];
        expect(cocosNode._name).to.equal(node.name);
      });
    });
  });

  describe('non-public methods', () => {
    const anyInstance = (instance as any);

    describe('colorToHexString', () => {
      // protected
      const subject = anyInstance.colorToHexString.bind(instance);

      it('should return color code described in hex', () => {
        const color = {
          r: 0xfe,
          g: 0xdc,
          b: 0xba
        };

        expect(subject(color)).to.equal('fedcba');
      });

      describe('when color value is less than 0x10', () => {

        it('should fill second digit with zero', () => {
          const color = {
            r: 0x0e,
            g: 0x0f,
            b: 0x10
          };

          expect(subject(color)).to.equal('0e0f10');
        });
      });
    });
  });
});
