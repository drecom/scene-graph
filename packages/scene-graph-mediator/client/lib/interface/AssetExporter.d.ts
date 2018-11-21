import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import AssetExporterPlugin from './AssetExporterPlugin';
import AssetExportMapEntity from './AssetExportMapEntity';
/**
 * Interface for exporter implementation of assets
 */
export default interface AssetExporter {
    createExportMap(sceneGraphMap: Map<string, SchemaJson>, assetRoot: string, destDir: string, urlNameSpace: string, plugins?: Map<string, AssetExporterPlugin>): Map<string, AssetExportMapEntity>;
    pluginPostProcess(node: Node, exportMap: Map<string, AssetExportMapEntity>, assetRoot: string, destDir: string, urlNameSpace: string, plugins?: Map<string, AssetExporterPlugin>): void;
    replacePaths(sceneGraphMap: Map<string, SchemaJson>, exportMap: Map<string, AssetExportMapEntity>, plugins?: Map<string, AssetExporterPlugin>): void;
}
