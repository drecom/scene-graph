import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { sgmed } from '@drecom/scene-graph-mediator-cli';
/**
 * Unity scene exporter
 */
export default class Unity implements sgmed.AssetExporter {
    /**
     * Returns runtime identifier string.
     */
    getIdentifier(): string;
    /**
     * Create asset export map.
     */
    createExportMap(sceneGraphMap: Map<string, SchemaJson>, assetRoot: string, destDir: string, urlNameSpace: string, plugins?: Map<string, sgmed.AssetExporterPlugin>): Map<string, sgmed.AssetExportMapEntity>;
    pluginPostProcess(node: Node, exportMap: Map<string, sgmed.AssetExportMapEntity>, assetRoot: string, destDir: string, urlNameSpace: string, plugins?: Map<string, sgmed.AssetExporterPlugin>): void;
    /**
     * Replace paths in scene graph from absolute local path to relative path/url.
     */
    replacePaths(sceneGraphMap: Map<string, SchemaJson>, exportMap: Map<string, sgmed.AssetExportMapEntity>, plugins?: Map<string, sgmed.AssetExporterPlugin>): void;
    /**
     * iterate exporting assets
     */
    private forEachExportingAsset;
    /**
     * Create asset export map entity.
     */
    private createExportMapEntity;
}
