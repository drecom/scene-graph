/// <reference types="pixi.js" />
import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { ImporterPlugin, ImportOption } from '@drecom/scene-graph-mediator-rt';
import Types from './interface/types';
/**
 * PIXI.js augmentation
 */
declare module 'pixi.js' {
    interface Container {
        sgmed?: {
            cocosAnimations?: Types.CocosAnimation[];
        };
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
    extendRuntimeObjects(_: SchemaJson, nodeMap: Map<string, Node>, runtimeObjectMap: Map<string, any>, option: ImportOption): void;
    /**
     * Collect conatiners with animation
     */
    filterAnimationContainer(rootContainer: PIXI.Container, vector?: PIXI.Container[]): PIXI.Container[];
}
