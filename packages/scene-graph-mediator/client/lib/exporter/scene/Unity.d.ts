import { SchemaJson } from '@drecom/scene-graph-schema';
import SceneExporter from '../../interface/SceneExporter';
import SceneExporterPlugin from '../../interface/SceneExporterPlugin';
import AssetFileMap from '../../asset/AssetFileMap';
import * as IUnity from '../../interface/Unity';
import UnityAssetFile from '../../asset/UnityAssetFile';
/**
 * Unity scene exporter
 */
export default class Unity implements SceneExporter {
    private guidMap;
    /**
     * Returns runtime identifier string.
     */
    getIdentifier(): string;
    /**
     * export scene graph
     *
     * - createGuidMap
     * - (for each scene file)
     *   - loadSceneFile
     *     - addUnityAssetFiles
     *       - addUnityAssetFile
     *     - loadSceneFile (recursive)
     *   - createSceneGraph
     */
    createSceneGraphSchemas(sceneFiles: string[], assetRoot: string, plugins?: Map<string, SceneExporterPlugin>): Map<string, SchemaJson>;
    /**
     * Read scene file using file system and convert to javascript object.
     */
    loadSceneFile(sceneFile: string): any;
    private collectChildSceneFiles;
    /**
     * Create scene graph with scene file dto and collected resource map
     */
    createSceneGraph(json: any): SchemaJson;
    /**
     * Execute plugin post process
     */
    pluginPostProcess(graph: SchemaJson, sceneJson: any[], assetFileMap: AssetFileMap, plugins?: Map<string, SceneExporterPlugin>): void;
    /**
     * Created supported resource map
     */
    protected createGuidMap(assetFileMap: AssetFileMap): Map<string, UnityAssetFile>;
    protected addUnityAssetFiles(scene: IUnity.Scene): void;
    protected addUnityAssetFile(entity: IUnity.SceneEntity, key: string): void;
    protected appendComponents(scene: IUnity.Scene, graph: SchemaJson): void;
}
