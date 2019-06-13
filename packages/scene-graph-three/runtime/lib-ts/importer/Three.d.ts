import * as THREE from 'three';
import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { Importer, ImportOption } from '@drecom/scene-graph-mediator-rt';
declare type ThreeAssetInfo = {
    url: string;
    name: string;
    type: string;
};
/**
 * Three implementation of Importer
 */
export default class Three extends Importer {
    /**
     * FIXME: use user's three
     */
    static threeRef: any;
    /**
     * container for loader instance caches
     */
    private loaderCache;
    /**
     * container for loaded resource caches
     */
    private resources;
    /**
     * Returns three class as initializer
     */
    getInitiator(name: string): (node: Node) => any;
    /**
     * Returns if pixi has property with given name
     */
    hasInitiator(name: string): boolean;
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
    createAssetMap(schema: SchemaJson): Map<string, ThreeAssetInfo>;
    /**
     * Restore three.js objects
     */
    restoreScene(root: THREE.Group, schema: SchemaJson, option?: ImportOption): void;
    /**
     * Returns three.js object. <br />
     * If any loader loads assets as three.js object, it will return cached object.
     */
    createRuntimeObject(node: Node, resources: any): any;
    /**
     * Restore transform<br />
     * Process this method after applying textures
     * since bounds can not be calculated properly if no texture are applied.
     */
    private restoreTransform;
    fixCoordinate(_schema: SchemaJson, _obj: any, _node: Node, _parentNode?: Node): void;
    applyCoordinate(_schema: SchemaJson, _obj: any, _node: Node): void;
    createRuntimeObjectForPlugins(node: Node, resources: any): any | null;
    /**
     * Returns asset type used in three.js based on exported format
     */
    private detectThreeAssetTypeByUrl;
    /**
     * three.js have multiple loader types for each asset type.
     * This method returns a loader instance by asset type.
     */
    private getThreeLoaderByAssetType;
}
export {};
