import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { ImporterPlugin } from '@drecom/scene-graph-mediator-rt';
import Types from './interface/types';
import CocosAnimationRuntimeExtension from './CocosAnimationRuntimeExtension';

/**
 * PIXI.js augmentation
 */
declare module 'pixi.js' {
  interface Container {
    sgmed?: {
      cocosAnimations?: Types.CocosAnimation[]
    }
  }
}

/**
 * Plugin for scene-graph-mediator-rt
 * Handles animation data desceibed in scene-graph-cocos-animation-cli in PIXI runtime
 */
export default class CocosAnimationRuntime implements ImporterPlugin {
  /**
   * Plugin interface inplementation
   * Custom extension for runtime object
   */
  public extendRuntimeObjects(
    _: SchemaJson,
    nodeMap: Map<string, Node>,
    runtimeObjectMap: Map<string, any>
  ): void {
    nodeMap.forEach((node, id) => {
      if (!node.animations) return;

      const container = runtimeObjectMap.get(id) as PIXI.Container;

      if (!container.sgmed) {
        container.sgmed = {};
      }

      container.sgmed.cocosAnimations = node.animations;

      if (!container.sgmed.cocosAnimations) {
        return;
      }

      for (let i = 0; i < container.sgmed.cocosAnimations.length; i++) {
        const cocosAnimation = container.sgmed.cocosAnimations[i];
        cocosAnimation.runtime = new CocosAnimationRuntimeExtension(cocosAnimation, container);
      }
    });
  }

  /**
   * Collect conatiners with animation
   */
  public filterAnimationContainer(rootContainer: PIXI.Container, vector: PIXI.Container[] = []): PIXI.Container[] {
    if (rootContainer.sgmed && rootContainer.sgmed.cocosAnimations) {
      vector.push(rootContainer);
    }

    for (let i = 0; i < rootContainer.children.length; i++) {
      this.filterAnimationContainer(rootContainer.children[i] as PIXI.Container, vector);
    }

    return vector;
  }
}
