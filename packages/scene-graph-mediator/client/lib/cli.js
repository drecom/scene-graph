"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var ExportManager_1 = require("./exporter/ExportManager");
var parseArgs_1 = require("./modules/parseArgs");
var constants_1 = require("./constants");
/**
 * entry point for export CLI
 */
function cli() {
    var args;
    try {
        args = parseArgs_1.default();
    }
    catch (e) {
        console.log(constants_1.CliHelptext);
        return;
    }
    /**
     * Instantiate exporter implement
     */
    var manager = new ExportManager_1.default();
    manager.loadPlugins(args.plugins);
    /**
     * Execute export
     */
    var sceneGraphs = manager.exportScene(args.runtime, args.sceneFiles, args.assetRoot);
    // scene graph file manages assets
    var exportExportMap = manager.exportAsset(sceneGraphs, args.runtime, args.assetRoot, args.assetDestDir, args.assetNameSpace);
    // file system control
    fs.mkdir(args.assetDestDir, function () {
        // write scene graph file
        sceneGraphs.forEach(function (sceneGraph, sceneFilePath) {
            var destFileName = path.basename(sceneFilePath) + '.json';
            var dest = path.join(args.assetDestDir, destFileName);
            // if (debug) {
            fs.writeFile(dest, JSON.stringify(sceneGraph, null, 2), function () { });
            // } else {
            //   fs.writeFile(dest, JSON.stringify(sceneGraph), () => {});
            // }
        });
        // copy assets
        exportExportMap.forEach(function (entity) {
            var targetDir = path.dirname(entity.localDestPath);
            fs.mkdir(targetDir, function () {
                fs.copyFile(entity.localSrcPath, entity.localDestPath, function () { });
            });
        });
    });
}
exports.default = cli;
//# sourceMappingURL=cli.js.map