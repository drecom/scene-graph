import { SchemaJson } from '@drecom/scene-graph-schema';
import SceneExporterPlugin from '../interface/SceneExporterPlugin';
import AssetExporterPlugin from '../interface/AssetExporterPlugin';
import SceneExporterConstructor from '../interface/SceneExporterConstructor';
import AssetExporterConstructor from '../interface/AssetExporterConstructor';
import AssetExportMapEntity from '../interface/AssetExportMapEntity';

/**
 * Bundles each export processes and manages running them.
 */
export default class ExportManager {
  private static exporters = new Map<string, {
    scene: SceneExporterConstructor,
    asset: AssetExporterConstructor
  }>();
  /**
   * Plugins placeholder
   */
  private plugins = {
    assets: new Map<string, AssetExporterPlugin>(),
    scenes: new Map<string, SceneExporterPlugin>()
  };

  /**
   * Register exporter class implements
   */
  public static registerExporterClass(
    runtimeId: string,
    scene: SceneExporterConstructor,
    asset: AssetExporterConstructor
  ): void {
    ExportManager.exporters.set(runtimeId.toLowerCase(), { scene, asset });
  }

  /**
   * Returnes registered keys of exporters
   */
  public static getRegisteredExporterRuntimes(): string[] {
    const runtimes = [];
    const it = ExportManager.exporters.keys();
    let item = it.next();
    while (!item.done) {
      runtimes.push(item.value);
      item = it.next();
    }
    return runtimes;
  }

  /**
   * Dynamically loads user defined plugin by absolute module path
   */
  public loadPlugins(plugins: string[] | AssetExporterPlugin[] | SceneExporterPlugin[]): void {
    for (let i = 0; i < plugins.length; i++) {
      const plugin: string | AssetExporterPlugin | SceneExporterPlugin = plugins[i];
      let instance;
      let pluginName;

      if (typeof plugin === 'string') {
        const Plugin = require(plugins[i] as string).default;
        instance = new Plugin() as AssetExporterPlugin | SceneExporterPlugin;
        pluginName = Plugin.name;
      } else {
        instance = plugin as AssetExporterPlugin | SceneExporterPlugin;
        pluginName = plugin.constructor.name;
      }

      if ((instance as AssetExporterPlugin).replaceExtendedPaths) {
        this.plugins.assets.set(pluginName, instance as AssetExporterPlugin);
      }
      // plugin implementations can be unified
      if ((instance as SceneExporterPlugin).extendSceneGraph) {
        this.plugins.scenes.set(pluginName, instance as SceneExporterPlugin);
      }
    }
  }

  /**
   * Exports scene graphs for given scene file paths
   */
  public exportScene(
    runtimeIdentifier: string,
    sceneFiles: string[],
    assetRoot: string
  ): Map<string, SchemaJson> {
    const exporters = ExportManager.exporters.get(runtimeIdentifier);
    if (!exporters) {
      throw new Error(`runtime '${runtimeIdentifier}' is not supported.`);
    }

    const exporter = new exporters.scene();
    const sceneGraphs = exporter.createSceneGraphSchemas(
      sceneFiles,
      assetRoot,
      this.plugins.scenes
    );

    return sceneGraphs;
  }

  /**
   * Create map for exporting assets
   */
  public exportAsset(
    sceneGraphs: Map<string, SchemaJson>,
    runtimeIdentifier: string,
    assetRoot: string,
    destDir: string,
    urlNameSpace: string
  ): Map<string, AssetExportMapEntity> {
    const exporters = ExportManager.exporters.get(runtimeIdentifier);
    if (!exporters) {
      throw new Error(`runtime '${runtimeIdentifier}' is not supported.`);
    }

    const exporter  = new exporters.asset();
    const exportMap = exporter.createExportMap(
      sceneGraphs,
      assetRoot,
      destDir,
      urlNameSpace,
      this.plugins.assets
    );
    exporter.replacePaths(sceneGraphs, exportMap, this.plugins.assets);

    return exportMap;
  }
}
