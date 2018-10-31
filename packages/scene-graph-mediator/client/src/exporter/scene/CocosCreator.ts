import * as fs from 'fs';
// import * as path from 'path';

import { SchemaJson, Node, Transform } from '@drecom/scene-graph-schema';

import * as cc from '../../interface/CocosCreator';
import SceneExporter from '../../interface/SceneExporter';
import SceneExporterPlugin from '../../interface/SceneExporterPlugin';

import AssetFileMap from '../../asset/AssetFileMap';

/**
 * Cocos Creator resource type
 */
const ResourceType: {
  [key: string]: string
} = Object.freeze({
  NOT_RESOURCE: 'NotResource',
  SPRITE_FRAME: 'SpriteFrame',
  ATLAS: 'Atlas',
});

/**
 * Entity data structure of resource map.
 */
type ResourceMapEntity = {
  id: string;
  path: string;
  metaPath: string;
  type: string;
  submetas?: { [key: string]: cc.MetaBase }
};

/**
 * CocosCreator V1.x scene exporter
 */
export default class CocosCreator implements SceneExporter {

  /**
   * Returns runtime identifier string.
   */
  public getIdentifier(): string {
    return 'cocoscreator';
  }

  /**
   * export scene graph
   */
  public createSceneGraphSchemas(sceneFiles: string[], assetRoot: string, plugins?: Map<string, SceneExporterPlugin>): Map<string, SchemaJson> {
    const graphs = new Map<string, SchemaJson>();

    for (let i = 0; i < sceneFiles.length; i++) {
      const sceneFile    = sceneFiles[i];
      const sceneJson    = this.loadSceneFile(sceneFile);
      const assetFileMap = new AssetFileMap(assetRoot);
      assetFileMap.scan();

      const resourceMap = this.createLocalResourceMap(assetFileMap);

      const graph = this.createSceneGraph(sceneJson);

      this.appendComponents(sceneJson, graph, resourceMap);

      if (!plugins) continue;

      plugins.forEach((plugin) => {
        plugin.extendSceneGraph(graph, sceneJson, assetFileMap);
      });

      graphs.set(sceneFile, graph);
    }

    return graphs;
  }

  /**
   * Read scene file using file system and convert to javascript object.
   */
  public loadSceneFile(sceneFile: string): any {
    const content = fs.readFileSync(sceneFile).toString();
    return JSON.parse(content);
  }

