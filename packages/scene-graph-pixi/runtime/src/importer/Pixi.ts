// FIXME: use user's pixi
import * as PIXI from 'pixi.js';
import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { Importer, ImportOption } from '@drecom/scene-graph-mediator-rt';
import { Pixi as PropertyConverter } from '../property_converter/Pixi';
import { LayoutComponent } from './component/Layout';
import { RichText } from './component/RichText';

type ContainerMap = Map<string, PIXI.Container>;

const defaultImportOption: ImportOption = {
  autoCoordinateFix: true
};

declare module 'pixi.js' {
  interface Container {
    sgmed?: {
      anchor?: {
        x: number,
        y: number
      }
    };
  }
}

/**
 * Pixi implementation of Importer
 */
export default class Pixi extends Importer {

  /**
   * FIXME: use user's pixi
   */
  public static pixiRef: any = PIXI;

  /**
   * Dtect if given colors are default color
   */
  private static isDefaultColor(r: number, g: number, b: number, a?: number): boolean {
    return (r === 255 && g === 255 && b === 255 && (!a || a === 255));
  }

  /**
   * Returns atlas resource name with node id
   */
  public getAtlasResourceNameByNodeId(id: string): string { return `${id}_atlas`; }

  /**
   * Returns pixi class as initializer
   */
  public getInitiator(name: string): (node: Node) => any {
    return (_node) => { return new Pixi.pixiRef[name](); };
  }

  /**
   * Returns if pixi has property with given name
   */
  public hasInitiator(name: string): boolean {
    return Pixi.pixiRef.hasOwnProperty(name);
  }

  /**
   * Import Schema and rebuild runtime node structure.<br />
   * Resources are automatically downloaded.<br />
   * Use createAssetMap if any customized workflow are preffered.
   */
  public import(
    schema: SchemaJson,
    param1?: (root: any) => void | ImportOption,
    param2?: ImportOption
  ): any {
    const option = this.assembleImportOption(param1, param2);

    const root = new Pixi.pixiRef.Container();

    // create asset list to download
    const assets: Map<string, { url: string, name: string }> = this.createAssetMap(schema);

    // load if any asset is required
    if (assets.size > 0) {
      assets.forEach((asset) => { Pixi.pixiRef.loader.add(asset); });

      Pixi.pixiRef.loader.load(() => {
        this.restoreScene(root, schema, option.config);
        option.callback(root);
      });
    } else {
      this.restoreScene(root, schema, option.config);
      option.callback(root);
    }

    return root;
  }

  /**
   * Create asset map from schema.<br />
   * Users can use this method and restoreScene individually to inject custom pipeline.
   */
  public createAssetMap(schema: SchemaJson): Map<string, { url: string, name: string }> {
    // resources
    const assets = new Map<string, { url: string, name: string }>();

    // collect required resource
    for (let i = 0; i < schema.scene.length; i++) {
      const urls: string[] = [];

      const node = schema.scene[i];
      if (node.spine) {
        // TODO: support spine
        // url  = node.spine.url;
        continue;
      } else if (node.sprite) {
        if (node.sprite.url) {
          urls.push(node.sprite.url);
        }
      }

      if (node.mask && node.mask.spriteFrame) {
        if (node.mask.spriteFrame.url) {
          urls.push(node.mask.spriteFrame.url);
        }
      }

      for (const url of urls) {
        const asset = { url, name: url };

        // user custom process to modify url or resource name
        this.onAddLoaderAsset(node, asset);

        assets.set(url, asset);
      }
    }

    return assets;
  }

  /**
   * Rstore pixi container to given root container from schema
   */
  public restoreScene(
    root: PIXI.Container,
    schema: SchemaJson,
    option: ImportOption = defaultImportOption
  ): void {
    // map all nodes in schema first
    const nodeMap = this.createNodeMap(schema);
    // then instantiate all containers from node map
    const containerMap = this.createRuntimeObjectMap(nodeMap, Pixi.pixiRef.loader.resources);
    // restore renderer
    this.restoreRenderer(nodeMap, containerMap);
    // restore transform in the end
    this.restoreTransform(root, schema, nodeMap, containerMap, option);
  }

