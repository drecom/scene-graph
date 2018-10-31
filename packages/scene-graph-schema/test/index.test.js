var sceneGraphSchema = require('../');
var assert = require('power-assert');

const validMetadata = {
  "width":640,
  "height":1136,
  "positiveCoord": {
    "xRight": true,
    "yDown":  false
  }
};
const validTransform = {
  "x":0,
  "y":0,
  "anchor": {
    "x": 0,
    "y": 0
  }
};

describe('scene-graph-schema', () => {
  describe('validateSchema', () => {
    it ('should validate root node', () => {
      assert.strictEqual(sceneGraphSchema.validateSchema({'scene':[]}).errors.length, 1);
      assert.strictEqual(sceneGraphSchema.validateSchema({'scene':[], 'metadata':validMetadata }).errors.length, 0);
    });
    it ('should validate scene children', () => {
      assert.notStrictEqual(sceneGraphSchema.validateSchema({'scene':[{}]}).errors.length, 0);
      assert.strictEqual(sceneGraphSchema.validateSchema({
        "metadata": validMetadata,
        'scene':[{
          "id":"",
          "name":"",
          "constructorName":"",
          "transform": validTransform
        }]
      }).errors.length, 0);
    });

    it ('should validate value range', () => {
      const schema = {
        'scene':[{
          "id":"Parent",
          "name":"",
          "constructorName":"",
          "transform": validTransform,
          "renderer": {
            "color": {
              "r": 255,
              "g": 0,
              "b": 128,
              "a": 255,
            }
          }
        }],
        'metadata': validMetadata
      };

      assert.strictEqual(sceneGraphSchema.validateSchema(schema).errors.length, 0);
      schema.scene[0].renderer.color.r = 256;
      schema.scene[0].renderer.color.a = -1;
      assert.strictEqual(sceneGraphSchema.validateSchema(schema).errors.length, 2);
    });
  });
  describe('validateHierarchy', () => {
    it ('should validate parent', () => {
      assert.strictEqual(sceneGraphSchema.validateHierarchy({
        "metadata": validMetadata,
        'scene':[{
          "id":"Parent",
          "constructorName":"",
          "transform": Object.assign({ "children":["Child"] }, validTransform)
        },
        {
          "id":"Child",
          "constructorName":"",
          "transform": Object.assign({ "parent":"Parent" }, validTransform),
        }]
      }), true);
      assert.strictEqual(sceneGraphSchema.validateHierarchy({
        "metadata": validMetadata,
        'scene':[{
          "id":"Parent",
          "transform": Object.assign({ "children":["Child"] }, validTransform)
        },
        {
          "id":"Child",
          "transform": validTransform
        }]
      }), false);
    });
    it ('should validate children', () => {
      assert.strictEqual(sceneGraphSchema.validateHierarchy({
        "metadata": validMetadata,
        'scene':[{
          "id":"Parent",
          "transform": Object.assign({ "children":["Child"] }, validTransform)
        },
        {
          "id":"Child",
          "transform": Object.assign({ "parent":"Parent" }, validTransform),
        }]
      }), true);
      assert.strictEqual(sceneGraphSchema.validateHierarchy({
        "metadata": validMetadata,
        'scene':[{
          "id":"Parent",
          "transform": validTransform
        },
        {
          "id":"Child",
          "transform": Object.assign({ "parent":"Parent" }, validTransform),
        }]
      }), false);
    });
  });
})