  /**
   * Create scene graph with scene file dto and collected resource map
   */
  public createSceneGraph(json: any[]): SchemaJson {
    const graph: SchemaJson = {
      scene: [],
      metadata: {
        width: 0,
        height: 0,
        positiveCoord: {
          xRight: true,
          yDown:  false
        },
        baseCoordinate: {
          x: 'center',
          y: 'center'
        },
        format: this.getIdentifier()
      }
    };

    this.appendMetaData(json, graph);

    this.appendNodes(json, graph);

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
  protected createLocalResourceMap(assetFileMap: AssetFileMap): Map<string, ResourceMapEntity> {
    const resourceMap = new Map<string, ResourceMapEntity>();

    assetFileMap.forEach((item) => {
      const entities = this.createResourceMapEntities(item.filePath);
      entities.forEach((entity) => resourceMap.set(entity.id, entity));
    });

    return resourceMap;
  }

  /**
   * Create array of RespirceMapEntity
   */
  protected createResourceMapEntities(absPath: string): ResourceMapEntity[] {
    const entities: ResourceMapEntity[] = [];

    const meta = `${absPath}.meta`;
    if (!fs.existsSync(meta)) {
      return entities;
    }

    let json: cc.MetaBase;
    const content = fs.readFileSync(meta).toString();

    try {
      json = JSON.parse(content);
    } catch (e) {
      return entities;
    }

    const entity: ResourceMapEntity = {
      id: json.uuid,
      path: absPath,
      metaPath: meta,
      type: ResourceType.NOT_RESOURCE
    };

    const ext = absPath.split('.').pop();
    if (ext) {
      switch (ext.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
        case 'png':   entity.type = ResourceType.SPRITE_FRAME; break;
        case 'plist': entity.type = ResourceType.ATLAS;        break;
        default:      entity.type = ResourceType.NOT_RESOURCE; break;
      }
    }

    // add submetas if exists
    switch (entity.type) {
      case ResourceType.SPRITE_FRAME:
      case ResourceType.ATLAS: {
        const submetas = (json as cc.MetaBase).subMetas;
        entity.submetas = submetas;
        const keys = Object.keys(submetas);
        for (let i = 0; i < keys.length; i++) {
          const submeta = submetas[keys[i]];
          entities.push({
            id: submeta.uuid,
            path: absPath,
            metaPath: meta,
            type: entity.type,
            submetas: submeta.subMetas
          });
        }
        break;
      }
    }

    entities.push(entity);

    return entities;
  }

  /**
   * Add node to SchemaJson.scene.<br />
   * Convert transform to SchemaJson schema.
   */
  protected appendNodes(json: cc.ComponentBase[], graph: SchemaJson): void {
    const canvas = this.findComponentByType(json, cc.MetaTypes.CANVAS) as cc.Canvas;

    // collect nodes identified by id, scene file terats index as node id
    const nodes = new Map<number, cc.ComponentBase>();
    for (let i = 0; i < json.length; i++) {
      const component = json[i];
      if (component.__type__ === cc.MetaTypes.NODE) {
        nodes.set(i, component);
      }
    }

    nodes.forEach((value, i) => {
      const node = value as cc.Node;
      if (node.__type__ === cc.MetaTypes.NODE && !node._position) {
        return;
      }

      let parentId = null;
      let isRoot   = false;
      const isCanvas = (i === canvas.node.__id__);

      // CocosCreator's Scene has Canvas as root children
      if (node._parent) {
        parentId = node._parent.__id__;
        if (json[parentId].__type__ === cc.MetaTypes.SCENE) {
          isRoot = true;
        }
      }

      const transform = this.createDefaultTransform(node);
      if (node.__type__ !== cc.MetaTypes.NODE || isCanvas) {
        transform.x = 0;
        transform.y = 0;
      }
      if (node._rotationX !== node._rotationY) {
        transform.rotation = 0;
      }
      if (!isRoot && parentId) {
        transform.parent = parentId.toString();
      }

      const schemaNode: Node = {
        id: i.toString(),
        name: node._name,
        constructorName: node.__type__,
        transform: transform,
        renderer: {
          color: {
            r: node._color.r,
            g: node._color.g,
            b: node._color.b,
            // cocos's bug? _color.a is not used
            a: node._opacity
          }
        }
      };

      schemaNode.transform.children = [];

      // detect children and push
      const children = node._children;
      for (let j = 0; j < children.length; j++) {
        schemaNode.transform.children.push(children[j].__id__.toString());
      }

      graph.scene.push(schemaNode);
    });
  }

  /**
   * Returns object with Transform schema using Cocos Node data.
   */
  protected createDefaultTransform(component: cc.ComponentBase): Transform {
    const node = component as cc.Node;

    return {
      width:  node._contentSize.width,
      height: node._contentSize.height,
      x: node._position.x,
      y: node._position.y,
      rotation: node._rotationX,
      scale: {
        x: node._scaleX,
        y: node._scaleY
      },
      anchor: {
        x: node._anchorPoint.x,
        y: node._anchorPoint.y
      }
    };
  }

  /**
   * Append metadata to scene graph data
   */
  protected appendMetaData(json: any[], graph: SchemaJson) {
    const component = this.findComponentByType(json, cc.MetaTypes.CANVAS) as cc.Canvas;
    if (!component) {
      return;
    }

    graph.metadata.width  = component._designResolution.width;
    graph.metadata.height = component._designResolution.height;

    const node = json[component.node.__id__];
    graph.metadata.anchor = {
      x: node._anchorPoint.x,
      y: node._anchorPoint.y
    };

    // cocos's coordinate system has zero-zero coordinate on left bottom.
    graph.metadata.positiveCoord = {
      xRight: true,
      yDown:  false
    };
  }

  /**
   * Append supported components to scene graph node
   */
  protected appendComponents(
    json: cc.ComponentBase[],
    graph: SchemaJson,
    resourceMap: Map<string, ResourceMapEntity>
  ): void {
    for (let i = 0; i < json.length; i++) {
      const component = json[i] as cc.Component;
      if (!component.node) {
        continue;
      }

      const schemaNode = this.findSchemaNodeById(graph, component.node.__id__.toString());
      if (!schemaNode) {
        continue;
      }

      this.appendComponentByType(schemaNode, component, resourceMap);
    }
  }

  /**
   * Detect and append supported component to scene graph node
   */
  protected appendComponentByType(
    schemaNode: Node,
    component: cc.Component,
    resourceMap: Map<string, ResourceMapEntity>
  ): void {
    switch (component.__type__) {
      case cc.MetaTypes.SPRITE: {
        const spriteFrameUuid = (component as cc.Sprite)._spriteFrame;
        if (!spriteFrameUuid) {
          break;
        }

        const spriteFrameEntity = resourceMap.get(spriteFrameUuid.__uuid__);
        if (!spriteFrameEntity) {
          break;
        }

        let submeta: cc.MetaSprite | null = null;

        const atlasUuid = (component as cc.Sprite)._atlas;
        // _spriteFrame may directs sprite that may contain atlas path
        if (atlasUuid) {
          const atlasEntity = resourceMap.get(atlasUuid.__uuid__);
          if (!atlasEntity) {
            break;
          }

          // TODO: shouldn't read file
          const atlasMetaContent = fs.readFileSync(atlasEntity.metaPath);
          const atlasMetaJson = JSON.parse(atlasMetaContent.toString()) as cc.MetaBase;

          let frameName: string | null = null;

          const keys = Object.keys(atlasMetaJson.subMetas);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (atlasMetaJson.subMetas[key].uuid === spriteFrameUuid.__uuid__) {
              frameName = key;
              submeta   = atlasMetaJson.subMetas[key] as cc.MetaSprite;
              break;
            }
          }

          if (!frameName) {
            break;
          }

          // path to sprite
          const rawTextureEntity = resourceMap.get((submeta as cc.MetaSprite).rawTextureUuid);
          if (!rawTextureEntity) {
            break;
          }

          schemaNode.sprite = {
            frameName,
            url: rawTextureEntity.path,
            atlasUrl: atlasEntity.path
          };
        } else {
          // TODO: shouldn't read file
          const spriteFrameMetaContent = fs.readFileSync(spriteFrameEntity.metaPath);
          const spriteFrameMetaJson = JSON.parse(spriteFrameMetaContent.toString()) as cc.MetaBase;
          const keys = Object.keys(spriteFrameMetaJson.subMetas);
          if (keys.length === 0) {
            break;
          }

          const frameName = keys[0];
          submeta = spriteFrameMetaJson.subMetas[frameName] as cc.MetaSprite;
          schemaNode.sprite = {
            frameName,
            url: spriteFrameEntity.path
          };
        }

        if (
          submeta && (
            submeta.borderTop    !== 0 ||
            submeta.borderBottom !== 0 ||
            submeta.borderLeft   !== 0 ||
            submeta.borderRight  !== 0
          )
        ) {
          schemaNode.sprite.slice = {
            top:    submeta.borderTop,
            bottom: submeta.borderBottom,
            left:   submeta.borderLeft,
            right:  submeta.borderRight
          };
        }

        break;
      }
      case cc.MetaTypes.LABEL: {
        schemaNode.text = {
          text: (component as cc.Label)._N$string,
          style: {
            size: (component as cc.Label)._fontSize,
            horizontalAlign: (component as cc.Label)._N$horizontalAlign
          }
        };

        // TODO: alpha
        let colorStr = '#FFFFFF';
        if (schemaNode.renderer && schemaNode.renderer.color) {
          // Label uses node color
          const color = schemaNode.renderer.color;
          colorStr = `#${color.r.toString(16)}${color.g.toString(16)}${color.b.toString(16)}`;
        }
        schemaNode.text.style.color = colorStr;

        break;
      }
      default: break;
    }
  }

  /**
   * Find and return component data if node has target component
   */
  protected findComponentByType(json: cc.ComponentBase[], type: string): cc.ComponentBase | null {
    for (let i = 0; i < json.length; i++) {
      const component = json[i];
      if (component.__type__ === type) {
        return component;
      }
    }

    return null;
  }

  /**
   * Find node in scene grapph by id
   */
  protected findSchemaNodeById(graph: SchemaJson, id: string): Node | null {
    const scene = graph.scene;
    for (let i = 0; i < scene.length; i++) {
      const element = scene[i];
      if (element.id === id) {
        return element;
      }
    }

    return null;
  }
}
