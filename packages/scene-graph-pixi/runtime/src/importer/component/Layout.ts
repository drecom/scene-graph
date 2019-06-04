import { Container } from 'pixi.js';
import { Layout, Node } from '@drecom/scene-graph-schema';

enum LayoutType {
  NONE = 0,
  HORIZONTAL = 1,
  VERTICAL = 2,
  GRID = 3
}

enum AxisDirection {
  HORIZONTAL = 0,
  VERTICAL = 1
}

enum VerticalDirection {
  BOTTOM_TO_TOP = 0,
  TOP_TO_BOTTOM = 1
}

enum HorizontalDirection {
  LEFT_TO_RIGHT = 0,
  RIGHT_TO_LEFT = 1
}

// resize not supported.
// enum ResizeMode {
//   NONE = 0,
//   CONTAINER = 1,
//   CHILDREN = 2
// }

export class LayoutComponent {
  public static fixLayout(container: Container, node: Node): void {
    if (!node || !node.layout) {
      return;
    }

    switch (node.layout.layoutType) {
      case LayoutType.HORIZONTAL: {
        this.fixHorizontal(container, node);
        break;
      }
      case LayoutType.VERTICAL: {
        this.fixVertical(container, node);
        break;
      }
      case LayoutType.GRID: {
        this.fixGrid(container, node);
        return;
      }

      default:
        return;
    }
  }

  private static fixHorizontal(container: Container, node: Node): void {
    if (!node || !node.layout || !node.transform) {
      return;
    }

    const baseWidth:number = node.transform.width || 0;
    if (baseWidth <= 0) {
      return;
    }

    const layout:Layout = node.layout;
    let offsetX:number = this.calcLayoutBasePointX(layout, baseWidth);

    container.children.forEach((child) => {
      const childContainer = child as Container;
      if (!childContainer || !childContainer.sgmed) {
        return;
      }

      const childWidth = childContainer.width * child.scale.x;
      const ancherX = childContainer.sgmed.anchor ? childContainer.sgmed.anchor.x : 0;
      child.position.x = this.calcPositionX(layout, ancherX, childWidth, offsetX);
      offsetX = this.calcOffsetX(layout, childWidth, offsetX);
    });
  }

  private static fixVertical(container: Container, node: Node): void {
    if (!node || !node.layout || !node.transform) {
      return;
    }

    const baseHeight:number = node.transform.height || 0;
    if (baseHeight <= 0) {
      return;
    }

    const layout:Layout = node.layout;
    let offsetY:number = this.calcLayoutBasePointY(layout, baseHeight);

    container.children.forEach((child) => {
      const childContainer = child as Container;
      if (!childContainer || !childContainer.sgmed) {
        return;
      }

      const childHeight = childContainer.height * child.scale.y;
      const ancherY = childContainer.sgmed.anchor ? childContainer.sgmed.anchor.y : 0;
      child.position.y = this.calcPositionY(layout, ancherY, childHeight, offsetY);
      offsetY = this.calcOffsetY(layout, childHeight, offsetY);
    });
  }

