import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import AssetExportMapEntity from './AssetExportMapEntity';
/**
 * Interface for asset exporter plugin
 */
export default interface AssetExporterPlugin {
    replaceExtendedPaths(sceneGraphMap: Map<string, SchemaJson>, exportMap: Map<string, AssetExportMapEntity>): void;
    getExportMapExtendPaths(node: Node): string[];
}
