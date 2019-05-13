import * as THREE from 'three';
import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { Importer, ImportOption } from 'importer/Importer';
import ThreeLoader from 'runtime/three/interface/ThreeLoader';
import FbxLoader from 'runtime/three/loaders/FbxLoader';
import TgaLoader from 'runtime/three/loaders/TgaLoader';
import ImporterPlugin from 'interface/ImporterPlugin';

type NodeMap      = Map<string, Node>;
type ThreeObjectMap = Map<string, THREE.Object3D>;

const defaultImportOption: ImportOption = {
  autoCoordinateFix: true
};

/*
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
*/

const ThreeAssetTypes = Object.freeze({
  FBX: 'fbx',
  UNITY_MATERIAL: 'mat',
  UNKNOWN: 'unknown'
});

type ThreeAssetInfo = {
  url: string;
  name: string;
  type: string;
};

/**
 * Pixi implementation of Importer
 */
export default class Three extends Importer {

  private loaderCache: Map<string, ThreeLoader> = new Map<string, ThreeLoader>();
  private resources: Map<string, any> = new Map<string, any>();

  /**
   * Callback called when any asset added to pixi loader
   */
  public setOnAddLoaderAsset(
    callback: (node: Node, asset: ThreeAssetInfo) => void = (_n, _a) => {}
  ): void {
    this.onAddLoaderAsset = callback;
  }

  /**
   * Callback called when restoring a node to pixi container<br />
   * If null is returned, default initiator creates pixi object.
   */
  public setOnRestoreNode(
    callback: (node: Node, resources: any) => any | null | undefined = (_n, _r) => { return null; }
  ): void {
    this.onRestoreNode = callback;
  }

  /**
   * Callback called when each pixi object is instantiated
   */
  public setOnRuntimeObjectCreated(
    callback: (id: string, obj: any) => void = (_i, _o) => {}
  ): void {
    this.onRuntimeObjectCreated = callback;
  }

  public setOnTransformRestored(
    callback: (
      schema: SchemaJson,
      id: string,
      obj: any,
      node: Node,
      parentNode?: Node
    ) => void = (_s, _i, _o, _n, _p) => {}
  ): void {
    this.onTransformRestored = callback;
  }

  private onAddLoaderAsset: (node: Node, asset: ThreeAssetInfo) => void
    = (_node: Node, _asset: ThreeAssetInfo) => {}
  private onRestoreNode: (node: Node, resources: any) => any | null | undefined
    = (_n, _r) => { return null; }
  private onRuntimeObjectCreated: (id: string, obj: any) => void
    = (_i, _o) => {}
  private onTransformRestored: (
    schema: SchemaJson,
    id: string,
    obj: any,
    node: Node,
    parentNode?: Node
  ) => void = (_s, _i, _o, _n, _p) => {}

  private plugins: ImporterPlugin[] = [];

  /**
   * Returns three class as initializer
   */
  public getInitiator(name: string): (node: Node) => any {
    return (_node) => { return new (THREE as any)[name](); };
  }

  /**
   * Returns if pixi has property with given name
   */
  public hasInitiator(name: string): boolean {
    return THREE.hasOwnProperty(name);
  }

  /**
   * Add plugin to extend import process.
   */
  public addPlugin(plugin: ImporterPlugin): void {
    this.plugins.push(plugin);
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
    let callback: (root: any) => void;
    let option: ImportOption;

    if (param2) {
      callback = param1 as any;
      option   = param2;
    } else {
      if (param1) {
        if (param1.constructor.name === 'Function') {
          callback = param1;
          option   = defaultImportOption;
        } else {
          callback = (_) => {};
          option   = param1 as any;
        }
      } else {
        callback = (_) => {};
        option   = defaultImportOption;
      }
    }

    const root = new THREE.Group();

    // create asset list to download
    const assets: Map<string, ThreeAssetInfo> = this.createAssetMap(schema);

    // load if any asset is required
    if (assets.size > 0) {
      let loadingResourceCount = 0;
      const onLoad = () => {
        loadingResourceCount--;
        if (loadingResourceCount === 0) {
          this.restoreScene(root, schema, option);
          callback(root);
        }
      };
      assets.forEach((asset: ThreeAssetInfo) => {
        const loader = this.getThreeLoaderByAssetType(asset.type);
        loadingResourceCount++;
        // TODO: error handling
        loader.load(
          asset.url,
          (object: any) => {
            this.resources.set(asset.url, object);
            onLoad();
          },
          undefined,
          onLoad.bind(this)
        );
      });
    } else {
      this.restoreScene(root, schema, option);
      callback(root);
    }

    return root;
  }

  /**
   * Create asset map from schema.<br />
   * Users can use this method and restoreScene individually to inject custom pipeline.
   */
  public createAssetMap(schema: SchemaJson): Map<string, ThreeAssetInfo> {
    // resources
    const assets = new Map<string, ThreeAssetInfo>();

    const addLoaderAsset = (node: Node, url: string, type: string) => {
      const asset: ThreeAssetInfo = { url, type, name: url };
      this.onAddLoaderAsset(node, asset);
      assets.set(url, asset);
    };

    // collect required resource
    for (let i = 0; i < schema.scene.length; i++) {
      const node = schema.scene[i];
      if (node.meshRenderer) {
        if (node.meshRenderer.mesh) {
          const url = node.meshRenderer.mesh.url;
          const type = this.detectThreeAssetTypeByUrl(url);
          addLoaderAsset(node, url, type);
        }
        /*
        if (node.meshRenderer.materials) {
          for (let j = 0; j < node.meshRenderer.materials.length; j++) {
            const url = node.meshRenderer.materials[j].url;
            const type = this.detectThreeAssetTypeByUrl(url);
            addLoaderAsset(node, url, type);
          }
        }
        */
      }
    }

    return assets;
  }

