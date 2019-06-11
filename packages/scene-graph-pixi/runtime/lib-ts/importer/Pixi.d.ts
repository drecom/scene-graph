import * as PIXI from 'pixi.js';
import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { Importer, ImportOption } from '@drecom/scene-graph-mediator-rt';
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
     * FIXME: use user's pixi
     */
    static pixiRef: any;
    /**
     * Dtect if given colors are default color
     */
    private static isDefaultColor;
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
     * Create container instance from given node<br />
     * Textures in loader.resources may be refered.
     */
    createRuntimeObject(node: Node, resources: any): any;
    /**
     * Restore transform<br />
     * Process this method after applying textures
     * since bounds can not be calculated properly if no texture are applied.
     */
    private restoreTransform;
    fixCoordinate(schema: SchemaJson, obj: any, node: Node): void;
    applyCoordinate(schema: SchemaJson, obj: any, node: Node): void;
    createRuntimeObjectForPlugins(node: Node, resources: any): any | null;
    private restoreRenderer;
}
