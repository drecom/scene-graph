import * as fs from 'fs';

import { SchemaJson, Node } from '@drecom/scene-graph-schema';
//import { SceneExporterPlugin, AssetExporterPlugin, AssetFileMap } from '@drecom/scene-graph-mediator-cli';
import { sgmed } from '@drecom/scene-graph-mediator-cli';

import Types from './interface/types';

declare namespace Fire {
  type NodeId = {
    __id__: number;
  };

  type Node = {
    __type__: string;
    _components?: Node[];
    node: NodeId;
  };

  type AnimationFrame = {
    frame: number;
    value: { [key: string]: number };
    curve?: number[] | string;
  };

  type Animation = {
    _duration: number;
    sample: number;
    speed: number;
    curveData: {
      props?: {
        [key: string]: AnimationFrame[];
      },
      paths?: {
        [key: string]: {
          props: {
            [key: string]: AnimationFrame[];
          }
        }
      }
    }
  };

  type AnimationComponentReference = Node & {
    _defaultClip: { __uuid__: string },
    _clips: { __uuid__: string }[],
    playOnLoad: boolean
  };
}

type AnimationFiles = {
  anim: string;
  meta: string;
};

type NodeId   = string;
type MetaUuid = string;

export default class SceneGraphAnimation implements sgmed.SceneExporterPlugin, sgmed.AssetExporterPlugin {

  public static readonly AnimationFileExt = 'anim';
  public static readonly MetaFileExt = 'meta';

  public extendSceneGraph(graph: SchemaJson, dataSource: Fire.Node[], assetFileMap: sgmed.AssetFileMap): void {
    const animationFilesMap   = this.collectAnimationFiles(assetFileMap);
    const animationComponents = this.collectAnimationNodes(dataSource);

    this.extendNodesWithAnimationComponent(animationFilesMap, animationComponents, graph);
  }

  public replaceExtendedPaths(sceneGraphMap: Map<string, SchemaJson>, exportMap: Map<string, sgmed.AssetExportMapEntity>): void {
    sceneGraphMap.forEach((graph) => {
      for (let i = 0; i < graph.scene.length; i++) {
        const node = graph.scene[i];

        if (!node.animations) continue;

        for (let j = 0; j < node.animations.length; j++) {
          const animation = node.animations[j];
          const entity = exportMap.get(animation.url);

          if (entity) {
            animation.url = entity.url;
          }
        }
      }
    });
  }

  public getExportMapExtendPaths(node: Node): string[] {
    const paths = [];

    if (node.animations) {
      for (let i = 0; i < node.animations.length; i++) {
        paths.push(node.animations[i].url)
      }
    }

    return paths;
  }

  private collectAnimationFiles(assetFileMap: sgmed.AssetFileMap): Map<MetaUuid, AnimationFiles> {
    const animationFilesMap = new Map<MetaUuid, AnimationFiles>();

    // retrieve animation files
    const pattern = new RegExp(`\\.${SceneGraphAnimation.AnimationFileExt}$`);

    assetFileMap.forEach((entity) => {
      const absPath = entity.filePath;
      if (!pattern.test(absPath)) return;

      const metaPath = `${absPath}.${SceneGraphAnimation.MetaFileExt}`;
      if (!fs.existsSync(metaPath)) return;

      const content = fs.readFileSync(metaPath).toString();
      const meta    = JSON.parse(content);

      animationFilesMap.set(meta.uuid, {
        anim: absPath,
        meta: metaPath
      });
    });

    return animationFilesMap;
  }

  private collectAnimationNodes(dataSource: Fire.Node[]): Map<NodeId, Fire.AnimationComponentReference> {
    const animationComponents = new Map<NodeId, Fire.AnimationComponentReference>();

    for (let i = 0; i < dataSource.length; i++) {
      const fireNode = dataSource[i];

      if (!fireNode.__type__) continue;
      if (fireNode.__type__ === 'cc.Animation') {
        // set relation with parent node id
        animationComponents.set(`${fireNode.node.__id__}`, fireNode as Fire.AnimationComponentReference);
      }
    }

    return animationComponents;
  }

