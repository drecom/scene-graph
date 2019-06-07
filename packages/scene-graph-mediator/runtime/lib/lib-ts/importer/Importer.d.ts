import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import ImporterPlugin from '../interface/ImporterPlugin';
export declare type ImportOption = {
    autoCoordinateFix: boolean;
};
/**
 * Abstract class for runtime mediation.<br />
 * It handles runtime object like Unity's GameObject or Cocos's Node
 */
export declare abstract class Importer {
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
     * Create runtime object for each node via plugins.
     */
    abstract createRuntimeObjectForPlugins(node: Node, resources: any): any | null;
    /**
     * Restore scene graph as runtime objects
     */
    abstract restoreScene(root: any, schema: SchemaJson, option: ImportOption): void;
    protected onAddLoaderAsset: (node: Node, asset: any) => void;
    protected onRestoreNode: (node: Node, resources: any) => any | null | undefined;
    protected onRuntimeObjectCreated: (id: string, obj: any) => void;
    protected onTransformRestored: (schema: SchemaJson, id: string, obj: any, node: Node, parentNode?: Node) => void;
    /**
     * Plugins container
     */
    protected plugins: ImporterPlugin[];
    /**
     * Callback called when any asset added to runtime resource loader
     */
    setOnAddLoaderAsset(callback?: (node: Node, asset: any) => void): void;
    /**
     * Callback called when restoring a node to runtime<br />
     * If null is returned, default initiator creates runtime object.
     */
    setOnRestoreNode(callback?: (node: Node, resources: any) => any | null | undefined): void;
    /**
     * Callback called when each runtime object is instantiated
     */
    setOnRuntimeObjectCreated(callback?: (id: string, obj: any) => void): void;
    /**
     * Callback called when each runtime object's transform/transform3d is restored
     */
    setOnTransformRestored(callback?: (schema: SchemaJson, id: string, obj: any, node: Node, parentNode?: Node) => void): void;
    /**
     * Returns initiate methods related to class name.<br />
     * Often it is used to define initiation of a class instance
     * with constructor that has argument.<br />
     * Initiators are defined in each runtime implementation and it should be augmented by user.<br />
     * Remarks: This is an experimental design and may be changed in the future.
     */
    getInitiator(_name: string): (node: Node) => any;
    /**
     * Returns initiator exists
     */
    hasInitiator(_name: string): boolean;
    /**
     * Add plugin to extend import process.
     */
    addPlugin(plugin: ImporterPlugin): void;
    /**
     * Extend scene graph with user plugins.
     */
    pluginPostProcess(schema: SchemaJson, nodeMap: Map<string, Node>, runtimeObjectMap: Map<string, any>, option: ImportOption): void;
    protected assembleImportOption(param1?: (root: any) => void | ImportOption, param2?: ImportOption): {
        callback: (root: any) => void;
        config: ImportOption;
    };
    /**
     * Map all nodes from given schema
     */
    protected createNodeMap(schema: SchemaJson): Map<string, Node>;
    /**
     * Create and map all Containers from given nodeMap.
     * This method uses createRuntimeObject interface to create each object
     */
    protected createRuntimeObjectMap(nodeMap: Map<string, Node>, resources: any): Map<string, any>;
}
