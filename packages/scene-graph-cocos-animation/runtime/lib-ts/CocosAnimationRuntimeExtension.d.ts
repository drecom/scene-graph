/// <reference types="pixi.js" />
import Types from './interface/types';
/**
 * Cocos animation augment object for PIXI.Container.
 */
export default class CocosAnimationRuntimeExtension {
    /**
     * Cocos animation data
     */
    animation: Types.CocosAnimation;
    /**
     * Animation frame time described in seconds
     * e.g) 1 frame of 60 FPS should be 0.016666...
     */
    animationFrameTime: number;
    /**
     * parent pixi object
     */
    target: PIXI.Container;
    /**
     * Applying curve functions related to properties
     * Functions are registerd in order to key frame.
     */
    curveFuncsMap: Map<string, Types.EaseFunction[]>;
    /**
     * Application fps
     */
    fps: number;
    /**
     * Boolean to represent animation is paused
     */
    paused: boolean;
    /**
     * Animation elapsed time described in seconds
     */
    elapsedTime: number;
    colorMatrix?: PIXI.filters.ColorMatrixFilter;
    /**
     * Seconds per frame by application fps
     */
    readonly spf: number;
    /**
     * Get curve function by given curve type.
     */
    static getCurveFunction(curveType?: string | number[]): Types.EaseFunction;
    constructor(animation: Types.CocosAnimation, target: PIXI.Container);
    /**
     * Pause animation
     */
    pause(): void;
    /**
     * Resume animation
     */
    resume(): void;
    /**
     * Reset animation
     */
    reset(): void;
    /**
     * Returns index of current key frame.
     * Current key frame is calcurated by elapsed time and animation fps.
     * It returns -1 when the elapsedTime has not been reached to the earliest key frame yet.
     * Also it returns the length of key frame to indicate all key frames are passed.
     */
    private getCurrentKeyFrameIndex;
    /**
     * Update animation if possible
     */
    update(dt: number): void;
    private static getPrimitiveAnimationPropertyConversionInfo;
    private static getObjectAnimationPropertyConversionInfoSet;
    private static getAnimationPropertyConversionInfoSet;
}
