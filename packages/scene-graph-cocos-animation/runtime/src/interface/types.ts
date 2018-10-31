import { CocosAnimationClientTypes } from '@drecom/scene-graph-cocos-animation-cli';
import CocosAnimationRuntimeExtension from '../CocosAnimationRuntimeExtension';

declare namespace CocosAnimationRuntimeTypes {
  type EaseFunction = (ratio: number) => number;

  type CocosAnimation = CocosAnimationClientTypes.Animation & {
    runtime?: CocosAnimationRuntimeExtension;
  };
}

export default CocosAnimationRuntimeTypes;