  private static fixGrid(container: Container, node: Node): void {
    if (!node || !node.layout || !node.transform) {
      return;
    }

    const baseWidth:number = node.transform.width || 0;
    const baseHeight:number = node.transform.height || 0;
    if (baseWidth <= 0 || baseHeight <= 0) {
      return;
    }

    const layout:Layout = node.layout;
    const basePointX: number = this.calcLayoutBasePointX(layout, baseWidth);
    const basePointY: number = this.calcLayoutBasePointY(layout, baseHeight);
    const horizontalPadding: number = (layout.paddingLeft || 0) + (layout.paddingRight || 0);
    const verticalPadding: number = (layout.paddingBottom || 0) + (layout.paddingTop || 0);

    let offsetX:number = basePointX;
    let offsetY:number = basePointY;
    container.children.forEach((child) => {
      const childContainer = child as Container;
      if (!childContainer || !childContainer.sgmed) {
        return;
      }

      const childWidth = Math.abs(childContainer.width * child.scale.x);
      const childHeight = Math.abs(childContainer.height * child.scale.y);
      let maxSize: number = 0;

      if (layout.startAxis === AxisDirection.HORIZONTAL) {
        maxSize = Math.max(maxSize, childHeight, 0);
        const rowSize = Math.abs(offsetX - basePointX) + childWidth + horizontalPadding;
        if (baseWidth <= rowSize) {
          // wrap
          if (layout.verticalDirection === VerticalDirection.BOTTOM_TO_TOP) {
            offsetY -= maxSize + (layout.spacingY || 0);
          } else {
            offsetY += maxSize + (layout.spacingY || 0);
          }
          offsetX = basePointX;
          maxSize = 0;
        }

        const ancherX = childContainer.sgmed.anchor ? childContainer.sgmed.anchor.x : 0;
        const ancherY = childContainer.sgmed.anchor ? childContainer.sgmed.anchor.y : 0;
        child.position.x = this.calcPositionX(layout, ancherX, childWidth, offsetX);
        child.position.y = this.calcPositionY(layout, ancherY, childHeight, offsetY);
        offsetX = this.calcOffsetX(layout, childWidth, offsetX);

      } else {
        maxSize = Math.max(maxSize, childWidth, 0);
        const columnSize = Math.abs(offsetY - basePointY) + childHeight + verticalPadding;
        if (baseHeight <= columnSize) {
          // wrap
          if (layout.horizontalDirection === HorizontalDirection.LEFT_TO_RIGHT) {
            offsetX += maxSize + (layout.spacingX || 0);
          } else {
            offsetX -= maxSize + (layout.spacingX || 0);
          }
          offsetY = basePointY;
          maxSize = 0;
        }

        const ancherX = childContainer.sgmed.anchor ? childContainer.sgmed.anchor.x : 0;
        const ancherY = childContainer.sgmed.anchor ? childContainer.sgmed.anchor.y : 0;
        child.position.x = this.calcPositionX(layout, ancherX, childWidth, offsetX);
        child.position.y = this.calcPositionY(layout, ancherY, childHeight, offsetY);
        offsetY = this.calcOffsetY(layout, childHeight, offsetY);
      }
    });
  }

  private static calcLayoutBasePointX(layout:Layout, baseWidth:number): number {
    if (layout.horizontalDirection === HorizontalDirection.LEFT_TO_RIGHT) {
      return layout.paddingLeft || 0;
    }
    return baseWidth + (layout.paddingRight || 0);
  }

  private static calcLayoutBasePointY(layout:Layout, baseHeight:number): number {
    if (layout.verticalDirection === VerticalDirection.BOTTOM_TO_TOP) {
      return baseHeight + (layout.paddingBottom || 0);
    }
    return layout.paddingTop || 0;
  }

  private static calcPositionX(layout:Layout, anchorX:number, width:number, offsetX:number) {
    if (layout.horizontalDirection === HorizontalDirection.LEFT_TO_RIGHT) {
      return offsetX + anchorX * width;
    }
    return offsetX - (1 - anchorX) * width;

  }

  private static calcPositionY(
    layout:Layout,
    anchorY:number,
    height:number,
    offsetY:number
  ):number {
    if (layout.verticalDirection === VerticalDirection.BOTTOM_TO_TOP) {
      return offsetY - (1 - anchorY) * height;
    }
    return offsetY + anchorY * height;
  }

  private static calcOffsetX(layout:Layout, width:number, currentOffsetX:number):number {
    if (layout.horizontalDirection === HorizontalDirection.LEFT_TO_RIGHT) {
      return currentOffsetX + width + (layout.spacingX || 0);
    }
    return currentOffsetX - (width + (layout.spacingX || 0));
  }

  private static calcOffsetY(layout:Layout, height:number, currentOffsetY:number):number {
    if (layout.verticalDirection === VerticalDirection.BOTTOM_TO_TOP) {
      return currentOffsetY - (height + (layout.spacingY || 0));
    }
    return currentOffsetY + height + (layout.spacingY || 0);
  }
}
