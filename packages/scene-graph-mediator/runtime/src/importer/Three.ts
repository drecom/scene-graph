import * as THREE from 'three';
import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { Importer, ImportOption } from 'importer/Importer';
import ThreeLoader from 'runtime/three/interface/ThreeLoader';
import FbxLoader from 'runtime/three/loaders/FbxLoader';
import TgaLoader from 'runtime/three/loaders/TgaLoader';

type ThreeObjectMap = Map<string, THREE.Object3D>;

const defaultImportOption: ImportOption = {
  autoCoordinateFix: true
};

// TODO: consider user extension
const SupportedExportFormat = Object.freeze({
  UNITY: 'unity'
});
// TODO: consider user extension
const AssetTypes = Object.freeze({
  Unity: {
    FBX: 'fbx',
    MATERIAL: 'mat',
    UNKNOWN: 'unknown'
  },
  Default: {
    UNKNOWN: 'unknown'
  }
});

type ThreeAssetInfo = {
  url: string;
  name: string;
  type: string;
};

/**
 * Three implementation of Importer
 */
export default class Three extends Importer {

  /**
   * container for loader instance caches
   */
  private loaderCache: Map<string, ThreeLoader> = new Map<string, ThreeLoader>();
  /**
   * container for loaded resource caches
   */
  private resources: Map<string, any> = new Map<string, any>();

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

    const root = new THREE.Group();

    // create asset list to download
    const assets: Map<string, ThreeAssetInfo> = this.createAssetMap(schema);

    let loadingResourceCount = 0;

    const onLoad = () => {
      loadingResourceCount--;
      if (loadingResourceCount <= 0) {
        this.restoreScene(root, schema, option.config);
        option.callback(root);
      }
    };

    // load if any asset is required
    if (assets.size > 0) {
      assets.forEach((asset: ThreeAssetInfo) => {
        const loader = this.getThreeLoaderByAssetType(asset.type, schema.metadata.format);
        loadingResourceCount++;
        // TODO: error handling
        loader.load(
          asset.url,
          (object: any) => {
            this.resources.set(asset.url, object);
            onLoad();
          },
          undefined,
          onLoad.bind(this) // error calback
        );
      });
    } else {
      onLoad();
    }

    return root;
  }

  /**
   * Create asset map from schema.<br />
   * Users can use this method and restoreScene individually to inject custom pipeline.
   */
  public createAssetMap(schema: SchemaJson): Map<string, ThreeAssetInfo> {
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
          const type = this.detectThreeAssetTypeByUrl(url, schema.metadata.format);
          addLoaderAsset(node, url, type);
        }
      }
    }

    return assets;
  }

  /**
   * Restore three.js objects
   */
  public restoreScene(
    root: THREE.Group,
    schema: SchemaJson,
    option: ImportOption = defaultImportOption
  ): void {
    // map all nodes in schema first
    const nodeMap = this.createNodeMap(schema);
    // then instantiate all containers from node map
    const objectMap = this.createRuntimeObjectMap(nodeMap, this.resources);
    // restore transform in the end
    this.restoreTransform(root, schema, nodeMap, objectMap, option);
  }

  /**
   * Returns three.js object. <br />
   * If any loader loads assets as three.js object, it will return cached object.
   */
  public createRuntimeObject(node: Node, resources: any): any {
    let object: any;

    // give prior to plugin custome initialization
    object = this.createRuntimeObjectForPlugins(node, resources);

    if (object) {
      return object;
    }

    if (node.meshRenderer && node.meshRenderer.mesh) {
      object = resources.get(node.meshRenderer.mesh.url);
    } else {
      object = new THREE.Object3D();
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
    nodeMap: Map<string, Node>,
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
    // noop
  }
  public applyCoordinate(_schema: SchemaJson, _obj: any, _node: Node): void {
    // noop
  }

  /**
   * Returns asset type used in three.js based on exported format
   */
  private detectThreeAssetTypeByUrl(url: string, format: string): string {
    // TODO: consider user extension
    if (format === SupportedExportFormat.UNITY) {
      if (/\.fbx$/i.test(url)) {
        return AssetTypes.Unity.FBX;
      }
      if (/\.mat$/i.test(url)) {
        return AssetTypes.Unity.MATERIAL;
      }
    }

    return AssetTypes.Default.UNKNOWN;
  }

  /**
   * three.js have multiple loader types for each asset type.
   * This method returns a loader instance by asset type.
   */
  private getThreeLoaderByAssetType(type: string, format: string): ThreeLoader {
    let loader = this.loaderCache.get(type);
    if (!loader) {
      if (format === SupportedExportFormat.UNITY) {
        switch (type) {
          case AssetTypes.Unity.FBX:      loader = new FbxLoader(); break;
          case AssetTypes.Unity.MATERIAL: loader = new TgaLoader(); break;
          case AssetTypes.Unity.UNKNOWN:
          default: loader = new THREE.FileLoader() as ThreeLoader; break;
        }
      } else {
        loader = new THREE.FileLoader() as ThreeLoader;
      }
      this.loaderCache.set(type, loader);
    }

    return loader;
  }

  protected createRuntimeObjectForPlugins(node: Node, resources: any): any | null {
    let result: any | null = null;
    const plugins = this.plugins.filter(plugin => !!plugin.createRuntimeObject);

    for (let i = 0, len = plugins.length; i < len && !result; i++) {
      result = plugins[i].createRuntimeObject!(node, resources);
    }

    return result;
  }
}
