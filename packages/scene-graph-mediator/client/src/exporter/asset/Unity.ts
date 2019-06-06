import * as path from 'path';
import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import AssetExporter from '../../interface/AssetExporter';
import AssetExporterPlugin from '../../interface/AssetExporterPlugin';
import AssetExportMapEntity from '../../interface/AssetExportMapEntity';

type ExportAssetIterator = (owner: any, key: string, path: string, parentAsset?: string) => void;

/**
 * Unity scene exporter
 */
export default class Unity implements AssetExporter {

  /**
   * Returns runtime identifier string.
   */
  public getIdentifier(): string {
    return 'unity';
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

      scene.forEach((node) => {
        this.forEachExportingAsset(node, (_owner, _key, path, parentAsset) => {
          let movePath = '';
          if (parentAsset) {
            const assetPaths = path.split('/');
            if (assetPaths.length > 0) {
              const parentAssetPaths = parentAsset.split('/');
              parentAssetPaths.pop();
              parentAssetPaths.push(assetPaths.pop() as string);
              movePath = parentAssetPaths.join('/');
            }
          }
          const entity = this.createExportMapEntity(
            path,
            assetRoot,
            destDir,
            urlNameSpace,
            movePath
          );
          exportMap.set(path, entity);
        });

        this.pluginPostProcess(node, exportMap, assetRoot, destDir, urlNameSpace, plugins);
      });
    });

    return exportMap;
  }

  public pluginPostProcess(
    node: Node,
    exportMap: Map<string, AssetExportMapEntity>,
    assetRoot: string,
    destDir: string,
    urlNameSpace: string,
    plugins?: Map<string, AssetExporterPlugin>
  ): void {
    if (!plugins) {
      return;
    }

    plugins.forEach((plugin) => {
      plugin.getExportMapExtendPaths(node).forEach((path) => {
        const entity = this.createExportMapEntity(path, assetRoot, destDir, urlNameSpace);
        exportMap.set(path, entity);
      });
    });
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
        this.forEachExportingAsset(node, (owner, key, path) => {
          const entity = exportMap.get(path);
          if (entity) {
            owner[key] = entity.url;
          }
        });
      });
    });

    if (!plugins) return;

    plugins.forEach((plugin) => {
      plugin.replaceExtendedPaths(sceneGraphMap, exportMap);
    });
  }

  /**
   * iterate exporting assets
   */
  private forEachExportingAsset(node: Node, proc: ExportAssetIterator): void {
    if (node.meshRenderer) {
      if (node.meshRenderer.mesh) {
        proc(node.meshRenderer.mesh, 'url', node.meshRenderer.mesh.url);
        if (node.meshRenderer.materials) {
          node.meshRenderer.materials.forEach((material: any) => {
            proc(material, 'url', material.url, node.meshRenderer!.mesh!.url);
          });
        }
      }
    }
  }

  /**
   * Create asset export map entity.
   */
  private createExportMapEntity(
    basePath: string,
    assetRoot: string,
    destDir: string,
    urlNameSpace: string,
    movePath: string = ''
  ): AssetExportMapEntity {
    const destRelativePath = path.relative(assetRoot, (movePath || basePath));
    return {
      localSrcPath: basePath,
      localDestPath: path.join(destDir, destRelativePath),
      url: path.join(urlNameSpace, destRelativePath)
    };
  }
}
