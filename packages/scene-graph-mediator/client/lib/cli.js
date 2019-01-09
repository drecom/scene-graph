"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var ExportManager_1 = require("./exporter/ExportManager");
var parseArgs_1 = require("./modules/parseArgs");
var mkdirp_1 = require("./modules/mkdirp");
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
        console.log(e);
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
    var assetExportMap = manager.exportAsset(sceneGraphs, args.runtime, args.assetRoot, args.assetDestDir, args.assetNameSpace);
    var newDirRoot = args.assetDestDir;
    mkdirp_1.default(newDirRoot);
    // write scene graph file
    sceneGraphs.forEach(function (sceneGraph, sceneFilePath) {
        var destFileName = path.basename(sceneFilePath) + ".json";
        var dest = path.join(args.assetDestDir, destFileName);
        // if (debug) {
        fs.writeFile(dest, JSON.stringify(sceneGraph, null, 2), function () { });
        // } else {
        //   fs.writeFile(dest, JSON.stringify(sceneGraph), () => {});
        // }
    });
    // copy assets
    assetExportMap.forEach(function (entity) {
        var targetDir = path.dirname(entity.localDestPath);
        mkdirp_1.default(targetDir);
        fs.copyFile(entity.localSrcPath, entity.localDestPath, function () { });
    });
}
exports.default = cli;
//# sourceMappingURL=cli.js.map