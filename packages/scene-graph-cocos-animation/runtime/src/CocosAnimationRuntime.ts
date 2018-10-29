import { SchemaJson, Node } from '@drecom/scene-graph-schema';

type KeyFrameProperty = {
  [key: string]: number;
};

type KeyFrame = {
  frame: number;
  value: number | KeyFrameProperty;
  curve?: string | number[];
};

class CocosAnimationRuntimeExtension {
  public animation!: CocosAnimation;
  public animationFrameTime!: number;
  public target!: PIXI.Container;
  public curveFuncsMap!: Map<string, EaseFunction[]>;

  public fps: number = 60;
  public paused: boolean = false;
  public elapsedTime: number = 0;

  public get spf(): number {
    return 1.0 / this.fps;
  }

  constructor(animation: CocosAnimation, target: PIXI.Container) {
    this.animation = animation;
    this.target    = target;
    this.animationFrameTime = 1.0 / this.animation.sample;
    this.curveFuncsMap = new Map<string, EaseFunction[]>();

    const properties = Object.keys(this.animation.curves);
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];

      const curveFuncs = [];
      const curve = this.animation.curves[property];
      for (let j = 0; j < curve.keyFrames.length; j++) {
        const keyFrame = curve.keyFrames[j];
        const func = CocosAnimationRuntime.getCurveFunction(keyFrame.curve);
        curveFuncs.push(func);
      }

      this.curveFuncsMap.set(property, curveFuncs);
    }
  }

  public pause(): void {
    this.paused = true;
  }
  public resume(): void {
    this.paused = false;
  }
  public reset(): void {
    this.elapsedTime = 0;
  }

  private getCurrentFrameIndex(keyFrames: KeyFrame[], elapsedTime: number, fps: number): number {
    const spf = 1.0 / fps;

    for (let i = keyFrames.length - 1; i >= 0; i--) {
      // 60fps, 0.1 = 6 frames, 0.016 * 6
      // 30fps, 0.1 = 3 frames, 0.033 * 3
      const keyFrame = keyFrames[i];
      const keyFrameTime = spf * (fps * keyFrame.frame);

      if (keyFrameTime < elapsedTime) {
        return i;
      }
    }

    return -1;
  }

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
      if (currentFrameIndex === -1 || currentFrameIndex >= curve.keyFrames.length - 1) {
        continue;
      }

      const currentFrame = curve.keyFrames[currentFrameIndex];
      const nextFrame    = curve.keyFrames[currentFrameIndex + 1];

      const curveFuncs = this.curveFuncsMap.get(property);
      if (!curveFuncs || curveFuncs.length == 0) {
        continue;
      }

      const curveFunc = curveFuncs[currentFrameIndex];

      const currentKeyFrameAsTime = this.animationFrameTime * (this.animation.sample * currentFrame.frame);

      // time_ratio = time_from_current_key_frame / time_to_next_frame
      const timeRatio =
      // time_from_current_key_frame
      (this.elapsedTime - currentKeyFrameAsTime) /
      // time_to_next_frame = next_key_frame_as_time - current_key_frame_as_time
      (
        // next_key_frame_as_time
        (this.animationFrameTime * (this.animation.sample * nextFrame.frame)) -
        currentKeyFrameAsTime
      );

      const currentValue = currentFrame.value;
      const targetValue  = nextFrame.value;

      if (typeof currentValue === 'number') {
        const valueDistance = (targetValue as number) - (currentValue as number);
        (this.target as any)[property] = currentValue + valueDistance * curveFunc(timeRatio);
      } else {
        const keys = Object.getOwnPropertyNames(currentValue);
        for (let j = 0; j < keys.length; j++) {
          const key = keys[j];
          const targetPropValue  = (targetValue as KeyFrameProperty)[key];
          const currentPropValue = (currentValue as KeyFrameProperty)[key];

          const valueDistance = targetPropValue - currentPropValue;
          const value = curveFunc(timeRatio);
          (this.target as any)[property][key] = currentPropValue + valueDistance * value;
        }
      }

      activeCurveExists = true;
    }

    if (!activeCurveExists) {
      this.paused = true;
    }
  }
};

type CocosAnimation = {
  runtime?: CocosAnimationRuntimeExtension;
  sample: number;
  speed: number;
  url: string;
  curves: {
    [prop: string]: {
      keyFrames: KeyFrame[];
    };
  }
};

declare module 'pixi.js' {
  interface Container {
    sgmed?: {
      cocosAnimations?: CocosAnimation[]
    }
  }
}

type EaseFunction = (ratio: number) => number;

const Easing: {
  [name: string]: EaseFunction;
} = {
  linear: (ratio: number): number => {
    return ratio;
  },
  quadOut: (ratio: number): number => {
    return ratio * (2 - ratio);
  }
}


