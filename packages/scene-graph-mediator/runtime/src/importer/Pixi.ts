import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { Importer, ImportOption } from 'importer/Importer';
import { Pixi as PropertyConverter } from '../property_converter/Pixi';
import { LayoutComponent } from './component/Layout';

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
    return (_node) => { return new (PIXI as any)[name](); };
  }

  /**
   * Returns if pixi has property with given name
   */
  public hasInitiator(name: string): boolean {
    return PIXI.hasOwnProperty(name);
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

    const root = new PIXI.Container();

    // create asset list to download
    const assets: Map<string, { url: string, name: string }> = this.createAssetMap(schema);

    // load if any asset is required
    if (assets.size > 0) {
      assets.forEach((asset) => { PIXI.loader.add(asset); });

      PIXI.loader.load(() => {
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
      let url;

      const node = schema.scene[i];
      if (node.spine) {
        // TODO: support spine
        // url  = node.spine.url;
        continue;
      } else if (node.sprite) {
        url = node.sprite.url;
      } else {
        continue;
      }

      if (!url) {
        continue;
      }

      const asset = { url, name: url };

      // user custom process to modify url or resource name
      this.onAddLoaderAsset(node, asset);

      assets.set(url, asset);
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
    const containerMap = this.createRuntimeObjectMap(nodeMap, PIXI.loader.resources);
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
    let object: any;

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
        texture = PIXI.Texture.fromFrame(node.sprite.frameName);
      } else if (node.sprite.url) {
        texture = resources[node.sprite.url].texture;
      } else if (node.sprite.base64) {
        texture = PIXI.Texture.fromImage(node.sprite.base64);
      }

      if (!texture) {
        return null;
      }

      if (node.sprite.slice) {
        object = new PIXI.mesh.NineSlicePlane(
          texture,
          node.sprite.slice.left,
          node.sprite.slice.top,
          node.sprite.slice.right,
          node.sprite.slice.bottom
        );
        object.width  = node.transform!.width;
        object.height = node.transform!.height;
      } else {
        object = new PIXI.Sprite(texture);
      }
    } else if (node.text) {
      const style = new PIXI.TextStyle({});
      if (node.text.style) {
        style.fontSize  = node.text.style.size || 26;
        style.fill      = node.text.style.color || 'black';
        switch (node.text.style.horizontalAlign) {
          case 2 : style.align = 'right'; break;
          case 1 : style.align = 'center'; break;
          case 0 :
          default: style.align = 'left'; break;
        }
      }
      object = new PIXI.Text(node.text.text || '', style);
    } else if (this.hasInitiator(node.constructorName)) {
      object = this.getInitiator(node.constructorName)(node);
    } else {
      object = new PIXI.Container();
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
          const filter = new PIXI.filters.ColorMatrixFilter();
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
