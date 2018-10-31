import { SchemaJson } from '@drecom/scene-graph-schema';
import AssetExporter from '../../interface/AssetExporter';
import AssetExporterPlugin from '../../interface/AssetExporterPlugin';
import AssetExportMapEntity from '../../interface/AssetExportMapEntity';
/**
 * CocosCreator scene exporter
 */
export default class CocosCreator implements AssetExporter {
    /**
     * Returns runtime identifier string.
     */
    getIdentifier(): string;
    /**
     * Create asset export map.
     */
    createExportMap(sceneGraphMap: Map<string, SchemaJson>, assetRoot: string, destDir: string, urlNameSpace: string, plugins?: Map<string, AssetExporterPlugin>): Map<string, AssetExportMapEntity>;
    /**
     * Replace paths in scene graph from absolute local path to relative path/url.
     */
    replacePaths(sceneGraphMap: Map<string, SchemaJson>, exportMap: Map<string, AssetExportMapEntity>, plugins?: Map<string, AssetExporterPlugin>): void;
    /**
     * Create asset export map entity.
     */
    private createExportMapEntity;
}
