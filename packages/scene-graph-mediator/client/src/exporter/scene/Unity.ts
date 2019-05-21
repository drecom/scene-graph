import * as fs from 'fs';
import * as yaml from 'yaml';

import { SchemaJson, Node, Transform3D, MeshRenderer } from '@drecom/scene-graph-schema';

import SceneExporter from '../../interface/SceneExporter';
import SceneExporterPlugin from '../../interface/SceneExporterPlugin';

import AssetFileMap from '../../asset/AssetFileMap';

import * as IUnity from '../../interface/Unity';
import UnityAssetFile from '../../asset/UnityAssetFile';

/**
 * Unity scene exporter
 */
export default class Unity implements SceneExporter {

  private guidMap: Map<string, UnityAssetFile> = new Map<string, UnityAssetFile>();

  /**
   * Returns runtime identifier string.
   */
  public getIdentifier(): string {
    return 'unity';
  }

  /**
   * export scene graph
   *
   * - createGuidMap
   * - (for each scene file)
   *   - loadSceneFile
   *     - addUnityAssetFiles
   *       - addUnityAssetFile
   *     - loadSceneFile (recursive)
   *   - createSceneGraph
   */
  public createSceneGraphSchemas(
    sceneFiles: string[],
    assetRoot: string,
    plugins?: Map<string, SceneExporterPlugin>
  ): Map<string, SchemaJson> {
    const graphs = new Map<string, SchemaJson>();

    const assetFileMap = new AssetFileMap(assetRoot);
    assetFileMap.scan();

    this.guidMap = this.createGuidMap(assetFileMap);

    sceneFiles.forEach((sceneFile) => {
      const sceneJson = this.loadSceneFile(sceneFile);
      const graph = this.createSceneGraph(sceneJson);
      graphs.set(sceneFile, graph);

      if (plugins) {
        this.pluginPostProcess(graph, sceneJson, assetFileMap, plugins);
      }
    });

    return graphs;
  }

  /**
   * Read scene file using file system and convert to javascript object.
   */
  public loadSceneFile(sceneFile: string): any {
    const components: IUnity.Scene = {};

    const content = fs.readFileSync(sceneFile).toString();
    // TODO: parseAllDocuments takes long time
    const documents = yaml.parseAllDocuments(content);

    const childEntities: { anchor: string, entity: IUnity.SceneEntity }[] = [];

    // parse scene components
    documents.forEach((document) => {
      const json = document.toJSON();
      const anchor = Object.keys((document.anchors as any).map)[0];
      const componentName = Object.keys(json)[0];
      const prefab = (componentName === IUnity.Component.Name.PREFAB_INSTANCE) ? true : false;
      const data = json[componentName];
      const entity: IUnity.SceneEntity = { prefab, componentName, data };
      components[anchor] = entity;

      if (entity.componentName === IUnity.Component.Name.PREFAB_INSTANCE) {
        childEntities.push({ anchor, entity });
      }
    });

    this.addUnityAssetFiles(components);

    const childSceneFiles = this.collectChildSceneFiles(components);

    childSceneFiles.forEach((item) => {
      const nestedComponents = this.loadSceneFile(item.path);
      components[item.anchor].data = nestedComponents;
    });

    return components;
  }

  private collectChildSceneFiles(scene: IUnity.Scene): {
    anchor: string;
    path: string;
  }[] {
    const childSceneFiles: {
      anchor: string;
      path: string;
    }[] = [];

    Object.entries(scene).forEach((array: any[]) => {
      const anchor: string = array[0] as string;
      const entity: IUnity.SceneEntity = array[1] as IUnity.SceneEntity;
      if (!entity.sgmed || !entity.sgmed.assets) {
        return;
      }

      let key = null;
      switch (entity.componentName) {
        // FIXME: direct string literal
        case IUnity.Component.Name.PREFAB_INSTANCE: key = 'm_SourcePrefab'; break;
        default: break;
      }

      if (!key) {
        return;
      }

      const assets = entity.sgmed.assets[key];
      if (!assets) {
        return;
      }

      const file = assets[0].file;
      if (!file) {
        return;
      }

      childSceneFiles.push({
        anchor,
        path: file.asset
      });
    });

    return childSceneFiles;
  }

  /**
   * Create scene graph with scene file dto and collected resource map
   */
  public createSceneGraph(json: any): SchemaJson {
    const graph: SchemaJson = {
      scene: [],
      metadata: {
        width: 0,
        height: 0,
        positiveCoord: {
          xRight: true,
          yDown:  false,
          zFront: false
        },
        baseCoordinate: {
          x: 'center',
          y: 'center',
          z: 'center'
        },
        format: this.getIdentifier()
      }
    };

    this.appendComponents(json, graph);

    return graph;
  }

  /**
   * Execute plugin post process
   */
  public pluginPostProcess(
    graph: SchemaJson,
    sceneJson: any[],
    assetFileMap: AssetFileMap,
    plugins?: Map<string, SceneExporterPlugin>
  ): void {
    if (!plugins) {
      return;
    }

    plugins.forEach((plugin) => {
      plugin.extendSceneGraph(graph, sceneJson, assetFileMap);
    });
  }

  /**
   * Created supported resource map
   */
  protected createGuidMap(assetFileMap: AssetFileMap): Map<string, UnityAssetFile> {
    const guidMap = new Map<string, UnityAssetFile>();

    assetFileMap.forEach((item) => {
      const metaFile = item.filePath;
      if (!UnityAssetFile.isMetaFile(metaFile)) {
        return;
      }

      const content = fs.readFileSync(metaFile, 'utf-8');

      try {
        const json: IUnity.File.Meta = yaml.parse(content);
        const assetFile = UnityAssetFile.createWithMetaFile(metaFile);
        guidMap.set(json.guid, assetFile);
      } catch (e) {
        // can not avoid unity's invalid yaml semantic
        console.warn(metaFile, e.message);
      }
    });

    return guidMap;
  }

