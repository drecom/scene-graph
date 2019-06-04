"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var commander = require("commander");
/**
 * Parses CLI argument via process.env and convert to Args type.
 */
function parseArgs() {
    var packageJson = require('../../package.json');
    var spaceSeparatedPaths = function (value) {
        var parts = [];
        var frags = value.split(' ');
        for (var i = 0; i < frags.length; i++) {
            var frag = frags[i];
            if (fs.existsSync(frag)) {
                parts.push(frag);
            }
            else {
                var nextFrag = frags[i + 1];
                if (!nextFrag) {
                    break;
                }
                frags[i + 1] = frag + " " + nextFrag;
            }
        }
        return parts;
    };
    commander
        .version(packageJson.version)
        .option('-c, --config [value]', 'config file path')
        .option('-r, --runtime [value]', 'runtime identifier')
        .option('-a, --assetRoot [value]', 'root directory for assets')
        .option('-s, --sceneFiles [value]', 'exporting scene files (space separated)', spaceSeparatedPaths)
        .option('-d, --destDir [value]', "destination directory           default './scene-graph'")
        .option('--assetDestDir [value]', 'asset destination directory     default \${DEST}/\${ASSET_NAME_SPACE}')
        .option('--assetNameSpace [value]', "asset directory name            default 'assets'")
        .option('-p, --plugins [value]', "plugin names (space separated)  default ''", spaceSeparatedPaths).option('--listRuntimes', 'list available runtimes')
        .parse(process.argv);
    // passing option via process.env is deprecated
    var config = {};
    var baseDir = process.cwd();
    if (commander.config) {
        var configPath = path.resolve(process.cwd(), commander.config);
        baseDir = path.dirname(configPath);
        var userConfigFactory = require(configPath);
        config = userConfigFactory();
        if (config.sceneFiles && !Array.isArray(config.sceneFiles)) {
            config.sceneFiles = [config.sceneFiles];
        }
        if (config.plugins && !Array.isArray(config.plugins)) {
            var plugin = config.plugins;
            config.plugins = [plugin];
        }
    }
    // priority
    // cli option > user config > env
    var args = {
        runtime: commander.runtime
            || config.runtime
            || process.env.RUNTIME
            || '',
        assetRoot: commander.assetRoot
            || config.assetRoot
            || process.env.ASSET_ROOT
            || '',
        sceneFiles: commander.sceneFiles
            || config.sceneFiles
            || (process.env.SCENE_FILE ? spaceSeparatedPaths(process.env.SCENE_FILE) : []),
        destDir: commander.destDir
            || config.destDir
            || process.env.DEST
            || path.resolve(baseDir, 'scene-graph'),
        assetDestDir: commander.assetDestDir
            || config.assetDestDir
            || process.env.ASSET_DEST
            || '',
        assetNameSpace: commander.assetNameSpace
            || config.assetNameSpace
            || process.env.ASSET_NAME_SPACE
            || 'assets',
        plugins: commander.plugins
            || config.plugins
            || (process.env.PLUGINS ? spaceSeparatedPaths(process.env.PLUGINS) : []),
        listRuntimes: commander.listRuntimes
    };
    if (args.listRuntimes) {
        return args;
    }
    args.assetDestDir = args.assetDestDir || path.resolve(args.destDir, args.assetNameSpace);
    if (!args.runtime) {
        throw new Error('runtime option is required');
    }
    if (!args.assetRoot) {
        throw new Error('assetRoot option is required');
    }
    if (args.sceneFiles.length === 0) {
        throw new Error('sceneFiles option is required');
    }
    if (!path.isAbsolute(args.assetRoot)) {
        args.assetRoot = path.resolve(baseDir, args.assetRoot);
    }
    if (!path.isAbsolute(args.destDir)) {
        args.destDir = path.resolve(baseDir, args.destDir);
    }
    for (var i = 0; i < args.sceneFiles.length; i++) {
        var sceneFile = args.sceneFiles[i];
        if (!path.isAbsolute(sceneFile)) {
            args.sceneFiles[i] = path.resolve(baseDir, sceneFile);
        }
    }
    args.assetRoot = args.assetRoot.replace(/\/$/, '');
    return args;
}
exports.default = parseArgs;
//# sourceMappingURL=parseArgs.js.map