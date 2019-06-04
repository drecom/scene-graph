import { sgmed, cli } from '@drecom/scene-graph-mediator-cli';
import DefaultSceneExporter from './exporter/scene/DefaultSceneExporter';
import V2SceneExporter from './exporter/scene/V2SceneExporter';
import DefaultAssetExporter from './exporter/asset/DefaultAssetExporter';
import { Identifier } from './constants';

sgmed.ExportManager.registerExporterClass(
  Identifier.COCOS_CREATOR,
  V2SceneExporter,
  DefaultAssetExporter
);
sgmed.ExportManager.registerExporterClass(
  Identifier.COCOS_CREATOR_V1,
  DefaultSceneExporter,
  DefaultAssetExporter
);
sgmed.ExportManager.registerExporterClass(
  Identifier.COCOS_CREATOR_V2,
  V2SceneExporter,
  DefaultAssetExporter
);

export default cli;
