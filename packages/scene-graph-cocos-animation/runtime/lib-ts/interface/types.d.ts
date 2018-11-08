/// <reference types="pixi.js" />
import { CocosAnimationClientTypes } from '@drecom/scene-graph-cocos-animation-cli';
import CocosAnimationRuntimeExtension from '../CocosAnimationRuntimeExtension';
declare namespace CocosAnimationRuntimeTypes {
    type EaseFunction = (ratio: number) => number;
    type CocosAnimation = CocosAnimationClientTypes.Animation & {
        runtime?: CocosAnimationRuntimeExtension;
    };
    type PropertyConversionInfo = {
        target: any;
        key: string;
        value: number;
    };
    type FrameParams = {
        target: PIXI.Container;
        animationProperty: string;
        currentValue: number | CocosAnimationClientTypes.AnimationFrameProperty;
        targetValue: number | CocosAnimationClientTypes.AnimationFrameProperty;
        timeRatio: number;
        curveFunc: EaseFunction;
    };
    type PrimitiveFrameParams = FrameParams & {
        currentValue: number;
        targetValue: number;
    };
    type ObjectFrameParams = FrameParams & {
        currentValue: CocosAnimationClientTypes.AnimationFrameProperty;
        targetValue: CocosAnimationClientTypes.AnimationFrameProperty;
    };
}
export default CocosAnimationRuntimeTypes;
