import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import Exporter from 'exporter/Exporter';

/**
 * Abstract class for runtime mediation.<br />
 * It handles runtime object like Unity's GameObject or Cocos's Node
 */
export default class Pixi extends Exporter {

  public createSchema(scene: any, width: number, height: number): SchemaJson {
    const root: SchemaJson = {
      scene: this.createNodeRecursive(scene),
      metadata: {
        width,
        height,
        positiveCoord: {
          xRight: true,
          yDown:  true
        }
      }
    };

    return root;
  }

  public createNode(base: any): Node {
    const className = base.constructor.name;

    const node: Node = {
      id: base.name,
      name: base.name,
      constructorName: className,
      transform: {
        x: base.position.x,
        y: base.position.y,
        anchor: {
          x: 0,
          y: 0
        }
      }
    };

    if (base.parent) {
      node.transform.parent = base.parent.name;
    }

    if (base.children) {
      node.transform.children = [];
      for (let i = 0; i < base.children.length; i++) {
        node.transform.children.push(base.children[i].name);
      }
    }

    switch (className) {
      case 'NineSlicePlane': break; // TODO:
      case 'Spine': break; // TODO:
      case 'Sprite': {
        // TODO: base64 image
        node.sprite =  {
          url : base.texture.baseTexture.imageUrl
        };
        // TODO: texture atlas
        break;
      }
      case 'Text': {
        node.text = {
          text: base.text,
          style: {
            size: base.style.fontSize,
            color: base.style.fill
          }
        };
        break;
      }
    }

    // extras
    node.properties = {};

    // for..in iterator crawls all properties includes prototype
    const keys = Object.keys(base);
    for (let i = 0; i < keys.length; i++) {
      const key   = keys[i];
      const value = base[key];

      const valueType = typeof value;
      // restrict to JSON types
      if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
        node.properties[key] = value;
      }
    }

    return node;
  }

  private createNodeRecursive(base: any): Node[] {
    let nodes = [];
    nodes.push(this.createNode(base));

    if (base.children) {
      for (let i = 0; i < base.children.length; i++) {
        nodes = nodes.concat(this.createNodeRecursive(base.children[i]));
      }
    }

    return nodes;
  }
}
