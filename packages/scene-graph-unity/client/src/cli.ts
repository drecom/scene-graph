import { sgmed, cli } from '@drecom/scene-graph-mediator-cli';
import DefaultSceneExporter from './exporter/scene/DefaultSceneExporter';
import DefaultAssetExporter from './exporter/asset/DefaultAssetExporter';
import { Identifier } from './constants';

sgmed.ExportManager.registerExporterClass(
  Identifier.UNITY,
  DefaultSceneExporter,
  DefaultAssetExporter
);

export default cli;
