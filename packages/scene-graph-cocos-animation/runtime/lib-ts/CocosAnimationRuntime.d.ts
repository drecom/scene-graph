/// <reference types="pixi.js" />
import { SchemaJson, Node } from '@drecom/scene-graph-schema';
declare type KeyFrameProperty = {
    [key: string]: number;
};
declare type KeyFrame = {
    frame: number;
    value: number | KeyFrameProperty;
    curve?: string | number[];
};
declare class CocosAnimationRuntimeExtension {
    animation: CocosAnimation;
    animationFrameTime: number;
    target: PIXI.Container;
    curveFuncsMap: Map<string, EaseFunction[]>;
    fps: number;
    paused: boolean;
    elapsedTime: number;
    readonly spf: number;
    constructor(animation: CocosAnimation, target: PIXI.Container);
    pause(): void;
    resume(): void;
    reset(): void;
    private getCurrentFrameIndex;
    update(dt: number): void;
}
declare type CocosAnimation = {
    runtime?: CocosAnimationRuntimeExtension;
    sample: number;
    speed: number;
    url: string;
    curves: {
        [prop: string]: {
            keyFrames: KeyFrame[];
        };
    };
};
declare module 'pixi.js' {
    interface Container {
        sgmed?: {
            cocosAnimations?: CocosAnimation[];
        };
    }
}
declare type EaseFunction = (ratio: number) => number;
export default class CocosAnimationRuntime {
    extendRuntimeObjects(_: SchemaJson, nodeMap: Map<string, Node>, runtimeObjectMap: Map<string, any>): void;
    filterAnimationContainer(rootContainer: PIXI.Container, vector?: PIXI.Container[]): PIXI.Container[];
    static getCurveFunction(curveType?: string | number[]): EaseFunction;
}
export {};