  protected addUnityAssetFiles(scene: IUnity.Scene): void {
    Object.entries(scene).forEach((array: any) => {
      const entity = array[1] as IUnity.SceneEntity;
      switch (entity.componentName) {
        case IUnity.Component.Name.GAME_OBJECT: {
          // FIXME: direct string literal
          this.addUnityAssetFile(entity, 'm_CorrespondingSourceObject');
          break;
        }
        case IUnity.Component.Name.PREFAB_INSTANCE: {
          // FIXME: direct string literal
          this.addUnityAssetFile(entity, 'm_SourcePrefab');
          break;
        }
        case IUnity.Component.Name.SKINNED_MESH_RENDERER: {
          // FIXME: direct string literal
          this.addUnityAssetFile(entity, 'm_Mesh');
          this.addUnityAssetFile(entity, 'm_Materials');
          break;
        }
        default: break;
      }
    });
  }

  protected addUnityAssetFile(entity: IUnity.SceneEntity, key: string): void {
    const value = entity.data[key];
    if (!value) {
      return;
    }

    entity.sgmed = entity.sgmed || {};
    entity.sgmed.assets = entity.sgmed.assets || {};
    entity.sgmed.assets[key] = [];

    const assets: IUnity.File.Element.FileReference[]
      = (value.constructor.name === 'Array') ? value : [value];
    assets.forEach((item: IUnity.File.Element.FileReference) => {
      const ref = item as IUnity.File.Element.FileReference;
      if (!ref.guid) {
        return;
      }

      const file = this.guidMap.get(`${ref.guid}`);
      if (!file) {
        return;
      }

      entity.sgmed!.assets![key].push({ ref, file });
    });
  }

  protected appendComponents(scene: IUnity.Scene, graph: SchemaJson): void {
    type GameObjectMapEntry = {
      entity: IUnity.SceneEntity,
      node: Node
    };

    // expand prefab instances
    Object.entries(scene).forEach((array: any) => {
      const entity = array[1] as IUnity.SceneEntity;
      if (entity.componentName === IUnity.Component.Name.PREFAB_INSTANCE) {
        this.appendComponents(entity.data, graph);
      }
    });

    // collect gameobjects
    const gameObjects = new Map<string, GameObjectMapEntry>();
    Object.entries(scene).forEach((array: any) => {
      const anchor = array[0] as string;
      const entity = array[1] as IUnity.SceneEntity;
      if (entity.componentName === IUnity.Component.Name.GAME_OBJECT) {
        const gameObject = entity.data as IUnity.Component.GameObject;
        const node: Node = {
          id: anchor,
          name: gameObject.m_Name,
          constructorName: entity.componentName
        };
        gameObjects.set(anchor, { entity, node });
        graph.scene.push(node);
      }
    });

    Object.entries(scene).forEach((array: any) => {
      const entity = array[1] as IUnity.SceneEntity;

      switch (entity.componentName) {
        case IUnity.Component.Name.TRANSFORM: {
          const transform = entity.data as IUnity.Component.Transform;
          const gameObject = gameObjects.get(`${transform.m_GameObject.fileID}`);
          if (!gameObject) {
            break;
          }
          const transform3d: Transform3D = {
            x: transform.m_LocalPosition.x,
            y: transform.m_LocalPosition.y,
            z: transform.m_LocalPosition.z,
            scale: {
              x: transform.m_LocalScale.x,
              y: transform.m_LocalScale.y,
              z: transform.m_LocalScale.z
            },
            rotation: {
              x: transform.m_LocalRotation.x,
              y: transform.m_LocalRotation.y,
              z: transform.m_LocalRotation.z,
              w: transform.m_LocalRotation.w
            }
          };
          gameObject.node.transform3d = transform3d;
          break;
        }
        case IUnity.Component.Name.SKINNED_MESH_RENDERER: {
          if (!entity.sgmed || !entity.sgmed.assets) {
            break;
          }

          const meshRenderer = entity.data as IUnity.Component.SkinnedMeshRenderer;
          const gameObject = gameObjects.get(`${meshRenderer.m_GameObject.fileID}`);
          if (!gameObject) {
            break;
          }

          const renderer: MeshRenderer = {
            mesh: { url: '' },
            materials: []
          };

          const meshFile = entity.sgmed.assets['m_Mesh'][0].file;
          const materialAssetInfo = entity.sgmed.assets['m_Materials'];

          if (meshFile) {
            renderer.mesh!.url = meshFile.asset;
          }

          if (materialAssetInfo) {
            materialAssetInfo.forEach((assetInfo: IUnity.SgmedAssetInfo) => {
              const content = fs.readFileSync(assetInfo.file.asset).toString();
              const materialJson = yaml.parse(content) as IUnity.File.Material;
              const textures = materialJson.Material.m_SavedProperties.m_TexEnvs;

              textures.forEach((texture) => {
                Object.entries(texture).forEach((array: any[]) => {
                  const textureProp = array[1] as IUnity.File.Element.TextureProperty;
                  if (!textureProp.m_Texture.guid) {
                    return;
                  }
                  const file = this.guidMap.get(textureProp.m_Texture.guid);
                  if (!file) {
                    return;
                  }
                  renderer.materials!.push({
                    url: file.asset
                  });
                });
              });
            });
          }

          gameObject.node.meshRenderer = renderer;
          break;
        }
        case IUnity.Component.Name.GAME_OBJECT:
        case IUnity.Component.Name.PREFAB_INSTANCE:
        default: break;
      }
    });
  }
}