  private detectThreeAssetTypeByUrl(url: string): string {
    if (/\.fbx$/i.test(url)) {
      return ThreeAssetTypes.FBX;
    }
    if (/\.mat$/i.test(url)) {
      return ThreeAssetTypes.UNITY_MATERIAL;
    }

    return ThreeAssetTypes.UNKNOWN;
  }

  private getThreeLoaderByAssetType(type: string): ThreeLoader {
    let loader = this.loaderCache.get(type);
    if (!loader) {
      switch (type) {
        case ThreeAssetTypes.FBX: loader = new FbxLoader(); break;
        case ThreeAssetTypes.UNITY_MATERIAL: loader = new TgaLoader(); break;
        case ThreeAssetTypes.UNKNOWN:
        default: loader = new THREE.FileLoader() as ThreeLoader; break;
      }
      this.loaderCache.set(type, loader);
    }

    return loader;
  }

  /**
   * Rstore pixi container to given root container from schema
   */
  public restoreScene(
    root: THREE.Group,
    schema: SchemaJson,
    option: ImportOption = defaultImportOption
  ): void {
    // map all nodes in schema first
    const nodeMap = this.createNodeMap(schema);
    // then instantiate all containers from node map
    const objectMap = this.createThreeObjectMap(nodeMap);
    // restore transform in the end
    this.restoreTransform(root, schema, nodeMap, objectMap, option);
  }

  /**
   * Extend scene graph with user plugins.
   */
  public pluginPostProcess(
    schema: SchemaJson,
    nodeMap: Map<string, Node>,
    runtimeObjectMap: Map<string, any>,
    option: ImportOption
  ): void {
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      plugin.extendRuntimeObjects(schema, nodeMap, runtimeObjectMap, option);
    }
  }

  /**
   * Map all nodes from given schema
   */
  private createNodeMap(schema: SchemaJson): NodeMap {
    const nodeMap = new Map<string, Node>();
    for (let i = 0; i < schema.scene.length; i++) {
      const node = schema.scene[i];
      nodeMap.set(node.id, node);
    }
    return nodeMap;
  }

  /**
   * Create and map all Containers from given nodeMap
   */
  private createThreeObjectMap(nodeMap: NodeMap): ThreeObjectMap {
    const objectMap = new Map<string, THREE.Object3D>();

    nodeMap.forEach((node, id) => {
      // give prior to user custome initialization
      let object = this.onRestoreNode(node, this.resources);

      // then process default initialization
      if (!object) {
        object = this.createThreeObject(node);
      }

      // skip if not supported
      if (!object) {
        return;
      }

      // name with node name if no name given
      if (!object.name) {
        object.name = node.name;
      }

      this.onRuntimeObjectCreated(id, object);

      objectMap.set(id, object);
    });

    return objectMap;
  }

  /**
   * Create container instance from given node<br />
   * Textures in loader.resources may be refered.
   */
  private createThreeObject(node: Node): any {
    let object: any;

    if (node.meshRenderer && node.meshRenderer.mesh) {
      object = this.resources.get(node.meshRenderer.mesh.url);
    }

    return object;
  }

  /**
   * Restore transform<br />
   * Process this method after applying textures
   * since bounds can not be calculated properly if no texture are applied.
   */
  private restoreTransform(
    root: THREE.Group,
    schema: SchemaJson,
    nodeMap: NodeMap,
    objectMap: ThreeObjectMap,
    option: ImportOption = defaultImportOption
  ): void {
    // restore transform for each mapped container
    // TODO: should separate restoration of hieralchy and property ?
    objectMap.forEach((object, id) => {
      // node that is not from schema
      const node = nodeMap.get(id);
      if (!node || !node.transform3d) {
        return;
      }

      const transform  = node.transform3d;
      const parentNode = transform.parent ? nodeMap.get(transform.parent) : undefined;

      // restore hieralchy
      if (transform.parent === undefined) {
        // object that has no parent is the root element
        root.add(object);
      } else {
        const parentGroup = objectMap.get(transform.parent);
        // skip if any parent could not be detected
        if (!parentGroup || !parentNode) {
          return;
        }

        parentGroup.add(object);
      }
    });

    this.pluginPostProcess(schema, nodeMap, objectMap, option);

    objectMap.forEach((object, id) => {
      const node = nodeMap.get(id);
      if (!node || !node.transform3d) {
        return;
      }

      const parentNode = node.transform3d.parent ? nodeMap.get(node.transform3d.parent) : undefined;

      this.onTransformRestored(schema, id, object, node, parentNode);
    });
  }

  public fixCoordinate(_schema: SchemaJson, _obj: any, _node: Node, _parentNode?: Node): void {

  }
  public applyCoordinate(_schema: SchemaJson, _obj: any, _node: Node): void {

  }
}
