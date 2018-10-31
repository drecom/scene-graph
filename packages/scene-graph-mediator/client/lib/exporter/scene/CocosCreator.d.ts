import { SchemaJson, Node, Transform } from '@drecom/scene-graph-schema';
import * as cc from '../../interface/CocosCreator';
import SceneExporter from '../../interface/SceneExporter';
import SceneExporterPlugin from '../../interface/SceneExporterPlugin';
import AssetFileMap from '../../asset/AssetFileMap';
/**
 * Entity data structure of resource map.
 */
declare type ResourceMapEntity = {
    id: string;
    path: string;
    metaPath: string;
    type: string;
    submetas?: {
        [key: string]: cc.MetaBase;
    };
};
/**
 * CocosCreator V1.x scene exporter
 */
export default class CocosCreator implements SceneExporter {
    /**
     * Returns runtime identifier string.
     */
    getIdentifier(): string;
    /**
     * export scene graph
     */
    createSceneGraphSchemas(sceneFiles: string[], assetRoot: string, plugins?: Map<string, SceneExporterPlugin>): Map<string, SchemaJson>;
    /**
     * Read scene file using file system and convert to javascript object.
     */
    loadSceneFile(sceneFile: string): any;
    /**
     * Create scene graph with scene file dto and collected resource map
     */
    createSceneGraph(json: any[]): SchemaJson;
    /**
     * Execute plugin post process
     */
    pluginPostProcess(graph: SchemaJson, sceneJson: any[], assetFileMap: AssetFileMap, plugins?: Map<string, SceneExporterPlugin>): void;
    /**
     * Created supported resource map
     */
    protected createLocalResourceMap(assetFileMap: AssetFileMap): Map<string, ResourceMapEntity>;
    /**
     * Create array of RespirceMapEntity
     */
    protected createResourceMapEntities(absPath: string): ResourceMapEntity[];
    /**
     * Add node to SchemaJson.scene.<br />
     * Convert transform to SchemaJson schema.
     */
    protected appendNodes(json: cc.ComponentBase[], graph: SchemaJson): void;
    /**
     * Returns object with Transform schema using Cocos Node data.
     */
    protected createDefaultTransform(component: cc.ComponentBase): Transform;
    /**
     * Append metadata to scene graph data
     */
    protected appendMetaData(json: any[], graph: SchemaJson): void;
    /**
     * Append supported components to scene graph node
     */
    protected appendComponents(json: cc.ComponentBase[], graph: SchemaJson, resourceMap: Map<string, ResourceMapEntity>): void;
    /**
     * Detect and append supported component to scene graph node
     */
    protected appendComponentByType(schemaNode: Node, component: cc.Component, resourceMap: Map<string, ResourceMapEntity>): void;
    /**
     * Find and return component data if node has target component
     */
    protected findComponentByType(json: cc.ComponentBase[], type: string): cc.ComponentBase | null;
    /**
     * Find node in scene grapph by id
     */
    protected findSchemaNodeById(graph: SchemaJson, id: string): Node | null;
}
export {};
