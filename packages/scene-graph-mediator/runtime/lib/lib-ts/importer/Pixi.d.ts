/// <reference types="pixi.js" />
import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { Importer, ImportOption } from 'importer/Importer';
import ImporterPlugin from '../interface/ImporterPlugin';
declare module 'pixi.js' {
    interface Container {
        sgmed?: {
            anchor?: {
                x: number;
                y: number;
            };
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
    private static isDefaultColor;
    /**
     * Callback called when any asset added to pixi loader
     */
    setOnAddLoaderAsset(callback?: (node: Node, asset: {
        url: string;
        name: string;
    }) => void): void;
    /**
     * Callback called when restoring a node to pixi container<br />
     * If null is returned, default initiator creates pixi object.
     */
    setOnRestoreNode(callback?: (node: Node, resources: any) => any | null | undefined): void;
    /**
     * Callback called when each pixi object is instantiated
     */
    setOnRuntimeObjectCreated(callback?: (id: string, obj: any) => void): void;
    setOnTransformRestored(callback?: (schema: SchemaJson, id: string, obj: any, node: Node, parentNode?: Node) => void): void;
    private onAddLoaderAsset;
    private onRestoreNode;
    private onPixiObjectCreated;
    private onTransformRestored;
    private plugins;
    /**
     * Returns atlas resource name with node id
     */
    getAtlasResourceNameByNodeId(id: string): string;
    /**
     * Returns pixi class as initializer
     */
    getInitiator(name: string): (node: Node) => any;
    /**
     * Returns if pixi has property with given name
     */
    hasInitiator(name: string): boolean;
    /**
     * Add plugin to extend import process.
     */
    addPlugin(plugin: ImporterPlugin): void;
    /**
     * Import Schema and rebuild runtime node structure.<br />
     * Resources are automatically downloaded.<br />
     * Use createAssetMap if any customized workflow are preffered.
     */
    import(schema: SchemaJson, param1?: (root: any) => void | ImportOption, param2?: ImportOption): any;
    /**
     * Create asset map from schema.<br />
     * Users can use this method and restoreScene individually to inject custom pipeline.
     */
    createAssetMap(schema: SchemaJson): Map<string, {
        url: string;
        name: string;
    }>;
    /**
     * Rstore pixi container to given root container from schema
     */
    restoreScene(root: PIXI.Container, schema: SchemaJson, option?: ImportOption): void;
    /**
     * Extend scene graph with user plugins.
     */
    pluginPostProcess(schema: SchemaJson, nodeMap: Map<string, Node>, runtimeObjectMap: Map<string, any>): void;
    /**
     * Map all nodes from given schema
     */
    private createNodeMap;
    /**
     * Create and map all Containers from given nodeMap
     */
    private createContainerMap;
    /**
     * Create container instance from given node<br />
     * Textures in loader.resources may be refered.
     */
    private createContainer;
    /**
     * Restore transform<br />
     * Process this method after applying textures
     * since bounds can not be calculated properly if no texture are applied.
     */
    private restoreTransform;
    fixCoordinate(_schema: SchemaJson, obj: any, node: Node, parentNode?: Node): void;
    private restoreRenderer;
}
