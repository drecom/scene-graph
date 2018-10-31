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
     * Callback called when any asset added to pixi loader
     */
    abstract setOnAddLoaderAsset(callback: (node: Node, asset: {
        url: string;
        name: string;
    }) => void): void;
    /**
     * Callback called when restoring a node to pixi container<br />
     * If null is returned, default initiator creates pixi object.
     */
    abstract setOnRestoreNode(callback: (node: Node, resources: any) => any | null | undefined): void;
    /**
     * Callback called when each pixi object is instantiated
     */
    abstract setOnRuntimeObjectCreated(callback: (id: string, obj: any) => void): void;
    abstract setOnTransformRestored(callback: (schema: SchemaJson, id: string, obj: any, node: Node, parentNode?: Node) => void): void;
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
    abstract addPlugin(plugin: ImporterPlugin): void;
    /**
     * Import Schema and rebuild runtime node structure.
     */
    abstract import(schema: SchemaJson, callback: (root: any) => void): any;
    abstract createAssetMap(schema: SchemaJson): Map<string, any>;
    abstract restoreScene(root: any, schema: SchemaJson, option: ImportOption): void;
    abstract pluginPostProcess(schema: SchemaJson, nodeMap: Map<string, Node>, runtimeObjectMap: Map<string, any>): void;
}
