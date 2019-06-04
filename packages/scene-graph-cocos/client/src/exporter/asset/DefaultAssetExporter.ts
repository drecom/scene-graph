import * as path from 'path';

import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { sgmed } from '@drecom/scene-graph-mediator-cli';

/**
 * CocosCreator scene exporter
 */
export default class DefaultAssetExporter implements sgmed.AssetExporter {

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
    plugins?: Map<string, sgmed.AssetExporterPlugin>
  ): Map<string, sgmed.AssetExportMapEntity> {
    const exportMap = new Map<string, sgmed.AssetExportMapEntity>();

    sceneGraphMap.forEach((graph) => {
      const scene = graph.scene;
      for (let i = 0; i < scene.length; i++) {
        const node = scene[i];
        if (node.sprite) {
          if (node.sprite.url) {
            exportMap.set(
              node.sprite.url,
              this.createExportMapEntity(node.sprite.url, assetRoot, destDir, urlNameSpace)
            );
          }
          if (node.sprite.atlasUrl) {
            exportMap.set(
              node.sprite.atlasUrl,
              this.createExportMapEntity(node.sprite.atlasUrl, assetRoot, destDir, urlNameSpace)
            );
          }
        }

        if (node.mask && node.mask.spriteFrame) {
          const maskSprite = node.mask.spriteFrame;

          if (maskSprite.url) {
            exportMap.set(
              maskSprite.url,
              this.createExportMapEntity(maskSprite.url, assetRoot, destDir, urlNameSpace)
            );
          }
          if (maskSprite.atlasUrl) {
            exportMap.set(
              maskSprite.atlasUrl,
              this.createExportMapEntity(maskSprite.atlasUrl, assetRoot, destDir, urlNameSpace)
            );
          }
        }

        this.pluginPostProcess(node, exportMap, assetRoot, destDir, urlNameSpace, plugins);
      }
    });

    return exportMap;
  }

  public pluginPostProcess(
    node: Node,
    exportMap: Map<string, sgmed.AssetExportMapEntity>,
    assetRoot: string,
    destDir: string,
    urlNameSpace: string,
    plugins?: Map<string, sgmed.AssetExporterPlugin>
  ): void {
    if (!plugins) {
      return;
    }

    plugins.forEach((plugin) => {
      const paths = plugin.getExportMapExtendPaths(node);
      if (paths.length === 0) return;

      for (let j = 0; j < paths.length; j++) {
        exportMap.set(
          paths[j],
          this.createExportMapEntity(paths[j], assetRoot, destDir, urlNameSpace)
        );
      }
    });
  }

  /**
   * Replace paths in scene graph from absolute local path to relative path/url.
   */
  public replacePaths(
    sceneGraphMap: Map<string, SchemaJson>,
    exportMap: Map<string, sgmed.AssetExportMapEntity>,
    plugins?: Map<string, sgmed.AssetExporterPlugin>
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
        if (node.mask && node.mask.spriteFrame) {
          if (node.mask.spriteFrame.url) {
            const entity = exportMap.get(node.mask.spriteFrame.url);
            if (entity) {
              node.mask.spriteFrame.url = entity.url;
            }
          }
          if (node.mask.spriteFrame.atlasUrl) {
            const entity = exportMap.get(node.mask.spriteFrame.atlasUrl);
            if (entity) {
              node.mask.spriteFrame.atlasUrl = entity.url;
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
  private createExportMapEntity(
    basePath: string,
    assetRoot: string,
    destDir: string,
    urlNameSpace: string = ''
  ): sgmed.AssetExportMapEntity {
    const relativePath = basePath.replace(RegExp(`\^${assetRoot}`), '');

    return {
      localSrcPath: basePath,
      localDestPath: path.join(destDir, relativePath),
      url: path.join(urlNameSpace, relativePath)
    };
  }
}
