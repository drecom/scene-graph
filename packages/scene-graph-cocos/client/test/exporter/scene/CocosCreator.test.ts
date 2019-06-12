import { expect } from 'chai';
import { SinonStub, fake, spy, stub } from 'sinon';
import { describe, it, before, after } from 'mocha';

import { sgmed } from '@drecom/scene-graph-mediator-cli';

import * as cc from '../../../src/interface/CocosCreator';
import DefaultSceneExporter from '../../../src/exporter/scene/DefaultSceneExporter';

const MockSceneJson = require('../../fixture/mock_scene.fire.json');

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

    let scanStub: SinonStub<[(string | undefined)?], void>;

    before(() => {
      instance.loadSceneFile    = fake.returns({});
      instance.createSceneGraph = fake.returns({});

      scanStub = stub(sgmed.AssetFileMap.prototype, 'scan');
    });
    after(() => {
      scanStub.reset();
      instance = new DefaultSceneExporter();
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

      subject({} as any, [], new Map() as any, plugins);
      expect(extendSceneGraphSpy.getCalls().length).to.greaterThan(0);
    });
  });

  describe('createSceneGraph', () => {
    const subject = instance.createSceneGraph.bind(instance);

    it('should return object with runtime specific metadata', () => {
      const graph = subject(['/dev/null']);

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

    describe('appendComponentByType', () => {
      describe('Sprite', () => {
        const component = {
          __type__: cc.MetaTypes.SPRITE,
          _spriteFrame: 'mock',
          _atlas: 'mock'
        };
        const mockData = {
          frameName: 'test_frame_name',
          url: '/test/url',
          atlasUrl: '/test/atlas/url'
        };
        it('should append sprite property to first argument', () => {
          const schema: any = {};
          const findSpriteData = stub(anyInstance, 'findSpriteData').callsFake(() => mockData);

          anyInstance.appendComponentByType(schema, component, new Map());

          expect(schema.sprite).to.not.be.undefined;
          expect(schema.sprite.frameName).to.equal(mockData.frameName);
          expect(schema.sprite.url).to.equal(mockData.url);
          expect(schema.sprite.atlasUrl).to.equal(mockData.atlasUrl);

          findSpriteData.restore();
        });
        describe('when findSpriteData returns object with submeta', () => {
          it('should append slice property to sprite', () => {
            const schema: any = {};
            const submeta = {
              submeta: {
                borderTop: 1,
                borderBottom: 2,
                borderLeft: 3,
                borderRight: 4
              }
            };
            const findSpriteData = stub(anyInstance, 'findSpriteData').callsFake(() => Object.assign(submeta, mockData));

            anyInstance.appendComponentByType(schema, component, new Map());

            expect(schema.sprite.slice).to.not.be.undefined;
            expect(schema.sprite.slice.top).to.equal(submeta.submeta.borderTop);
            expect(schema.sprite.slice.bottom).to.equal(submeta.submeta.borderBottom);
            expect(schema.sprite.slice.left).to.equal(submeta.submeta.borderLeft);
            expect(schema.sprite.slice.right).to.equal(submeta.submeta.borderRight);

            findSpriteData.restore();
          });
        });
        describe('when findSpriteData returns object without submeta', () => {
          it('should not append slice property to sprite', () => {
            const schema: any = {};
            const findSpriteData = stub(anyInstance, 'findSpriteData').callsFake(() => mockData);

            anyInstance.appendComponentByType(schema, component, new Map());

            expect(schema.sprite.slice).to.be.undefined;

            findSpriteData.restore();
          });
        });
      });

      describe('Label', () => {
        const component = {
          __type__: cc.MetaTypes.LABEL,
          _N$string: 'test_text',
          _fontSize: 100,
          _N$horizontalAlign: 1
        };
        it('should append text property to first argument', () => {
          const schema: any = {};
          anyInstance.appendComponentByType(schema, component, new Map());

          expect(schema.text).to.not.be.undefined;
          expect(schema.text.text).to.equal(component._N$string);
          expect(schema.text.style.size).to.equal(component._fontSize);
          expect(schema.text.style.horizontalAlign).to.equal(component._N$horizontalAlign);
        });
        it('should set default fill color as white', () => {
          const schema: any = {};
          anyInstance.appendComponentByType(schema, component, new Map());

          expect(schema.text.style.color.toLowerCase()).to.equal('#ffffff');
        });
        describe('when first argument has renderer with color property', () => {
          it('should set color property value as renderer color', () => {
            const schema: any = {
              renderer: {
                color:{
                  r: 255,
                  g: 0,
                  b: 0
                }
              }
            };
            anyInstance.appendComponentByType(schema, component, new Map());

            expect(schema.text.style.color.toLowerCase()).to.equal('#ff0000');
          });
        });
      });
    });
    describe('RichText', () => {
      const component = {
        __type__: cc.MetaTypes.RICH_TEXT,
        _N$string: 'test_rich_text',
        _N$fontSize: 120,
        _N$horizontalAlign: 1
      };
      it('should append text property to first argument', () => {
        const schema: any = {};
        anyInstance.appendComponentByType(schema, component, new Map());

        expect(schema.text).to.not.be.undefined;
        expect(schema.text.text).to.equal(component._N$string);
        expect(schema.text.style.size).to.equal(component._N$fontSize);
        expect(schema.text.style.horizontalAlign).to.equal(component._N$horizontalAlign);
      });
      it('should set default fill color as white', () => {
        const schema: any = {};
        anyInstance.appendComponentByType(schema, component, new Map());

        expect(schema.text.style.color.toLowerCase()).to.equal('#ffffff');
      });
      it('should append richText property to text', () => {
        const schema: any = {};
        anyInstance.appendComponentByType(schema, component, new Map());

        expect(schema.text.richText).to.not.be.undefined;
      });
      it('should append richText.format with cc.RICH_TEXT_FORMAT const value', () => {
        const schema: any = {};
        anyInstance.appendComponentByType(schema, component, new Map());

        expect(schema.text.richText.format).to.equal(cc.RICH_TEXT_FORMAT);
      });
      describe('when first argument has renderer with color property', () => {
        it('should set color property value as renderer color', () => {
          const schema: any = {
            renderer: {
              color:{
                r: 255,
                g: 0,
                b: 0
              }
            }
          };
          anyInstance.appendComponentByType(schema, component, new Map());

          expect(schema.text.style.color.toLowerCase()).to.equal('#ff0000');
        });
      });
    });

    describe('Layout', () => {
      const component = {
        __type__: cc.MetaTypes.LAYOUT,
        _layoutSize: { width: 1, height: 2 },
        _resize: 1,
        _N$layoutType: 2,
        _N$cellSize: { width: 3, height: 4 },
        _N$startAxis: 3,
        _N$paddingLeft: 4,
        _N$paddingRight: 5,
        _N$paddingTop: 6,
        _N$paddingBottom: 7,
        _N$spacingX: 8,
        _N$spacingY: 9,
        _N$verticalDirection: 10,
        _N$horizontalDirection: 11
      };
      it('should append layout property to first argument', () => {
        const schema: any = {};
        anyInstance.appendComponentByType(schema, component, new Map());

        expect(schema.layout.layoutSize).to.equal(component._layoutSize);
        expect(schema.layout.resize).to.equal(component._resize);
        expect(schema.layout.layoutType).to.equal(component._N$layoutType);
        expect(schema.layout.cellSize).to.equal(component._N$cellSize);
        expect(schema.layout.startAxis).to.equal(component._N$startAxis);
        expect(schema.layout.paddingLeft).to.equal(component._N$paddingLeft);
        expect(schema.layout.paddingRight).to.equal(component._N$paddingRight);
        expect(schema.layout.paddingTop).to.equal(component._N$paddingTop);
        expect(schema.layout.paddingBottom).to.equal(component._N$paddingBottom);
        expect(schema.layout.spacingX).to.equal(component._N$spacingX);
        expect(schema.layout.spacingY).to.equal(component._N$spacingY);
        expect(schema.layout.verticalDirection).to.equal(component._N$verticalDirection);
        expect(schema.layout.horizontalDirection).to.equal(component._N$horizontalDirection);
      });
    });

    describe('Mask', () => {
      const component = {
        __type__: cc.MetaTypes.MASK,
        _type: 1,
        _N$inverted: false
      };
      it('should append layout property to first argument', () => {
        const schema: any = {};
        anyInstance.appendComponentByType(schema, component, new Map());

        expect(schema.mask.maskType).to.equal(component._type);
        expect(schema.mask.inverted).to.equal(component._N$inverted);
      });
    });

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
