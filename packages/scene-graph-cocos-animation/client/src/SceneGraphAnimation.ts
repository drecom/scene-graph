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
    sample: number;
    speed: number;
    curveData: {
      props: {
        [key: string]: AnimationFrame[];
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

    for (let i = 0; i < graph.scene.length; i++) {
      const node = graph.scene[i];;
      const component = animationComponents.get(node.id);

      if (!component) continue;

      this.extendNodeWithAnimationComponent(animationFilesMap, node, component);
    }
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


  private extendNodeWithAnimationComponent(
    animationFilesMap: Map<MetaUuid, AnimationFiles>,
    nodeRef: Node,
    componentRef: Fire.AnimationComponentReference
  ): void {
    nodeRef.animations = [];

    for (let i = 0; i < componentRef._clips.length; i++) {
      const animationFiles = animationFilesMap.get(componentRef._clips[i].__uuid__);
      if (!animationFiles) {
        continue;
      }
      const content = fs.readFileSync(animationFiles.anim).toString();
      const clipJson = JSON.parse(content) as Fire.Animation;

      const animation: Types.Animation = {
        sample: clipJson.sample,
        speed: clipJson.speed,
        url: animationFiles.anim,
        curves: {}
      };

      const properties = Object.keys(clipJson.curveData.props);
      for (let j = 0; j < properties.length; j++) {
        const property = properties[j];
        animation.curves[property] = this.createAnimationFrames(clipJson.curveData.props[property]);
      }

      nodeRef.animations.push(animation);
    }
  }

  private createAnimationFrames(frames: Types.AnimationFrame[]): Types.AnimationCurveData {
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
