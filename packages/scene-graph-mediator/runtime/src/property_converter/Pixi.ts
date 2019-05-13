import { SchemaJson, Node, Transform } from '@drecom/scene-graph-schema';
import PropertyConverter from '../interface/PropertyConverter';

const DEGREE_TO_RADIAN = Math.PI / 180;

export type ConvertedObject = {
  position: { x: number, y: number },
  scale:    { x: number, y: number },
  anchor:   { x: number, y: number },
  rotation: number
};

export const Pixi: PropertyConverter.Interface = {
  createConvertedObject: (schema: SchemaJson, transform: Transform): ConvertedObject => {
    const coordVector = {
      x: (schema.metadata.positiveCoord.xRight ? 1 : -1),
      y: (schema.metadata.positiveCoord.yDown  ? 1 : -1)
    };

    return {
      // convert coordinate system
      position: {
        x: transform.x * coordVector.x,
        y: transform.y * coordVector.y
      },

      // default scale is 1/1
      scale: (transform.scale) ? {
        x: transform.scale.x,
        y: transform.scale.y
      } : { x: 1, y: 1 },

      // scene-graph-mediator extended properties
      anchor: {
        // TODO: magic
        x: (coordVector.x === 1) ? transform.anchor.x : 0.5 - (transform.anchor.x - 0.5),
        y: (coordVector.y === 1) ? transform.anchor.y : 0.5 - (transform.anchor.y - 0.5)
      },

      // pixi rotation is presented in radian
      rotation: (transform.rotation) ? transform.rotation * DEGREE_TO_RADIAN : 0
    };
  },

  fixCoordinate: (
    target: any,
    convertedObject: ConvertedObject,
    node: Node,
    parentNode?: Node
  ): void => {
    const transform = node.transform;
    if (!transform) {
      return;
    }

    if (parentNode && parentNode.transform) {
      const scale = transform.scale || { x: 1, y: 1 };

      convertedObject.position.x += (
        (parentNode.transform.width  || 0) - (transform.width  || 0) * scale.x
      ) * transform.anchor.x;
      convertedObject.position.y += (
        (parentNode.transform.height || 0) - (transform.height || 0) * scale.y
      ) * transform.anchor.y;
    }

    if (target.anchor) {
      const size = {
        width: target.width,
        height: target.height
      };

      // should calcurate with original size
      // TODO: text exclusion may be Cocos specific feature
      if (target.texture && !node.text) {
        size.width  = target.texture.width;
        size.height = target.texture.height;
      }

      if (transform.width !== undefined && transform.height !== undefined) {
        size.width  = transform.width;
        size.height = transform.height;
      }

      convertedObject.position.x += size.width  * convertedObject.scale.x * transform.anchor.x;
      convertedObject.position.y += size.height * convertedObject.scale.y * transform.anchor.y;
    }
  },

  applyConvertedObject: (target: any, convertedObject: ConvertedObject): void => {
    target.position.x = convertedObject.position.x;
    target.position.y = convertedObject.position.y;
    target.scale.x    = convertedObject.scale.x;
    target.scale.y    = convertedObject.scale.y;
    target.rotation   = convertedObject.rotation;

    if (target.anchor) {
      target.anchor.x = convertedObject.anchor.x;
      target.anchor.y = convertedObject.anchor.y;
    }
  }
};
