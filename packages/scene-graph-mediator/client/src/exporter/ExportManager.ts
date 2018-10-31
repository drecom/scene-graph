import { SchemaJson } from '@drecom/scene-graph-schema';
import SceneExporterPlugin from '../interface/SceneExporterPlugin';
import AssetExporterPlugin from '../interface/AssetExporterPlugin';
import SceneExporterConstructor from '../interface/SceneExporterConstructor';
import AssetExporterConstructor from '../interface/AssetExporterConstructor';
import AssetExportMapEntity from '../interface/AssetExportMapEntity';
import { RuntimeIdentifiers } from '../constants';

/**
 * Bundles each export processes and manages running them.
 */
export default class ExportManager {
  /**
   * Plugins placeholder
   */
  private plugins = {
    assets: new Map<string, AssetExporterPlugin>(),
    scenes: new Map<string, SceneExporterPlugin>()
  };

  /**
   * Dyamically loads scene exporter implements
   */
  public static getSceneExporterClass(runtimeId: string): SceneExporterConstructor | null {
    const id = runtimeId.toLowerCase();

    if (RuntimeIdentifiers.COCOS_CREATOR_V1.indexOf(id) !== -1) {
      return require('../exporter/scene/CocosCreator').default;
    } else if (RuntimeIdentifiers.COCOS_CREATOR_V2.indexOf(id) !== -1) {
      return require('../exporter/scene/CocosCreatorV2').default;
    }

    return null;
  }

  /**
   * Dyamically loads asset exporter implements
   */
  public static getAssetExporterClass(runtimeId: string): AssetExporterConstructor | null {
    const id = runtimeId.toLowerCase();

    if (RuntimeIdentifiers.COCOS_CREATOR_V1.indexOf(id)) {
      return require('../exporter/asset/CocosCreator').default;
    } else if (RuntimeIdentifiers.COCOS_CREATOR_V2.indexOf(id)) {
      return require('../exporter/asset/CocosCreatorV2').default;
    }

    return null;
  }

  /**
   * Dynamically loads user defined plugin by absolute module path
   */
  public loadPlugins(paths: string[]): void {
    for (let i = 0; i < paths.length; i++) {
      const Plugin = require(paths[i]).default;
      const instance = new Plugin() as AssetExporterPlugin | SceneExporterPlugin;
      if ((instance as AssetExporterPlugin).replaceExtendedPaths) {
        this.plugins.assets.set(Plugin.name, instance as AssetExporterPlugin);
      }
      // plugin implementations can be unified
      if ((instance as SceneExporterPlugin).extendSceneGraph) {
        this.plugins.scenes.set(Plugin.name, instance as SceneExporterPlugin);
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
    const ExporterClass = ExportManager.getSceneExporterClass(runtimeIdentifier);
    if (!ExporterClass) {
      throw new Error(`runtime '${runtimeIdentifier}' is not supported.`);
    }

    const exporter = new ExporterClass();
    const sceneGraphs = exporter.createSceneGraphSchemas(sceneFiles, assetRoot, this.plugins.scenes);

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
    const ExporterClass = ExportManager.getAssetExporterClass(runtimeIdentifier);
    if (!ExporterClass) {
      throw new Error(`runtime '${runtimeIdentifier}' is not supported.`);
    }

    const exporter  = new ExporterClass();
    const exportMap = exporter.createExportMap(sceneGraphs, assetRoot, destDir, urlNameSpace, this.plugins.assets);
    exporter.replacePaths(sceneGraphs, exportMap, this.plugins.assets);

    return exportMap;
  }
}