const tau = 2 * Math.PI;

function crt(v: number) {
  return (v < 0) ? -Math.pow(-v, 1 / 3) : Math.pow(v, 1 / 3);
}


function cardano(curve: number[], ratio: number) {
  const pa = ratio;
  const pb = ratio - curve[0];
  const pc = ratio - curve[2];
  const pd = ratio - 1;

  // to [t^3 + at^2 + bt + c] form:
  const pa3 = pa * 3;
  const pb3 = pb * 3;
  const pc3 = pc * 3;
  const d = (-pa + pb3 - pc3 + pd);
  const rd = 1 / d;
  const r3 = 1 / 3;
  const a = (pa3 - 6 * pb + pc3) * rd;
  const a3 = a * r3;
  const b = (-pa3 + pb3) * rd;
  const c = pa * rd;
  // then, determine p and q:
  const p = (3 * b - a * a) * r3;
  const p3 = p * r3;
  const q = (2 * a * a * a - 9 * a * b + 27 * c) / 27;
  const q2 = q / 2;
  // and determine the discriminant:
  const discriminant = q2 * q2 + p3 * p3 * p3;

  // If the discriminant is negative, use polar coordinates
  // to get around square roots of negative numbers
  if (discriminant < 0) {
    const mp3 = -p * r3;
    const mp33 = mp3 * mp3 * mp3;
    const r = Math.sqrt(mp33);
    // compute cosphi corrected for IEEE float rounding:
    const t = -q / (2 * r);
    const cosphi = t < -1 ? -1 : t > 1 ? 1 : t;
    const phi = Math.acos(cosphi);
    const crtr = crt(r);
    const t1 = 2 * crtr;
    const x1 = t1 * Math.cos(phi * r3) - a3;
    const x2 = t1 * Math.cos((phi + tau) * r3) - a3;
    const x3 = t1 * Math.cos((phi + 2 * tau) * r3) - a3;

    // choose best percentage
    if (0 <= x1 && x1 <= 1) {
      if (0 <= x2 && x2 <= 1) {
        return (0 <= x3 && x3 <= 1) ? Math.max(x1, x2, x3) : Math.max(x1, x2);
      } else {
        return (0 <= x3 && x3 <= 1) ? Math.max(x1, x3) : x1;
      }
    } else {
      if (0 <= x2 && x2 <= 1) {
        return (0 <= x3 && x3 <= 1) ? Math.max(x2, x3) : x2;
      } else {
        return x3;
      }
    }
  } else if (discriminant === 0) {
    const u1 = q2 < 0 ? crt(-q2) : -crt(q2);
    const x1 = 2 * u1 - a3;
    const x2 = -u1 - a3;

    // choose best percentage
    if (0 <= x1 && x1 <= 1) {
      return (0 <= x2 && x2 <= 1) ? Math.max(x1, x2) : x1;
    } else {
      return x2;
    }
  } else {
    // one real root, and two imaginary roots
    const sd = Math.sqrt(discriminant);
    return crt(-q2 + sd) - crt(q2 + sd) - a3;
  }
}

function createBezierByTime(controlPoints: number[]) {
  return (ratio: number) => bezierByTime(controlPoints, ratio);
}

function bezierByTime(controlPoints: number[], ratio: number) {
  const percent = cardano(controlPoints, ratio);    // t
  // var p0y = 0;                // a
  // const p1y = controlPoints[1]; // b
  // const p2y = controlPoints[3]; // c
  // var p3y = 1;                // d
  const t1  = 1 - percent;
  return /* 0 * t1 * t1 * t1 + */ controlPoints[1] * 3 * percent * t1      * t1 +
         controlPoints[3] * 3 * percent * percent * t1 +
         /* 1 * */ percent * percent * percent;
}

export default class CocosAnimationRuntime {
  // called internally
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

  public filterAnimationContainer(rootContainer: PIXI.Container, vector: PIXI.Container[] = []): PIXI.Container[] {
    if (rootContainer.sgmed && rootContainer.sgmed.cocosAnimations) {
      vector.push(rootContainer);
    }

    for (let i = 0; i < rootContainer.children.length; i++) {
      this.filterAnimationContainer(rootContainer.children[i] as PIXI.Container, vector);
    }

    return vector;
  }

  public static getCurveFunction(curveType?: string | number[]): EaseFunction {
    if (!curveType) {
      return Easing.linear;
    }

    if (typeof curveType === 'string') {
      if (Easing.hasOwnProperty(curveType)) {
        return Easing[curveType] as EaseFunction;
      }

      return Easing.linear;
    }

    // custom curve
    return createBezierByTime(curveType) as EaseFunction;
  }
}
