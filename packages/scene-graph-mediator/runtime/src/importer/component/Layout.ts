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

export module LayoutComponent {
  export function fixLayout(container: Container, node: Node): void {
    if (!node || !node.layout) {
      return;
    }

    switch (node.layout.layoutType) {
      case LayoutType.HORIZONTAL: {
        fixHorizontal(container, node);
        break;
      }
      case LayoutType.VERTICAL: {
        fixVertical(container, node);
        break;
      }
      case LayoutType.GRID: {
        fixGrid(container, node);
        return;
      }

      default:
        return;
    }
  }

  function fixHorizontal(container: Container, node: Node): void {
    if (!node || !node.layout) {
      return;
    }

    const baseWidth:number = node.transform.width || 0;
    if (baseWidth <= 0) {
      return;
    }

    const layout:Layout = node.layout;
    let offsetX:number = calcLayoutBasePointX(layout, baseWidth);

    container.children.forEach((child) => {
      const sgmed = (child as Container).sgmed;
      if (!sgmed || !sgmed.anchor || !sgmed.originalSize) {
        return;
      }

      const childWidth = sgmed.originalSize.width * child.scale.x;
      child.position.x = calcPositionX(layout, sgmed.anchor.x, childWidth, offsetX);
      offsetX = calcOffsetX(layout, childWidth, offsetX);
    });
  }

  function fixVertical(container: Container, node: Node): void {
    if (!node || !node.layout) {
      return;
    }

    const baseHeight:number = node.transform.height || 0;
    if (baseHeight <= 0) {
      return;
    }

    const layout:Layout = node.layout;
    let offsetY:number = calcLayoutBasePointY(layout, baseHeight);

    container.children.forEach((child) => {
      const sgmed = (child as Container).sgmed;
      if (!sgmed || !sgmed.anchor || !sgmed.originalSize) {
        return;
      }

      const childHeight = sgmed.originalSize.height * child.scale.y;
      child.position.y = calcPositionY(layout, sgmed.anchor.y, childHeight, offsetY);
      offsetY = calcOffsetY(layout, childHeight, offsetY);
    });
  }

  function fixGrid(container: Container, node: Node): void {
    if (!node || !node.layout) {
      return;
    }

    const baseWidth:number = node.transform.width || 0;
    const baseHeight:number = node.transform.height || 0;
    if (baseWidth <= 0 || baseHeight <= 0) {
      return;
    }

    const layout:Layout = node.layout;
    const basePointX: number = calcLayoutBasePointX(layout, baseWidth);
    const basePointY: number = calcLayoutBasePointY(layout, baseHeight);
    const horizontalPadding: number = (layout.paddingLeft || 0) + (layout.paddingRight || 0);
    const verticalPadding: number = (layout.paddingBottom || 0) + (layout.paddingTop || 0);

    let offsetX:number = basePointX;
    let offsetY:number = basePointY;
    container.children.forEach((child) => {
      const sgmed = (child as Container).sgmed;
      if (!sgmed || !sgmed.anchor || !sgmed.originalSize) {
        return;
      }

      const childWidth = Math.abs(sgmed.originalSize.width * child.scale.x);
      const childHeight = Math.abs(sgmed.originalSize.height * child.scale.y);
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

        child.position.x = calcPositionX(layout, sgmed.anchor.x, childWidth, offsetX);
        child.position.y = calcPositionY(layout, sgmed.anchor.y, childHeight, offsetY);
        offsetX = calcOffsetX(layout, childWidth, offsetX);

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

        child.position.x = calcPositionX(layout, sgmed.anchor.x, childWidth, offsetX);
        child.position.y = calcPositionY(layout, sgmed.anchor.y, childHeight, offsetY);
        offsetY = calcOffsetY(layout, childHeight, offsetY);
      }
    });
  }

  function calcLayoutBasePointX(layout:Layout, baseWidth:number): number {
    if (layout.horizontalDirection === HorizontalDirection.LEFT_TO_RIGHT) {
      return layout.paddingLeft || 0;
    }
    return baseWidth + (layout.paddingRight || 0);
  }

  function calcLayoutBasePointY(layout:Layout, baseHeight:number): number {
    if (layout.verticalDirection === VerticalDirection.BOTTOM_TO_TOP) {
      return baseHeight + (layout.paddingBottom || 0);
    }
    return layout.paddingTop || 0;
  }

  function calcPositionX(layout:Layout, anchorX:number, width:number, offsetX:number) {
    if (layout.horizontalDirection === HorizontalDirection.LEFT_TO_RIGHT) {
      return offsetX + anchorX * width;
    }
    return offsetX - (1 - anchorX) * width;

  }

  function calcPositionY(layout:Layout, anchorY:number, height:number, offsetY:number):number {
    if (layout.verticalDirection === VerticalDirection.BOTTOM_TO_TOP) {
      return offsetY - (1 - anchorY) * height;
    }
    return offsetY + anchorY * height;
  }

  function calcOffsetX(layout:Layout, width:number, currentOffsetX:number):number {
    if (layout.horizontalDirection === HorizontalDirection.LEFT_TO_RIGHT) {
      return currentOffsetX + width + (layout.spacingX || 0);
    }
    return currentOffsetX - (width + (layout.spacingX || 0));
  }

  function calcOffsetY(layout:Layout, height:number, currentOffsetY:number):number {
    if (layout.verticalDirection === VerticalDirection.BOTTOM_TO_TOP) {
      return currentOffsetY - (height + (layout.spacingY || 0));
    }
    return currentOffsetY + height + (layout.spacingY || 0);
  }
}