  /**
   * Create container instance from given node<br />
   * Textures in loader.resources may be refered.
   */
  public createRuntimeObject(node: Node, resources: any): any {
    let object: PIXI.Container | undefined = undefined;

    // give prior to plugin custome initialization
    object = this.createRuntimeObjectForPlugins(node, resources);

    if (object) {
      return object;
    }

    if (node.spine) {
      // TODO: support spine
      // object = new PIXI.spine.Spine(resources[node.id].data);
    } else if (node.sprite) {
      let texture = null;
      if (node.sprite.atlasUrl && node.sprite.frameName) {
        texture = Pixi.pixiRef.Texture.fromFrame(node.sprite.frameName);
      } else if (node.sprite.url) {
        texture = resources[node.sprite.url].texture;
      } else if (node.sprite.base64) {
        texture = Pixi.pixiRef.Texture.fromImage(node.sprite.base64);
      }

      if (!texture) {
        return null;
      }

      if (node.sprite.slice) {
        object = new Pixi.pixiRef.mesh.NineSlicePlane(
          texture,
          node.sprite.slice.left,
          node.sprite.slice.top,
          node.sprite.slice.right,
          node.sprite.slice.bottom
        );
        object!.width  = (node.transform!.width || 0);
        object!.height = (node.transform!.height || 0);
      } else {
        object = new Pixi.pixiRef.Sprite(texture);
      }
    } else if (node.text) {
      const param: PIXI.TextStyleOptions = {};
      if (node.text.style) {
        param.fontSize  = node.text.style.size || 26;
        param.fill      = node.text.style.color || 'black';
        switch (node.text.style.horizontalAlign) {
          case 2 : param.align = 'right'; break;
          case 1 : param.align = 'center'; break;
          case 0 :
          default: param.align = 'left'; break;
        }
      }

      if (node.text.richText) {
        object = RichText.createContainer(node.text.text, param);
      } else {
        const style = new Pixi.pixiRef.TextStyle(param);
        object = new Pixi.pixiRef.Text(node.text.text || '', style);
      }
    } else if (this.hasInitiator(node.constructorName)) {
      object = this.getInitiator(node.constructorName)(node);
    } else {
      object = new Pixi.pixiRef.Container();
    }

    if (object && node.mask) {
      // TODO: 'Inverted' not supported.
      switch (node.mask.maskType){
        // RECT
        case 0: {
          const maskGraphics = new PIXI.Graphics();
          maskGraphics.beginFill(0x000000);
          maskGraphics.drawRect(
            -node.transform!.anchor.x * node.transform!.width!,
            -node.transform!.anchor.y * node.transform!.height!,
            node.transform!.width!,
            node.transform!.height!
          );
          maskGraphics.endFill();
          object.addChild(maskGraphics);
          object.mask = maskGraphics;
          break;
        }

        // ELLIPSE
        case 1: {
          const maskGraphics = new PIXI.Graphics();
          maskGraphics.beginFill(0x000000);
          maskGraphics.drawEllipse(
            0, 0,
            node.transform!.width! / 2,
            node.transform!.height! / 2
          );
          maskGraphics.endFill();
          object.addChild(maskGraphics);
          object.mask = maskGraphics;
          break;
        }

        // IMAGE_STENCIL
        case 2: {
          const maskSpriteFrame = node.mask.spriteFrame;
          if (!maskSpriteFrame) {
            break;
          }

          let texture = null;
          if (maskSpriteFrame.atlasUrl && maskSpriteFrame.frameName) {
            texture = PIXI.Texture.fromFrame(maskSpriteFrame.frameName);
          } else if (maskSpriteFrame.url) {
            texture = resources[maskSpriteFrame.url].texture;
          } else if (maskSpriteFrame.base64) {
            texture = PIXI.Texture.fromImage(maskSpriteFrame.base64);
          }
          const maskSprite = new PIXI.Sprite(texture);
          maskSprite.x -= maskSprite.width / 2;
          maskSprite.y -= maskSprite.height / 2;
          object.addChild(maskSprite);
          object.mask = maskSprite;
          break;
        }
      }
    }

    return object;
  }

