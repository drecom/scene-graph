import { SchemaJson } from '@drecom/scene-graph-schema';
import SceneExporterConstructor from '../interface/SceneExporterConstructor';
import AssetExporterConstructor from '../interface/AssetExporterConstructor';
import AssetExportMapEntity from '../interface/AssetExportMapEntity';
/**
 * Bundles each export processes and manages running them.
 */
export default class ExportManager {
    /**
     * Plugins placeholder
     */
    private plugins;
    /**
     * Dyamically loads scene exporter implements
     */
    static getSceneExporterClass(runtimeId: string): SceneExporterConstructor | null;
    /**
     * Dyamically loads asset exporter implements
     */
    static getAssetExporterClass(runtimeId: string): AssetExporterConstructor | null;
    /**
     * Dynamically loads user defined plugin by absolute module path
     */
    loadPlugins(paths: string[]): void;
    /**
     * Exports scene graphs for given scene file paths
     */
    exportScene(runtimeIdentifier: string, sceneFiles: string[], assetRoot: string): Map<string, SchemaJson>;
    /**
     * Create map for exporting assets
     */
    exportAsset(sceneGraphs: Map<string, SchemaJson>, runtimeIdentifier: string, assetRoot: string, destDir: string, urlNameSpace: string): Map<string, AssetExportMapEntity>;
}
