import { SchemaJson } from '@drecom/scene-graph-schema';
import SceneExporterPlugin from '../interface/SceneExporterPlugin';
import AssetExporterPlugin from '../interface/AssetExporterPlugin';
import SceneExporterConstructor from '../interface/SceneExporterConstructor';
import AssetExporterConstructor from '../interface/AssetExporterConstructor';
import AssetExportMapEntity from '../interface/AssetExportMapEntity';
/**
 * Bundles each export processes and manages running them.
 */
export default class ExportManager {
    private static exporters;
    /**
     * Plugins placeholder
     */
    private plugins;
    /**
     * Register exporter class implements
     */
    static registerExporterClass(runtimeId: string, scene: SceneExporterConstructor, asset: AssetExporterConstructor): void;
    /**
     * Returnes registered keys of exporters
     */
    static getRegisteredExporterRuntimes(): string[];
    /**
     * Dynamically loads user defined plugin by absolute module path
     */
    loadPlugins(plugins: string[] | AssetExporterPlugin[] | SceneExporterPlugin[]): void;
    /**
     * Exports scene graphs for given scene file paths
     */
    exportScene(runtimeIdentifier: string, sceneFiles: string[], assetRoot: string): Map<string, SchemaJson>;
    /**
     * Create map for exporting assets
     */
    exportAsset(sceneGraphs: Map<string, SchemaJson>, runtimeIdentifier: string, assetRoot: string, destDir: string, urlNameSpace: string): Map<string, AssetExportMapEntity>;
}
