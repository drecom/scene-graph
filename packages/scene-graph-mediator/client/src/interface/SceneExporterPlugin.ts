import { SchemaJson } from '@drecom/scene-graph-schema';
import AssetFileMap from '../asset/AssetFileMap';

/**
 * Interface for pugin of scene exporter
 */
export default interface SceneExporterPlugin {
  extendSceneGraph(graph: SchemaJson, dataSource: any, assetFileMap: AssetFileMap): void;
}
