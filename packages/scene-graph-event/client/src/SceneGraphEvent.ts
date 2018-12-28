import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { sgmed } from '@drecom/scene-graph-mediator-cli';

export default class SceneGraphEvent implements sgmed.SceneExporterPlugin, sgmed.AssetExporterPlugin {

  public extendSceneGraph(_schema: SchemaJson, _src: any, _map: sgmed.AssetFileMap): void {
  }

  public replaceExtendedPaths(_scgemaMap: Map<string, SchemaJson>, _assetMap: Map<string, sgmed.AssetExportMapEntity>): void {
  }

  public getExportMapExtendPaths(_: Node): string[] {
    return [];
  }
}
