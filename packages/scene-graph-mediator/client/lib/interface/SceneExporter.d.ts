import { SchemaJson } from '@drecom/scene-graph-schema';
import SceneExporterPlugin from './SceneExporterPlugin';
/**
 * Exporter interface<br />
 * It is instantiated by factory<br />
 * Constructor is defined as ExporterConstructor<br />
 */
export default interface SceneExporter {
    /**
     * Returns exporter identifier to allow customization by runtime.
     */
    getIdentifier(): string;
    /**
     * Export entry point
     */
    createSceneGraphSchemas(sceneFiles: string[], assetRoot: string, plugins?: Map<string, SceneExporterPlugin>): Map<string, SchemaJson>;
    /**
     * Load scene file<br />
     * It may be retrieved with args.sceneFile
     */
    loadSceneFile(sceneFile: string): any;
    /**
     * Create scene graph<br />
     * Given json and resource map may be retrieved via createLocalResourceMap and loadSceneFile
     */
    createSceneGraph(json: any[]): SchemaJson;
}