  private extendNodesWithAnimationComponent(
    animationFilesMap: Map<MetaUuid, AnimationFiles>,
    animationComponents: Map<NodeId, Fire.AnimationComponentReference>,
    graph: SchemaJson
  ): void {
    const nodeNameMap = new Map<string, Node>();
    for (let i = 0; i < graph.scene.length; i++) {
      const node = graph.scene[i];
      nodeNameMap.set(node.name, node);
    }

    for (let i = 0; i < graph.scene.length; i++) {
      const nodeRef = graph.scene[i];
      const componentRef = animationComponents.get(nodeRef.id);

      if (!componentRef) continue;

      for (let j = 0; j < componentRef._clips.length; j++) {
        const animationFiles = animationFilesMap.get(componentRef._clips[j].__uuid__);
        if (!animationFiles) {
          continue;
        }
        const content  = fs.readFileSync(animationFiles.anim).toString();
        const clipJson = JSON.parse(content) as Fire.Animation;

        if (clipJson.curveData.props) {
          const animation: Types.Animation = {
            duration: clipJson._duration,
            sample: clipJson.sample,
            speed: clipJson.speed,
            url: animationFiles.anim,
            curves: {}
          };

          const props = clipJson.curveData.props;
          const propertyNames = Object.keys(props);
          for (let k = 0; k < propertyNames.length; k++) {
            const property = propertyNames[k];
            animation.curves[property] = this.createAnimationFrames(props[property], property);
          }

          if (!nodeRef.animations) {
            nodeRef.animations = [];
          }
          nodeRef.animations.push(animation);
        }

        if (clipJson.curveData.paths) {
          const paths = clipJson.curveData.paths;
          const nodePaths = Object.keys(paths);

          for (let k = 0; k < nodePaths.length; k++) {
            const nodePath = nodePaths[k];
            const nodeName = nodePath.split('/').pop();
            if (!nodeName) continue;

            const relativeNodeRef = nodeNameMap.get(nodeName);
            if (!relativeNodeRef) continue;

            const animation: Types.Animation = {
              duration: clipJson._duration,
              sample: clipJson.sample,
              speed: clipJson.speed,
              url: animationFiles.anim,
              curves: {}
            };

            const props = paths[nodePath].props;

            const propertyNames = Object.keys(props);
            for (let l = 0; l < propertyNames.length; l++) {
              const property = propertyNames[l];
              animation.curves[property] = this.createAnimationFrames(props[property], property);
            }

            if (!relativeNodeRef.animations) {
              relativeNodeRef.animations = [];
            }

            relativeNodeRef.animations.push(animation);
          }
        }
      }
    }
  }

  private createAnimationFrames(frames: Types.AnimationFrame[], property: string): Types.AnimationCurveData {
    const curveData: Types.AnimationCurveData = {
      keyFrames: []
    };

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const graphFrame: Types.AnimationFrame = {
        frame: frame.frame,
        value: {}
      };

      if (frame.curve) {
        graphFrame.curve = frame.curve;
      }

      if (typeof frame.value === 'number') {
        graphFrame.value = frame.value;
      } else if (Array.isArray(frame.value)){
        if (property === 'scale' || property === 'position') {
          (graphFrame.value as Types.AnimationFrameProperty).x = frame.value[0];
          (graphFrame.value as Types.AnimationFrameProperty).y = frame.value[1];
        }
      } else {
        const keys = Object.keys(frame.value);
        for (let j = 0; j < keys.length; j++) {
          const key = keys[j];

          if (key === '__type__') continue;

          (graphFrame.value as Types.AnimationFrameProperty)[key] = frame.value[key];
        }
      }

      curveData.keyFrames.push(graphFrame);
    }

    return curveData;
  }
}
