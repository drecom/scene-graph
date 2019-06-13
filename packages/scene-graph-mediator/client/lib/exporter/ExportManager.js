"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Bundles each export processes and manages running them.
 */
var ExportManager = /** @class */ (function () {
    function ExportManager() {
        /**
         * Plugins placeholder
         */
        this.plugins = {
            assets: new Map(),
            scenes: new Map()
        };
    }
    /**
     * Register exporter class implements
     */
    ExportManager.registerExporterClass = function (runtimeId, scene, asset) {
        ExportManager.exporters.set(runtimeId.toLowerCase(), { scene: scene, asset: asset });
    };
    /**
     * Returnes registered keys of exporters
     */
    ExportManager.getRegisteredExporterRuntimes = function () {
        var runtimes = [];
        var it = ExportManager.exporters.keys();
        var item = it.next();
        while (!item.done) {
            runtimes.push(item.value);
            item = it.next();
        }
        return runtimes;
    };
    /**
     * Dynamically loads user defined plugin by absolute module path
     */
    ExportManager.prototype.loadPlugins = function (plugins) {
        for (var i = 0; i < plugins.length; i++) {
            var plugin = plugins[i];
            var instance = void 0;
            var pluginName = void 0;
            if (typeof plugin === 'string') {
                var Plugin = require(plugins[i]).default;
                instance = new Plugin();
                pluginName = Plugin.name;
            }
            else {
                instance = plugin;
                pluginName = plugin.constructor.name;
            }
            if (instance.replaceExtendedPaths) {
                this.plugins.assets.set(pluginName, instance);
            }
            // plugin implementations can be unified
            if (instance.extendSceneGraph) {
                this.plugins.scenes.set(pluginName, instance);
            }
        }
    };
    /**
     * Exports scene graphs for given scene file paths
     */
    ExportManager.prototype.exportScene = function (runtimeIdentifier, sceneFiles, assetRoot) {
        var exporters = ExportManager.exporters.get(runtimeIdentifier);
        if (!exporters) {
            throw new Error("runtime '" + runtimeIdentifier + "' is not supported.");
        }
        var exporter = new exporters.scene();
        var sceneGraphs = exporter.createSceneGraphSchemas(sceneFiles, assetRoot, this.plugins.scenes);
        return sceneGraphs;
    };
    /**
     * Create map for exporting assets
     */
    ExportManager.prototype.exportAsset = function (sceneGraphs, runtimeIdentifier, assetRoot, destDir, urlNameSpace) {
        var exporters = ExportManager.exporters.get(runtimeIdentifier);
        if (!exporters) {
            throw new Error("runtime '" + runtimeIdentifier + "' is not supported.");
        }
        var exporter = new exporters.asset();
        var exportMap = exporter.createExportMap(sceneGraphs, assetRoot, destDir, urlNameSpace, this.plugins.assets);
        exporter.replacePaths(sceneGraphs, exportMap, this.plugins.assets);
        return exportMap;
    };
    ExportManager.exporters = new Map();
    return ExportManager;
}());
exports.default = ExportManager;
//# sourceMappingURL=ExportManager.js.map