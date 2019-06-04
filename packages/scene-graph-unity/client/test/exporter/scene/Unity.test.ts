import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { fake, spy } from 'sinon';
import { describe, it, before, after } from 'mocha';

import * as yaml from 'yaml';

import DefaultSceneExporter from '../../../src/exporter/scene/DefaultSceneExporter';

const mockYamlFile = path.resolve(__dirname, '../../fixture/mock_scene.unity');
const MockSceneJson = fs.readFileSync(mockYamlFile, 'utf-8');

const mockPath = __filename;

describe('SceneExporter::DefaultSceneExporter',  () => {
  let instance = new DefaultSceneExporter();

  describe('getIdentifier', () => {
    const subject = instance.getIdentifier.bind(instance);

    it('should return not empty string', () => {
      expect(typeof subject()).to.equal('string');
      expect(subject().length).to.greaterThan(0);
    });
  });

  describe('createSceneGraphSchemas', () => {
    const subject = instance.createSceneGraphSchemas.bind(instance);

    before(() => {
      instance.loadSceneFile    = fake.returns({});
      instance.createSceneGraph = fake.returns({});
    });
    after(() => {
      instance = new DefaultSceneExporter();
    });

    it('should invoke exposed api (loadSceneFile, createSceneGraph)', () => {
      subject([mockPath], __dirname);

      expect((instance.loadSceneFile as any).getCalls().length).to.greaterThan(0);
      expect((instance.createSceneGraph as any).getCalls().length).to.greaterThan(0);
    });

    describe('when plugins are given', () => {
      it('should invoke exposed pluginPostProcess method', () => {
        const pluginPostProcessSpy = spy(instance, 'pluginPostProcess');

        subject([mockPath], __dirname, new Map([['testPlugin', { extendSceneGraph: () => {}}]]));
        expect(pluginPostProcessSpy.getCalls().length).to.greaterThan(0);

        pluginPostProcessSpy.restore();
      });

      it('should invoke exposed plugin\'s extendSceneGraph method', () => {
        const extendSceneGraphSpy = spy();

        subject([mockPath], __dirname, new Map([['testPlugin', { extendSceneGraph: extendSceneGraphSpy }]]));
        expect(extendSceneGraphSpy.getCalls().length).to.greaterThan(0);
      });
    });

    describe('when plugins are not given', () => {
      it('should not invoke exposed pluginPostProcess method', () => {
        const pluginPostProcessSpy = spy(instance, 'pluginPostProcess');

        subject([mockPath], __dirname);
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

      subject({} as any, [], new Map() as any, plugins);
      expect(extendSceneGraphSpy.getCalls().length).to.greaterThan(0);
    });
  });

  describe('createSceneGraph', () => {
    const subject = instance.createSceneGraph.bind(instance);

    it('should return object with runtime specific metadata', () => {
      const graph = subject({});

      expect(graph.metadata.positiveCoord.xRight).to.equal(true);
      expect(graph.metadata.positiveCoord.yDown).to.equal(false);
      expect(graph.metadata.baseCoordinate.x).to.equal('center');
      expect(graph.metadata.baseCoordinate.y).to.equal('center');
      expect(graph.metadata.baseCoordinate.z).to.equal('center');
      expect(graph.metadata.format).to.equal(instance.getIdentifier());
    });

    it('should assign yaml document anchor as node id', () => {
      const graph = subject(MockSceneJson);
      const documents = yaml.parseAllDocuments(MockSceneJson);
      graph.scene.forEach((node: any) => {
        const anchors: string[] = [];
        documents.forEach((document) => {
          anchors.push(Object.keys((document.anchors as any).map)[0]);
        });

        expect(anchors.indexOf(node.id)).to.not.equal(-1);
      });
    });
  });
});
