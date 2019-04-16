import { Container } from 'pixi.js';
import { Node } from '@drecom/scene-graph-schema';
export default class LayoutComponent {
    static fixLayout(container: Container, node: Node): void;
    private static fixHorizontal;
    private static fixVertical;
    private static fixGrid;
    private static calcLayoutBasePointX;
    private static calcLayoutBasePointY;
    private static calcPositionX;
    private static calcPositionY;
    private static calcOffsetX;
    private static calcOffsetY;
}
