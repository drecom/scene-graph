"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var scene_graph_mediator_cli_1 = require("@drecom/scene-graph-mediator-cli");
var DefaultSceneExporter_1 = require("./exporter/scene/DefaultSceneExporter");
var DefaultAssetExporter_1 = require("./exporter/asset/DefaultAssetExporter");
var constants_1 = require("./constants");
scene_graph_mediator_cli_1.sgmed.ExportManager.registerExporterClass(constants_1.Identifier.UNITY, DefaultSceneExporter_1.default, DefaultAssetExporter_1.default);
exports.default = scene_graph_mediator_cli_1.cli;
//# sourceMappingURL=cli.js.map