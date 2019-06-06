import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import ImporterPlugin from '../interface/ImporterPlugin';

export type ImportOption = {
  autoCoordinateFix: boolean
};

const defaultImportOption: ImportOption = {
  autoCoordinateFix: true
};

/**
 * Abstract class for runtime mediation.<br />
 * It handles runtime object like Unity's GameObject or Cocos's Node
 */
export abstract class Importer {

  /**
   * Import Schema and rebuild runtime node structure.
   */
  abstract import(schema: SchemaJson, callback: (root: any) => void): any;
  /**
   * Create asset map from schema.<br />
   * Users can use this method and restoreScene individually to inject custom pipeline.
   */
  abstract createAssetMap(schema: SchemaJson): Map<string, any>;
  /**
   * Create runtime object for each node.
   */
  abstract createRuntimeObject(node: Node, resources: any): any;
  /**
   * Restore scene graph as runtime objects
   */
  abstract restoreScene(root: any, schema: SchemaJson, option: ImportOption): void;

  protected onAddLoaderAsset: (node: Node, asset: any) => void
    = (_node: Node, _asset: any) => {}
  protected onRestoreNode: (node: Node, resources: any) => any | null | undefined
    = (_n, _r) => { return null; }
  protected onRuntimeObjectCreated: (id: string, obj: any) => void
    = (_i, _o) => {}
  protected onTransformRestored: (
    schema: SchemaJson,
    id: string,
    obj: any,
    node: Node,
    parentNode?: Node
  ) => void = (_s, _i, _o, _n, _p) => {}

  /**
   * Plugins container
   */
  protected plugins: ImporterPlugin[] = [];

  /**
   * Callback called when any asset added to runtime resource loader
   */
  public setOnAddLoaderAsset(
    callback: (node: Node, asset: any) => void = (_n, _a) => {}
  ): void {
    this.onAddLoaderAsset = callback;
  }

  /**
   * Callback called when restoring a node to runtime<br />
   * If null is returned, default initiator creates runtime object.
   */
  public setOnRestoreNode(
    callback: (node: Node, resources: any) => any | null | undefined = (_n, _r) => { return null; }
  ): void {
    this.onRestoreNode = callback;
  }

  /**
   * Callback called when each runtime object is instantiated
   */
  public setOnRuntimeObjectCreated(
    callback: (id: string, obj: any) => void = (_i, _o) => {}
  ): void {
    this.onRuntimeObjectCreated = callback;
  }

  /**
   * Callback called when each runtime object's transform/transform3d is restored
   */
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

  /**
   * Returns initiate methods related to class name.<br />
   * Often it is used to define initiation of a class instance
   * with constructor that has argument.<br />
   * Initiators are defined in each runtime implementation and it should be augmented by user.<br />
   * Remarks: This is an experimental design and may be changed in the future.
   */
  public getInitiator(_name: string): (node: Node) => any {
    return () => {};
  }
  /**
   * Returns initiator exists
   */
  public hasInitiator(_name: string): boolean {
    return false;
  }

  /**
   * Add plugin to extend import process.
   */
  public addPlugin(plugin: ImporterPlugin): void {
    this.plugins.push(plugin);
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

  protected assembleImportOption(
    param1?: (root: any) => void | ImportOption,
    param2?: ImportOption
  ): {
    callback: (root: any) => void;
    config: ImportOption;
  } {
    const option: {
      callback: (root: any) => void;
      config: ImportOption;
    } = {
      callback: (_) => {},
      config: defaultImportOption
    };

    if (param2) {
      option.callback = param1 as any;
      option.config   = param2;
    } else {
      if (param1) {
        console.log(param1.constructor.name);
        if (param1.constructor.name === 'Function') {
          option.callback = param1;
        } else {
          option.config = param1 as any;
        }
      }
    }

    return option;
  }

  /**
   * Map all nodes from given schema
   */
  protected createNodeMap(schema: SchemaJson): Map<string, Node> {
    const nodeMap = new Map<string, Node>();
    for (let i = 0; i < schema.scene.length; i++) {
      const node = schema.scene[i];
      nodeMap.set(node.id, node);
    }
    return nodeMap;
  }

  /**
   * Create and map all Containers from given nodeMap.
   * This method uses createRuntimeObject interface to create each object
   */
  protected createRuntimeObjectMap(nodeMap: Map<string, Node>, resources: any): Map<string, any> {
    const objectMap = new Map<string, any>();

    nodeMap.forEach((node: Node, id: string) => {
      // give prior to user custome initialization
      let object = this.onRestoreNode(node, resources);

      // give prior to plugin custome initialization
      if (!object) {
        object = this.createRuntimeObjectForPlugins(node, resources);
      }

      // then process default initialization
      if (!object) {
        object = this.createRuntimeObject(node, resources);
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

  protected createRuntimeObjectForPlugins(node: Node, resources: any): any | null {
    let result: any | null = null;
    const plugins = this.plugins.filter(plugin => !!plugin.createRuntimeObject);

    for (let i = 0, len = plugins.length; i < len && !result; i++) {
      result = plugins[i].createRuntimeObject!(node, resources);
    }

    return result;
  }
}
