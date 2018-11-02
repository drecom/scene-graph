import { CocosAnimationClientTypes as ClientTypes } from '@drecom/scene-graph-cocos-animation-cli';
import Types from './interface/types';
import Easing from './Easing';
import bezierByTime from './besier';

function createBezierByTime(controlPoints: number[]) {
  return (ratio: number) => bezierByTime(controlPoints, ratio);
}

/**
 * Cocos animation augment object for PIXI.Container.
 */
export default class CocosAnimationRuntimeExtension {
  /**
   * Cocos animation data
   */
  public animation!: Types.CocosAnimation;
  /**
   * Animation frame time described in seconds
   * e.g) 1 frame of 60 FPS should be 0.016666...
   */
  public animationFrameTime!: number;
  /**
   * parent pixi object
   */
  public target!: PIXI.Container;
  /**
   * Applying curve functions related to properties
   * Functions are registerd in order to key frame.
   */
  public curveFuncsMap!: Map<string, Types.EaseFunction[]>;

  /**
   * Application fps
   */
  public fps: number = 60;
  /**
   * Boolean to represent animation is paused
   */
  public paused: boolean = false;
  /**
   * Animation elapsed time described in seconds
   */
  public elapsedTime: number = 0;

  /**
   * Seconds per frame by application fps
   */
  public get spf(): number {
    return 1.0 / this.fps;
  }

  /**
   * Get curve function by given curve type.
   */
  public static getCurveFunction(curveType?: string | number[]): Types.EaseFunction {
    if (!curveType) {
      return Easing.linear;
    }

    if (typeof curveType === 'string') {
      if (Easing.hasOwnProperty(curveType)) {
        return Easing[curveType] as Types.EaseFunction;
      }

      return Easing.linear;
    }

    // custom curve
    return createBezierByTime(curveType) as Types.EaseFunction;
  }

  constructor(animation: Types.CocosAnimation, target: PIXI.Container) {
    this.animation = animation;
    this.target    = target;
    this.animationFrameTime = 1.0 / this.animation.sample;
    this.curveFuncsMap = new Map<string, Types.EaseFunction[]>();

    const properties = Object.keys(this.animation.curves);
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];

      const curveFuncs = [];
      const curve = this.animation.curves[property];
      for (let j = 0; j < curve.keyFrames.length; j++) {
        const keyFrame = curve.keyFrames[j];
        const func = CocosAnimationRuntimeExtension.getCurveFunction(keyFrame.curve);
        curveFuncs.push(func);
      }

      this.curveFuncsMap.set(property, curveFuncs);
    }
  }

  /**
   * Pause animation
   */
  public pause(): void {
    this.paused = true;
  }
  /**
   * Resume animation
   */
  public resume(): void {
    this.paused = false;
  }
  /**
   * Reset animation
   */
  public reset(): void {
    this.elapsedTime = 0;
  }

  /**
   * Returns index of current key frame
   * current key frame is calcurated by elapsed time and animation fps
   */
  private getCurrentFrameIndex(keyFrames: ClientTypes.AnimationFrame[], elapsedTime: number, fps: number): number {
    const spf = 1.0 / fps;

    for (let i = keyFrames.length - 1; i >= 0; i--) {
      // 60fps: 0.1 = 6 frames, 0.016 * 6 sec
      // 30fps: 0.1 = 3 frames, 0.033 * 3 sec
      const keyFrame = keyFrames[i];
      const keyFrameTime = spf * (fps * keyFrame.frame);

      if (keyFrameTime < elapsedTime) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Update animation if possible
   */
  public update(dt: number): void {
    if (this.paused) {
      return;
    }

    this.elapsedTime += dt * this.spf;

    let activeCurveExists = false;

    const properties = Object.keys(this.animation.curves);
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const curve = this.animation.curves[property];

      const currentFrameIndex = this.getCurrentFrameIndex(curve.keyFrames, this.elapsedTime, this.animation.sample);
      if (currentFrameIndex === -1) {
        continue;
      }

      const curveFuncs = this.curveFuncsMap.get(property);
      if (!curveFuncs || curveFuncs.length == 0) {
        continue;
      }

      let nextFrame;
      let currentFrame = curve.keyFrames[currentFrameIndex];
      let timeRatio = 0.0;

      // last frame
      if (currentFrameIndex >= curve.keyFrames.length - 1) {
        nextFrame    = currentFrame;
        currentFrame = curve.keyFrames[currentFrameIndex - 1];
        timeRatio    = 1.0;
      } else {
        const currentKeyFrameAsTime = this.animationFrameTime * (this.animation.sample * currentFrame.frame);
        nextFrame = curve.keyFrames[currentFrameIndex + 1];

        // time_ratio = time_from_current_key_frame / time_to_next_frame
        timeRatio =
          // time_from_current_key_frame
          (this.elapsedTime - currentKeyFrameAsTime) /
          // time_to_next_frame = next_key_frame_as_time - current_key_frame_as_time
          (
            // next_key_frame_as_time
            (this.animationFrameTime * (this.animation.sample * nextFrame.frame)) -
            currentKeyFrameAsTime
          );

        activeCurveExists = true;
      }

      const targetValue  = nextFrame.value;
      const currentValue = currentFrame.value;
      const curveFunc    = curveFuncs[currentFrameIndex];

      if (typeof currentValue === 'number') {
        const valueDistance = (targetValue as number) - (currentValue as number);
        const value = currentValue + valueDistance * curveFunc(timeRatio);
        if (property === 'x') {
          this.target.position[property] = value;
        } else if (property === 'y') {
          this.target.position[property] = value * -1;
        } else if (property === 'opacity') {
          this.target.alpha = value / 255;
        } else {
          (this.target as any)[property] = value;
        }
      } else {
        const targetValueObject  = (targetValue as ClientTypes.AnimationFrameProperty);
        const currentValueObject = (currentValue as ClientTypes.AnimationFrameProperty);

        if (property === 'color') {
          const curvedRatio = curveFunc(timeRatio);
          if ('tint' in this.target) {
            const currentColorRatio = {
              r: currentValueObject.r / 255,
              g: currentValueObject.g / 255,
              b: currentValueObject.b / 255
            };
            const targetColorRatio = {
              r: targetValueObject.r / 255,
              g: targetValueObject.g / 255,
              b: targetValueObject.b / 255
            };
            const addingColor = {
              r: 0xff0000 * ((targetColorRatio.r - currentColorRatio.r) * curvedRatio),
              g: 0x00ff00 * ((targetColorRatio.g - currentColorRatio.g) * curvedRatio),
              b: 0x0000ff * ((targetColorRatio.b - currentColorRatio.b) * curvedRatio)
            };

            (this.target as any).tint =
              (currentColorRatio.r / 0xff0000) + (addingColor.r - addingColor.r % 0x010000) +
              (currentColorRatio.g / 0x00ff00) + (addingColor.g - addingColor.g % 0x000100) +
              (currentColorRatio.b / 0x0000ff) + addingColor.b;
          }
        } else {
          const keys = Object.getOwnPropertyNames(currentValueObject);
          for (let j = 0; j < keys.length; j++) {
            const key = keys[j];
            
            const valueDistance = targetValueObject[key] - currentValueObject[key];
            const value = currentValueObject[key] + valueDistance * curveFunc(timeRatio);
            (this.target as any)[property][key] = value;
          }
        }
      }
    }

    if (!activeCurveExists) {
      this.paused = true;
    }
  }
};