  /**
   * Restore transform<br />
   * Process this method after applying textures
   * since bounds can not be calculated properly if no texture are applied.
   */
  private restoreTransform(
    root: PIXI.Container,
    schema: SchemaJson,
    nodeMap: Map<string, Node>,
    containerMap: ContainerMap,
    option: ImportOption = defaultImportOption
  ): void {
    // restore transform for each mapped container
    // TODO: should separate restoration of hieralchy and property ?
    containerMap.forEach((container, id) => {
      // node that is not from schema
      const node = nodeMap.get(id);
      if (!node || !node.transform) {
        return;
      }

      const transform  = node.transform;
      const parentNode = transform.parent ? nodeMap.get(transform.parent) : undefined;

      // restore hieralchy
      if (transform.parent === undefined) {
        // container that has no parent is the root element
        root.addChild(container);
      } else {
        const parentContainer = containerMap.get(transform.parent);
        // skip if any parent could not be detected
        if (!parentContainer || !parentNode) {
          return;
        }

        parentContainer.addChild(container);
      }

      if (!container.sgmed) {
        container.sgmed = {};
      }

      container.sgmed.anchor = {
        x: node.transform.anchor.x,
        y: node.transform.anchor.y
      };

      if (option.autoCoordinateFix) {
        // scene-graph-mediator extended properties
        this.fixCoordinate(schema, container, node);
      } else {
        this.applyCoordinate(schema, container, node);
      }
    });

    // update under Layout component node
    containerMap.forEach((container, id) => {
      const node = nodeMap.get(id);
      if (!node || !node.layout || !node.transform) {
        return;
      }

      LayoutComponent.fixLayout(container, node);
    });

    this.pluginPostProcess(schema, nodeMap, containerMap, option);

    containerMap.forEach((container, id) => {
      const node = nodeMap.get(id);
      if (!node || !node.transform) {
        return;
      }

      const parentNode = node.transform.parent ? nodeMap.get(node.transform.parent) : undefined;

      this.onTransformRestored(schema, id, container, node, parentNode);
    });
  }

  public fixCoordinate(schema: SchemaJson, obj: any, node: Node): void {
    const convertedValues = PropertyConverter.createConvertedObject(schema, node.transform!);
    PropertyConverter.fixCoordinate(schema, convertedValues, node);
    PropertyConverter.applyConvertedObject(obj, convertedValues);
  }
  public applyCoordinate(schema: SchemaJson, obj: any, node: Node): void {
    const convertedValues = PropertyConverter.createConvertedObject(schema, node.transform!);
    PropertyConverter.applyConvertedObject(obj, convertedValues);
  }

  public createRuntimeObjectForPlugins(node: Node, resources: any): any | null {
    let result: any | null = null;
    const plugins = this.plugins.filter(plugin => !!plugin.createRuntimeObject);

    for (let i = 0, len = plugins.length; i < len && !result; i++) {
      result = plugins[i].createRuntimeObject!(node, resources);
    }

    return result;
  }

  private restoreRenderer(nodeMap: Map<string, Node>, containerMap: ContainerMap): void {
    containerMap.forEach((container, id) => {
      // node that is not from schema
      const node = nodeMap.get(id);
      if (!node) {
        return;
      }

      if (!node.renderer) {
        return;
      }

      if (node.renderer.color) {
        const color = node.renderer.color;
        if (!Pixi.isDefaultColor(color.r, color.g, color.b)) {
          // TODO: consider Sprite tint
          const filter = new Pixi.pixiRef.filters.ColorMatrixFilter();
          filter.matrix = [
            color.r / 255, 0, 0, 0, 0,
            0, color.g / 255, 0, 0, 0,
            0, 0, color.b / 255, 0, 0,
            0, 0, 0, color.a / 255, 0
          ];

          // getter for filters returns copy
          const filters = container.filters || [];
          filters.push(filter);
          container.filters = filters;
        } else if (color.a !== 255) {
          container.alpha = color.a / 255;
        }
      }
    });
  }
}
