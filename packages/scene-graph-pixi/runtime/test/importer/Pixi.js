import assert from 'power-assert';
import { spy } from 'sinon';
import 'pixi.js';
import Pixi from 'importer/Pixi';
import { LayoutComponent } from 'importer/component/Layout';

const parentTestName = 'parentTestName';
const childTestName  = 'childTestName';
const testSpriteUrl  = 'http://127.0.0.1/dummyImage.png';

function clearCache() {
  Pixi.pixiRef.loader.resources = {};
  Pixi.pixiRef.Texture.removeFromCache(parentTestName);
  Pixi.pixiRef.Texture.removeFromCache(childTestName);
  Pixi.pixiRef.Texture.removeFromCache(testSpriteUrl);
  Pixi.pixiRef.BaseTexture.removeFromCache(parentTestName);
  Pixi.pixiRef.BaseTexture.removeFromCache(childTestName);
  Pixi.pixiRef.BaseTexture.removeFromCache(testSpriteUrl);
}

describe('Pixi', () => {
  describe('import', () => {
    const pixi = new Pixi();

    // fixtures
    const parentNode = {
      constructorName: 'Container',
      id:   parentTestName,
      name: parentTestName,
      transform: {
        x: 10,
        y: 10,
        children: [ childTestName ],
        anchor: {
          x: 0,
          y: 0
        }
      }
    };
    const childNode = {
      constructorName: 'Container',
      id:   childTestName,
      name: childTestName,
      transform: {
        x: 20,
        y: 20,
        parent:   parentTestName,
        children: [],
        anchor: {
          x: 0,
          y: 0
        }
      }
    };
    const spriteNode = {
      constructorName: 'Sprite',
      id:   parentTestName,
      name: parentTestName,
      transform: {
        x: 30,
        y: 30,
        children: [],
        anchor: {
          x: 0,
          y: 0
        }
      },
      sprite: {
        url: testSpriteUrl
      }
    };
    const sliceNode = {
      constructorName: 'Sprite',
      id:   parentTestName,
      name: parentTestName,
      transform: {
        x: 0,
        y: 0,
        children: [],
        anchor: {
          x: 0,
          y: 0
        }
      },
      sprite: {
        url: testSpriteUrl,
        slice: {
          top:    10,
          bottom: 20,
          left:   30,
          right:  40
        }
      }
    };
    const textNode = {
      constructorName: 'Text',
      id:   parentTestName,
      name: parentTestName,
      transform: {
        x: 0,
        y: 0,
        anchor: {
          x: 0,
          y: 0
        }
      },
      text: {
        text: 'text text'
      }
    };
    const anchorNode = {
      constructorName: 'Container',
      id:   parentTestName,
      name: parentTestName,
      transform: {
        x: 10,
        y: 10,
        width: 10,
        height: 10,
        anchor: {
          x: 0.5,
          y: 0.5
        },
        children: [childTestName]
      }
    };
    const anchorChildNode = {
      constructorName: 'Container',
      id:   childTestName,
      name: childTestName,
      transform: {
        x: 10,
        y: 10,
        width: 100,
        height: 100,
        anchor: {
          x: 0.5,
          y: 0.5
        },
        parent: parentTestName
      }
    };
    const anchorNoSizeNode = {
      constructorName: 'Container',
      id:   parentTestName,
      name: parentTestName,
      transform: {
        x: 10,
        y: 10,
        anchor: {
          x: 0.5,
          y: 0.5
        },
        children: [childTestName]
      }
    };
    const anchorNoSizeChildNode = {
      constructorName: 'Container',
      id:   childTestName,
      name: childTestName,
      transform: {
        x: 10,
        y: 10,
        anchor: {
          x: 0.5,
          y: 0.5
        },
        parent: parentTestName
      }
    };
    const defaultColorNode = {
      constructorName: 'Container',
      id:   'default color',
      name: 'default color',
      transform: {
        x: 0,
        y: 0,
        anchor: {
          x: 0,
          y: 0
        }
      },
      renderer: {
        color: {
          r: 255,
          g: 255,
          b: 255,
          a: 255
        }
      }
    };
    const colorNode = {
      constructorName: 'Container',
      id:   'color',
      name: 'color',
      transform: {
        x: 0,
        y: 0,
        anchor: {
          x: 0,
          y: 0
        }
      },
      renderer: {
        color: {
          r: 128,
          g: 64,
          b: 192,
          a: 128
        }
      }
    };
    const metadata = {
      width:  640,
      height: 1136,
      positiveCoord: {
        xRight: true,
        yDown:  true
      }
    };

    it ('should create anonymouse root Container', () => {
      const root = pixi.import({
        scene: [],
        metadata: metadata
      });

      assert.strictEqual(root.children.length, 0);
      assert.strictEqual(root.constructor.name, 'Container');
    });

    it ('should add "sgmed" property to Containers in scene', () => {
      const root = pixi.import({
        scene: [ parentNode, childNode ],
        metadata: metadata
      });

      for (let i = 0; i < root.children.length; i++) {
        assert.ok(root.children[i].sgmed);
      }
    });

    it ('should not add "sgmed" property to root Containers', () => {
      const root = pixi.import({
        scene: [ parentNode, childNode ],
        metadata: metadata
      });

      assert.strictEqual(root.sgmed, undefined);
    });

    describe('when plugin given', () => {
      it('should invoke extendRuntimeObjects', () => {
        const plugin = {
          createRuntimeObject: ()=>{},
          extendRuntimeObjects: ()=>{}
        };
        const extendRuntimeObjectsSpy = spy(plugin, 'createRuntimeObject');

        pixi.addPlugin(plugin);
        pixi.import({
          scene: [ parentNode, childNode ],
          metadata: metadata
        });

        assert.ok(extendRuntimeObjectsSpy.called);
      });

      it('should not occurs error when extendRuntimeObjects not implement', () => {
        const plugin = {
          extendRuntimeObjects: ()=>{}
        };

        pixi.addPlugin(plugin);
        assert.doesNotThrow(() => {
          pixi.import({
            scene: [ parentNode, childNode ],
            metadata: metadata
          });
        });
      });
    });

    describe('when schema does not contain resource info', () => {
      it ('should restore scene immediately', () => {
        const callbackSpy = spy();

        const root = pixi.import({
          scene: [ parentNode, childNode ],
          metadata: metadata
        }, callbackSpy);

        assert.ok(callbackSpy.calledOnce);

        assert.strictEqual(root.children.length, 1);

        const parentContainer = root.children[0];

        assert.strictEqual(parentContainer.children.length, 1);

        const childContainer = parentContainer.children[0];

        assert.strictEqual(parentContainer.constructor.name, parentNode.constructorName);
        assert.strictEqual(childContainer.constructor.name,  childNode.constructorName);

        assert.strictEqual(parentContainer.name, parentNode.name);
        assert.strictEqual(childContainer.name,  childNode.name);

        assert.strictEqual(parentContainer.position.x, parentNode.transform.x);
        assert.strictEqual(parentContainer.position.y, parentNode.transform.y);
        assert.strictEqual(childContainer.position.x, childNode.transform.x);
        assert.strictEqual(childContainer.position.y, childNode.transform.y);
      });
    });
    describe('when schema contains resource info', () => {
      it ('should not restore scene immediately', (done) => {
        const callbackSpy = spy();

        const root = pixi.import({
          scene: [ spriteNode ],
          metadata: metadata
        }, () => {
          callbackSpy();
          clearCache();
          done();
        });

        assert.strictEqual(callbackSpy.getCalls().length, 0);
        assert.strictEqual(root.children.length, 0);
      });

      describe('if schema contains sprite', () => {
        it ('should instantiate Sprite', (done) => {
          pixi.import({
            scene: [ spriteNode ],
            metadata: metadata
          }, (root) => {
            assert.strictEqual(root.children[0].constructor.name, 'Sprite');
            clearCache();
            done();
          });
        });
        describe('if sprite node contains slice', () => {
          it ('should instantiate mesh.NineSlicePlane', (done) => {
            pixi.import({
              scene: [ sliceNode ],
              metadata: metadata
            }, (root) => {
              assert.strictEqual(root.children[0].constructor.name, 'NineSlicePlane');
              clearCache();
              done();
            });
          });
        });
      });
      describe('if schema contains text', () => {
        it ('should instantiate Text', (done) => {
          pixi.import({
            scene: [ textNode ],
            metadata: metadata
          }, (root) => {
            assert.strictEqual(root.children[0].constructor.name, 'Text');
            assert.strictEqual(root.children[0].text, textNode.text.text);
            clearCache();
            done();
          });
        });
      });
    });

    describe('ImportOption', () => {
      describe('if option is not given', () => {
        describe('when transform.anchor is not (0, 0)', () => {
          describe('when transform.width/height is not set', () => {
            it ('should not adjust position of root elements by default', () => {
              const root = pixi.import({
                scene: [ anchorNoSizeNode, anchorNoSizeChildNode ],
                metadata: metadata
              });

              const container = root.children[0];
              assert.ok(container.position.x === anchorNode.transform.x);
              assert.ok(container.position.y === anchorNode.transform.y);
            });
            it ('should not adjust position of elements under root elements by default', () => {
              const root = pixi.import({
                scene: [ anchorNoSizeNode, anchorNoSizeChildNode ],
                metadata: metadata
              });

              const container = root.children[0].children[0];
              assert.ok(container.position.x === anchorChildNode.transform.x);
              assert.ok(container.position.y === anchorChildNode.transform.y);
            });
          });
          describe('when transform.width/height is set and significantly different from parent\'s size', () => {
            it ('should not adjust position of root elements by default', () => {
              const root = pixi.import({
                scene: [ anchorNode, anchorChildNode ],
                metadata: metadata
              });

              const container = root.children[0];
              assert.ok(container.position.x === anchorNode.transform.x);
              assert.ok(container.position.y === anchorNode.transform.y);
            });
            it ('should adjust position of elements under root elements by default', () => {
              const root = pixi.import({
                scene: [ anchorNode, anchorChildNode ],
                metadata: metadata
              });

              const container = root.children[0].children[0];
              assert.ok(container.getGlobalPosition().x !== anchorChildNode.transform.x);
              assert.ok(container.getGlobalPosition().y !== anchorChildNode.transform.y);
            });
          });
        });
      });

      describe('if option is given', () => {
        describe('when transform.anchor is not (0, 0)', () => {
          describe('and option.autoCoordinateFix is false', () => {
            it ('should not adjust position', () => {
              const root = pixi.import(
                {
                  scene: [ anchorNode ],
                  metadata: metadata
                },
                { autoCoordinateFix: false }
              );

              const container = root.children[0];
              assert.ok(container.position.x === anchorNode.transform.x);
              assert.ok(container.position.y === anchorNode.transform.y);
            });
          });
          describe('and option.autoCoordinateFix is true', () => {
            it ('should adjust position of elements under root elements', () => {
              const root = pixi.import(
                {
                  scene: [ anchorNode, anchorChildNode ],
                  metadata: metadata
                },
                { autoCoordinateFix: true }
              );

              const container = root.children[0].children[0];
              assert.ok(container.getGlobalPosition().x !== anchorChildNode.transform.x);
              assert.ok(container.getGlobalPosition().y !== anchorChildNode.transform.y);
            });
          });
        });
      });
    });

    describe('when renderer.color is given', () => {
      it ('should not add filter if the color is default color', () => {
        const root = pixi.import({
          scene: [ defaultColorNode ],
          metadata: metadata
        });

        const color = defaultColorNode.renderer.color;
        assert.strictEqual(Pixi.isDefaultColor(color.r, color.g, color.b, color.a), true);

        const container = root.children[0];
        assert.strictEqual(!!container.filters, false);
      });
      it ('should add filter if the color is not default color', () => {
        const root = pixi.import({
          scene: [ colorNode ],
          metadata: metadata
        });

        const color = colorNode.renderer.color;
        assert.strictEqual(Pixi.isDefaultColor(color.r, color.g, color.b, color.a), false);

        const container = root.children[0];
        assert.strictEqual(container.filters.length, 1);
      });
    });

    describe('Layout', () =>{
      const pixi = new Pixi();

      const templateLayoutChildNode = {
        constructorName: 'Sprite',
        id:   "templateLayoutChild",
        name: "templateLayoutChild",
        transform: {
          x: 20,
          y: 20,
          width: 30,
          height: 40,
          scale: {
            x:1.0,
            y:1.0,
          },
          anchor: {
            x: 0,
            y: 0.5
          },
          parent: '',
          children: []
        },
        sprite: {
          // 48x48 texture
          base64: 'data:image/png;base64,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'
        }
      };

      const templateLayoutParentNode = {
        constructorName: 'Container',
        id:   'templateLayoutTestName',
        name: 'templateLayoutTestName',
        transform: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          scale: {
            x:1.0,
            y:1.0,
          },
          anchor: {
            x: 0.5,
            y: 0.5
          },
          children: []
        },
        layout: {
          layoutSize: {
            width: 100,
            height: 100
          },
          resize: 0,
          layoutType: 1,
          cellSize: {
            width: 40,
            height: 40
          },
          startAxis: 0,
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
          spacingX: 0,
          spacingY: 0,
          verticalDirection: 1,
          horizontalDirection: 0
        }
      };

      let layoutChildNode00 = JSON.parse(JSON.stringify(templateLayoutChildNode));
      layoutChildNode00.id = layoutChildNode00.name = "layoutChild00";
      layoutChildNode00.transform.parent = 'layoutParentName';
      let layoutChildNode01 = JSON.parse(JSON.stringify(templateLayoutChildNode));
      layoutChildNode01.id = layoutChildNode01.name = "layoutChild01";
      layoutChildNode01.transform.parent = 'layoutParentName';
      let layoutChildNode02 = JSON.parse(JSON.stringify(templateLayoutChildNode));
      layoutChildNode02.id = layoutChildNode02.name = "layoutChild02";
      layoutChildNode02.transform.parent = 'layoutParentName';
      let layoutChildNode03 = JSON.parse(JSON.stringify(templateLayoutChildNode));
      layoutChildNode03.id = layoutChildNode03.name = "layoutChild03";
      layoutChildNode03.transform.parent = 'layoutParentName';

      let layoutParentNode = JSON.parse(JSON.stringify(templateLayoutParentNode));
      layoutParentNode.id = layoutParentNode.name = 'layoutParentName';
      layoutParentNode.transform.children = [ layoutChildNode00.name, layoutChildNode01.name, layoutChildNode02.name, layoutChildNode03.name ];

      let schema = {
        scene: [ layoutParentNode, layoutChildNode00, layoutChildNode01, layoutChildNode02, layoutChildNode03 ],
        metadata: metadata
      };

      describe('when layout component is given', () => {

        const subject = pixi.import.bind(pixi);

        before(async()=>{
          //  FIXME:
          //  Measures to avoid the problem that sprite size becomes default size (1, 1).
          //  want to delete if there is another solution.
          const root = pixi.import(schema);
        });

        describe('regular usage of layout component', () => {
          describe ('horizontal', () => {
            it ('left to right', () => {
              layoutParentNode.layout.layoutType = 1;
              layoutParentNode.layout.horizontalDirection = 0;

              const root = pixi.import(schema);
              let layoutComponent = root.children[0];
              assert.strictEqual(layoutComponent.children[0].position.x, 0);
              assert.strictEqual(layoutComponent.children[1].position.x, 48);
              assert.strictEqual(layoutComponent.children[2].position.x, 96);
              assert.strictEqual(layoutComponent.children[3].position.x, 144);
            });
            it ('right to left', () => {
              layoutParentNode.layout.layoutType = 1;
              layoutParentNode.layout.horizontalDirection = 1;

              const root = pixi.import(schema);
              let layoutComponent = root.children[0];
              assert.strictEqual(layoutComponent.children[0].position.x, 100 - 48);
              assert.strictEqual(layoutComponent.children[1].position.x, 100 - 96);
              assert.strictEqual(layoutComponent.children[2].position.x, 100 - 144);
              assert.strictEqual(layoutComponent.children[3].position.x, 100 - 192);
            });
          });

          describe ('vertical', () => {
            it ('top to bottom', () => {
              layoutParentNode.layout.layoutType = 2;
              layoutParentNode.layout.verticalDirection = 1;
              const root = pixi.import(schema);

              let layoutComponent = root.children[0];
              assert.strictEqual(layoutComponent.children[0].position.y, 24);
              assert.strictEqual(layoutComponent.children[1].position.y, 24 + 48);
              assert.strictEqual(layoutComponent.children[2].position.y, 24 + 96);
              assert.strictEqual(layoutComponent.children[3].position.y, 24 + 144);
            });
            it ('bottom to top', () => {
              layoutParentNode.layout.layoutType = 2;
              layoutParentNode.layout.verticalDirection = 0;
              const root = pixi.import(schema);

              let layoutComponent = root.children[0];
              assert.strictEqual(layoutComponent.children[0].position.y, 24 + 100 - 48);
              assert.strictEqual(layoutComponent.children[1].position.y, 24 + 100 - 96);
              assert.strictEqual(layoutComponent.children[2].position.y, 24 + 100 - 144);
              assert.strictEqual(layoutComponent.children[3].position.y, 24 + 100 - 192);
            });
          });

          describe ('grid', () => {
            describe ('startAxis horizontal', () => {
              it ('left to right & top to bottom', () => {
                layoutParentNode.layout.layoutType = 3;
                layoutParentNode.layout.startAxis = 0;
                layoutParentNode.layout.horizontalDirection = 0;
                layoutParentNode.layout.verticalDirection = 1;
                const root = pixi.import(schema);

                let layoutComponent = root.children[0];
                assert.strictEqual(layoutComponent.children[0].position.x, 0);
                assert.strictEqual(layoutComponent.children[0].position.y, 24);
                assert.strictEqual(layoutComponent.children[1].position.x, 48);
                assert.strictEqual(layoutComponent.children[1].position.y, 24);
                assert.strictEqual(layoutComponent.children[2].position.x, 0); // wrap
                assert.strictEqual(layoutComponent.children[2].position.y, 72);
                assert.strictEqual(layoutComponent.children[3].position.x, 48);
                assert.strictEqual(layoutComponent.children[3].position.y, 72);
              });
              it ('right to left & top to bottom', () => {
                layoutParentNode.layout.layoutType = 3;
                layoutParentNode.layout.startAxis = 0;
                layoutParentNode.layout.horizontalDirection = 1;
                layoutParentNode.layout.verticalDirection = 1;
                const root = pixi.import(schema);

                let layoutComponent = root.children[0];
                assert.strictEqual(layoutComponent.children[0].position.x, 52);
                assert.strictEqual(layoutComponent.children[0].position.y, 24);
                assert.strictEqual(layoutComponent.children[1].position.x, 4);
                assert.strictEqual(layoutComponent.children[1].position.y, 24);
                assert.strictEqual(layoutComponent.children[2].position.x, 52); // wrap
                assert.strictEqual(layoutComponent.children[2].position.y, 72);
                assert.strictEqual(layoutComponent.children[3].position.x, 4);
                assert.strictEqual(layoutComponent.children[3].position.y, 72);
              });
            });

            describe ('startAxis horizontal', () => {
              it ('bottom to top & left to right', () => {
                layoutParentNode.layout.layoutType = 3;
                layoutParentNode.layout.startAxis = 1;
                layoutParentNode.layout.horizontalDirection = 0;
                layoutParentNode.layout.verticalDirection = 1;
                const root = pixi.import(schema);

                let layoutComponent = root.children[0];
                assert.strictEqual(layoutComponent.children[0].position.x, 0);
                assert.strictEqual(layoutComponent.children[0].position.y, 24);
                assert.strictEqual(layoutComponent.children[1].position.x, 0);
                assert.strictEqual(layoutComponent.children[1].position.y, 72);
                assert.strictEqual(layoutComponent.children[2].position.x, 48); // wrap
                assert.strictEqual(layoutComponent.children[2].position.y, 24);
                assert.strictEqual(layoutComponent.children[3].position.x, 48);
                assert.strictEqual(layoutComponent.children[3].position.y, 72);
              });
              it ('top to bottom & left to right', () => {
                layoutParentNode.layout.layoutType = 3;
                layoutParentNode.layout.startAxis = 1;
                layoutParentNode.layout.horizontalDirection = 0;
                layoutParentNode.layout.verticalDirection = 0;
                const root = pixi.import(schema);

                let layoutComponent = root.children[0];
                assert.strictEqual(layoutComponent.children[0].position.x, 0);
                assert.strictEqual(layoutComponent.children[0].position.y, 76);
                assert.strictEqual(layoutComponent.children[1].position.x, 0);
                assert.strictEqual(layoutComponent.children[1].position.y, 28);
                assert.strictEqual(layoutComponent.children[2].position.x, 48); // wrap
                assert.strictEqual(layoutComponent.children[2].position.y, 76);
                assert.strictEqual(layoutComponent.children[3].position.x, 48);
                assert.strictEqual(layoutComponent.children[3].position.y, 28);
              });
            });
          });
        });

        it ('nested nodes with layout component', () => {
          let layoutChildNode00_00 = JSON.parse(JSON.stringify(templateLayoutChildNode));
          layoutChildNode00_00.id = layoutChildNode00_00.name = "layoutChildNode00_00";
          layoutChildNode00_00.transform.parent = 'layoutNestNode00';
          let layoutChildNode00_01 = JSON.parse(JSON.stringify(templateLayoutChildNode));
          layoutChildNode00_01.id = layoutChildNode00_01.name = "layoutChildNode00_01";
          layoutChildNode00_01.transform.parent = 'layoutNestNode00';
          let layoutChildNode00_02 = JSON.parse(JSON.stringify(templateLayoutChildNode));
          layoutChildNode00_02.id = layoutChildNode00_02.name = "layoutChildNode00_02";
          layoutChildNode00_02.transform.parent = 'layoutNestNode00';
          let layoutChildNode00_03 = JSON.parse(JSON.stringify(templateLayoutChildNode));
          layoutChildNode00_03.id = layoutChildNode00_03.name = "layoutChildNode00_03";
          layoutChildNode00_03.transform.parent = 'layoutNestNode00';
          let layoutNestNode00 = JSON.parse(JSON.stringify(templateLayoutParentNode));
          layoutNestNode00.id = layoutNestNode00.name = 'layoutNestNode00';
          layoutNestNode00.transform.parent = 'layoutParentName';
          layoutNestNode00.transform.children = [ layoutChildNode00_00.name, layoutChildNode00_01.name, layoutChildNode00_02.name, layoutChildNode00_03.name ];
          layoutNestNode00.layout.layoutType = 3;
          layoutNestNode00.layout.startAxis = 0;
          layoutNestNode00.layout.horizontalDirection = 0;
          layoutNestNode00.layout.verticalDirection = 1;

          let layoutChildNode01_00 = JSON.parse(JSON.stringify(templateLayoutChildNode));
          layoutChildNode01_00.id = layoutChildNode01_00.name = "layoutChildNode01_00";
          layoutChildNode01_00.transform.parent = 'layoutNestNode01';
          let layoutChildNode01_01 = JSON.parse(JSON.stringify(templateLayoutChildNode));
          layoutChildNode01_01.id = layoutChildNode01_01.name = "layoutChildNode01_01";
          layoutChildNode01_01.transform.parent = 'layoutNestNode01';
          let layoutChildNode01_02 = JSON.parse(JSON.stringify(templateLayoutChildNode));
          layoutChildNode01_02.id = layoutChildNode01_02.name = "layoutChildNode01_02";
          layoutChildNode01_02.transform.parent = 'layoutNestNode01';
          let layoutChildNode01_03 = JSON.parse(JSON.stringify(templateLayoutChildNode));
          layoutChildNode01_03.id = layoutChildNode01_03.name = "layoutChildNode01_03";
          layoutChildNode01_03.transform.parent = 'layoutNestNode01';
          let layoutNestNode01 = JSON.parse(JSON.stringify(templateLayoutParentNode));
          layoutNestNode01.id = layoutNestNode01.name = 'layoutNestNode01';
          layoutNestNode01.transform.parent = 'layoutParentName';
          layoutNestNode01.transform.children = [ layoutChildNode01_00.name, layoutChildNode01_01.name, layoutChildNode01_02.name, layoutChildNode01_03.name ];
          layoutNestNode01.layout.layoutType = 3;
          layoutNestNode01.layout.startAxis = 0;
          layoutNestNode01.layout.horizontalDirection = 0;
          layoutNestNode01.layout.verticalDirection = 1;

          let layoutParentNode = JSON.parse(JSON.stringify(templateLayoutParentNode));
          layoutParentNode.id = layoutParentNode.name = 'layoutParentName';
          layoutParentNode.transform.children = [ layoutNestNode00.name, layoutNestNode01.name ];
          layoutParentNode.layout.layoutType = 1;
          layoutParentNode.layout.horizontalDirection = 0;

          let schema = {
            scene: [
              layoutParentNode,
              layoutNestNode00, layoutNestNode01,
              layoutChildNode00_00, layoutChildNode00_01, layoutChildNode00_02, layoutChildNode00_03,
              layoutChildNode01_00, layoutChildNode01_01, layoutChildNode01_02, layoutChildNode01_03
            ],
            metadata: metadata
          };

          const root = pixi.import(schema);

          let layoutComponent = root.children[0];

          let layoutNust00 = layoutComponent.children[0];
          assert.strictEqual(layoutNust00.position.x, 24);
          assert.strictEqual(layoutNust00.position.y, 0);
          assert.strictEqual(layoutNust00.children[0].position.x, 0);
          assert.strictEqual(layoutNust00.children[0].position.y, 24);
          assert.strictEqual(layoutNust00.children[1].position.x, 48);
          assert.strictEqual(layoutNust00.children[1].position.y, 24);
          assert.strictEqual(layoutNust00.children[2].position.x, 0); // wrap
          assert.strictEqual(layoutNust00.children[2].position.y, 72);
          assert.strictEqual(layoutNust00.children[3].position.x, 48);
          assert.strictEqual(layoutNust00.children[3].position.y, 72);

          let layoutNust01 = layoutComponent.children[1];
          assert.strictEqual(layoutNust01.position.x, 72);
          assert.strictEqual(layoutNust01.position.y, 0);
          assert.strictEqual(layoutNust01.children[0].position.x, 0);
          assert.strictEqual(layoutNust01.children[0].position.y, 24);
          assert.strictEqual(layoutNust01.children[1].position.x, 48);
          assert.strictEqual(layoutNust01.children[1].position.y, 24);
          assert.strictEqual(layoutNust01.children[2].position.x, 0); // wrap
          assert.strictEqual(layoutNust01.children[2].position.y, 72);
          assert.strictEqual(layoutNust01.children[3].position.x, 48);
          assert.strictEqual(layoutNust01.children[3].position.y, 72);
        });

        it('resize after import', ()=>{
          layoutParentNode.layout.layoutType = 1;
          layoutParentNode.layout.horizontalDirection = 0;
          const root = pixi.import(schema);

          let layoutComponent = root.children[0];
          layoutComponent.children[0].width = 60;

          LayoutComponent.fixLayout(layoutComponent, layoutParentNode);

          assert.strictEqual(layoutComponent.children[0].position.x, 0);
          assert.strictEqual(layoutComponent.children[1].position.x, 75);
          assert.strictEqual(layoutComponent.children[2].position.x, 75 + 48);
          assert.strictEqual(layoutComponent.children[3].position.x, 75 + 48 + 48);
        });
        it('rescale after import', ()=>{
          layoutParentNode.layout.layoutType = 1;
          layoutParentNode.layout.horizontalDirection = 0;
          const root = pixi.import(schema);

          let layoutComponent = root.children[0];
          layoutComponent.children[0].transform.scale.x = 2;

          LayoutComponent.fixLayout(layoutComponent, layoutParentNode);

          assert.strictEqual(layoutComponent.children[0].position.x, 0);
          assert.strictEqual(layoutComponent.children[1].position.x, 192);
          assert.strictEqual(layoutComponent.children[2].position.x, 240);
          assert.strictEqual(layoutComponent.children[3].position.x, 288);
        });
      });
    });
    describe('RichText', () => {
      const boldText = 'bold';
      const plainText = ' ';
      const italicText = 'italic ';
      const italicBoldText = 'italic and bold';
      const richTextNode = {
        constructorName: 'Text',
        id:   parentTestName,
        name: parentTestName,
        transform: {
          x: 0,
          y: 0,
          anchor: {
            x: 0,
            y: 0
          }
        },
        text: {
          text: `<b>${boldText}</b>${plainText}\n` + `<i>${italicText}<b>${italicBoldText}</b></i>`,
          richText: {
            format: 'bbcode'
          }
        }
      };

      it ('should create PIXI.Text instance for each style groups in order of appearance', () => {
        const root = pixi.import({
          scene: [ richTextNode ],
          metadata: metadata
        });

        const container = root.children[0];

        assert.strictEqual(container.children.shift().text, boldText);
        assert.strictEqual(container.children.shift().text, plainText);
        assert.strictEqual(container.children.shift().text, italicText);
        assert.strictEqual(container.children.shift().text, italicBoldText);
      });

      it ('should apply text style', () => {
        const root = pixi.import({
          scene: [ richTextNode ],
          metadata: metadata
        });

        const container = root.children[0];

        const toBeBold       = container.children.shift();
        const toBePlain      = container.children.shift();
        const toBeItalic     = container.children.shift();
        const toBeItalicBold = container.children.shift();

        assert.strictEqual(toBeBold.style._fontWeight, 'bold');
        assert.strictEqual(toBeBold.style._fontStyle, 'normal');
        assert.strictEqual(toBePlain.style.fontWeight, 'normal');
        assert.strictEqual(toBePlain.style._fontStyle, 'normal');
        assert.strictEqual(toBeItalic.style.fontWeight, 'normal');
        assert.strictEqual(toBeItalic.style._fontStyle, 'italic');
        assert.strictEqual(toBeItalicBold.style.fontWeight, 'bold');
        assert.strictEqual(toBeItalicBold.style._fontStyle, 'italic');
      });

      it ('should accept multiline', () => {
        const root = pixi.import({
          scene: [ richTextNode ],
          metadata: metadata
        });

        const container = root.children[0];

        assert.strictEqual(container.children[0].position.y < container.children[3].position.y, true);
      });
    });
  });
});
