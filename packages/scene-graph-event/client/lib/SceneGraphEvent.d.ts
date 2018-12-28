import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { sgmed } from '@drecom/scene-graph-mediator-cli';
export default class SceneGraphEvent implements sgmed.SceneExporterPlugin, sgmed.AssetExporterPlugin {
    extendSceneGraph(_schema: SchemaJson, _src: any, _map: sgmed.AssetFileMap): void;
    replaceExtendedPaths(_scgemaMap: Map<string, SchemaJson>, _assetMap: Map<string, sgmed.AssetExportMapEntity>): void;
    getExportMapExtendPaths(_: Node): string[];
}
