import * as path from 'path';

import { SchemaJson } from '@drecom/scene-graph-schema';
import AssetExporter from '../../interface/AssetExporter';
import AssetExporterPlugin from '../../interface/AssetExporterPlugin';
import AssetExportMapEntity from '../../interface/AssetExportMapEntity';

/**
 * CocosCreator scene exporter
 */
export default class CocosCreator implements AssetExporter {

  /**
   * Returns runtime identifier string.
   */
  public getIdentifier(): string {
    return 'cocoscreator';
  }

  /**
   * Create asset export map.
   */
  public createExportMap(
    sceneGraphMap: Map<string, SchemaJson>,
    assetRoot: string,
    destDir: string,
    urlNameSpace: string,
    plugins?: Map<string, AssetExporterPlugin>
  ): Map<string, AssetExportMapEntity> {
    const exportMap = new Map<string, AssetExportMapEntity>();

    sceneGraphMap.forEach((graph) => {
      const scene = graph.scene;
      for (let i = 0; i < scene.length; i++) {
        const node = scene[i];
        if (node.sprite) {
          if (node.sprite.url) {
            exportMap.set(node.sprite.url, this.createExportMapEntity(node.sprite.url, assetRoot, destDir, urlNameSpace));
          }
          if (node.sprite.atlasUrl) {
            exportMap.set(node.sprite.atlasUrl, this.createExportMapEntity(node.sprite.atlasUrl, assetRoot, destDir, urlNameSpace));
          }
        }

        if (!plugins) continue;

        plugins.forEach((plugin) => {
          const paths = plugin.getExportMapExtendPaths(node);
          if (paths.length === 0) return;

          for (let j = 0; j < paths.length; j++) {
            exportMap.set(paths[j], this.createExportMapEntity(paths[j], assetRoot, destDir, urlNameSpace));
          }
        });
      }
    });

    return exportMap;
  }

  /**
   * Replace paths in scene graph from absolute local path to relative path/url.
   */
  public replacePaths(
    sceneGraphMap: Map<string, SchemaJson>,
    exportMap: Map<string, AssetExportMapEntity>,
    plugins?: Map<string, AssetExporterPlugin>
  ): void {
    /**
     * replace local path with url
     */
    sceneGraphMap.forEach((sceneGraph) => {
      sceneGraph.scene.forEach((node) => {
        if (node.sprite) {
          if (node.sprite.url) {
            const entity = exportMap.get(node.sprite.url);
            if (entity) {
              node.sprite.url = entity.url;
            }
          }
          if (node.sprite.atlasUrl) {
            const entity = exportMap.get(node.sprite.atlasUrl);
            if (entity) {
              node.sprite.atlasUrl = entity.url;
            }
          }
        }
      });
    });

    if (!plugins) return;

    plugins.forEach((plugin) => {
      plugin.replaceExtendedPaths(sceneGraphMap, exportMap);
    });
  }

  /**
   * Create asset export map entity.
   */
  private createExportMapEntity(basePath: string, assetRoot: string, destDir: string, urlNameSpace: string = ''): AssetExportMapEntity {
    const relativePath = basePath.replace(RegExp(`\^${assetRoot}`), '');

    return {
      localSrcPath: basePath,
      localDestPath: path.join(destDir, relativePath),
      url: path.join(urlNameSpace, relativePath)
    };
  }
}
