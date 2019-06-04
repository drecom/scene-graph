import { Transform } from '@drecom/scene-graph-schema';
import CocosCreator from './CocosCreator';
import * as cc from '../../interface/CocosCreator';
/**
 * CocosCreator v2.x scene exporter
 */
export default class CocosCreatorV2 extends CocosCreator {
    /**
     * Returns runtime identifier string.
     */
    getIdentifier(): string;
    /**
     * Returns object with Transform schema using Cocos Node data.
     */
    protected createDefaultTransform(component: cc.ComponentBase): Transform;
}
