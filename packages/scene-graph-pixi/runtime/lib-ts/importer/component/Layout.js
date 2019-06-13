var LayoutType;
(function (LayoutType) {
    LayoutType[LayoutType["NONE"] = 0] = "NONE";
    LayoutType[LayoutType["HORIZONTAL"] = 1] = "HORIZONTAL";
    LayoutType[LayoutType["VERTICAL"] = 2] = "VERTICAL";
    LayoutType[LayoutType["GRID"] = 3] = "GRID";
})(LayoutType || (LayoutType = {}));
var AxisDirection;
(function (AxisDirection) {
    AxisDirection[AxisDirection["HORIZONTAL"] = 0] = "HORIZONTAL";
    AxisDirection[AxisDirection["VERTICAL"] = 1] = "VERTICAL";
})(AxisDirection || (AxisDirection = {}));
var VerticalDirection;
(function (VerticalDirection) {
    VerticalDirection[VerticalDirection["BOTTOM_TO_TOP"] = 0] = "BOTTOM_TO_TOP";
    VerticalDirection[VerticalDirection["TOP_TO_BOTTOM"] = 1] = "TOP_TO_BOTTOM";
})(VerticalDirection || (VerticalDirection = {}));
var HorizontalDirection;
(function (HorizontalDirection) {
    HorizontalDirection[HorizontalDirection["LEFT_TO_RIGHT"] = 0] = "LEFT_TO_RIGHT";
    HorizontalDirection[HorizontalDirection["RIGHT_TO_LEFT"] = 1] = "RIGHT_TO_LEFT";
})(HorizontalDirection || (HorizontalDirection = {}));
// resize not supported.
// enum ResizeMode {
//   NONE = 0,
//   CONTAINER = 1,
//   CHILDREN = 2
// }
var LayoutComponent = /** @class */ (function () {
    function LayoutComponent() {
    }
    LayoutComponent.fixLayout = function (container, node) {
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
    };
    LayoutComponent.fixHorizontal = function (container, node) {
        var _this = this;
        if (!node || !node.layout || !node.transform) {
            return;
        }
        var baseWidth = node.transform.width || 0;
        if (baseWidth <= 0) {
            return;
        }
        var layout = node.layout;
        var offsetX = this.calcLayoutBasePointX(layout, baseWidth);
        container.children.forEach(function (child) {
            var childContainer = child;
            if (!childContainer || !childContainer.sgmed) {
                return;
            }
            var childWidth = childContainer.width * child.scale.x;
            var ancherX = childContainer.sgmed.anchor ? childContainer.sgmed.anchor.x : 0;
            child.position.x = _this.calcPositionX(layout, ancherX, childWidth, offsetX);
            offsetX = _this.calcOffsetX(layout, childWidth, offsetX);
        });
    };
    LayoutComponent.fixVertical = function (container, node) {
        var _this = this;
        if (!node || !node.layout || !node.transform) {
            return;
        }
        var baseHeight = node.transform.height || 0;
        if (baseHeight <= 0) {
            return;
        }
        var layout = node.layout;
        var offsetY = this.calcLayoutBasePointY(layout, baseHeight);
        container.children.forEach(function (child) {
            var childContainer = child;
            if (!childContainer || !childContainer.sgmed) {
                return;
            }
            var childHeight = childContainer.height * child.scale.y;
            var ancherY = childContainer.sgmed.anchor ? childContainer.sgmed.anchor.y : 0;
            child.position.y = _this.calcPositionY(layout, ancherY, childHeight, offsetY);
            offsetY = _this.calcOffsetY(layout, childHeight, offsetY);
        });
    };
    LayoutComponent.fixGrid = function (container, node) {
        var _this = this;
        if (!node || !node.layout || !node.transform) {
            return;
        }
        var baseWidth = node.transform.width || 0;
        var baseHeight = node.transform.height || 0;
        if (baseWidth <= 0 || baseHeight <= 0) {
            return;
        }
        var layout = node.layout;
        var basePointX = this.calcLayoutBasePointX(layout, baseWidth);
        var basePointY = this.calcLayoutBasePointY(layout, baseHeight);
        var horizontalPadding = (layout.paddingLeft || 0) + (layout.paddingRight || 0);
        var verticalPadding = (layout.paddingBottom || 0) + (layout.paddingTop || 0);
        var offsetX = basePointX;
        var offsetY = basePointY;
        container.children.forEach(function (child) {
            var childContainer = child;
            if (!childContainer || !childContainer.sgmed) {
                return;
            }
            var childWidth = Math.abs(childContainer.width * child.scale.x);
            var childHeight = Math.abs(childContainer.height * child.scale.y);
            var maxSize = 0;
            if (layout.startAxis === AxisDirection.HORIZONTAL) {
                maxSize = Math.max(maxSize, childHeight, 0);
                var rowSize = Math.abs(offsetX - basePointX) + childWidth + horizontalPadding;
                if (baseWidth <= rowSize) {
                    // wrap
                    if (layout.verticalDirection === VerticalDirection.BOTTOM_TO_TOP) {
                        offsetY -= maxSize + (layout.spacingY || 0);
                    }
                    else {
                        offsetY += maxSize + (layout.spacingY || 0);
                    }
                    offsetX = basePointX;
                    maxSize = 0;
                }
                var ancherX = childContainer.sgmed.anchor ? childContainer.sgmed.anchor.x : 0;
                var ancherY = childContainer.sgmed.anchor ? childContainer.sgmed.anchor.y : 0;
                child.position.x = _this.calcPositionX(layout, ancherX, childWidth, offsetX);
                child.position.y = _this.calcPositionY(layout, ancherY, childHeight, offsetY);
                offsetX = _this.calcOffsetX(layout, childWidth, offsetX);
            }
            else {
                maxSize = Math.max(maxSize, childWidth, 0);
                var columnSize = Math.abs(offsetY - basePointY) + childHeight + verticalPadding;
                if (baseHeight <= columnSize) {
                    // wrap
                    if (layout.horizontalDirection === HorizontalDirection.LEFT_TO_RIGHT) {
                        offsetX += maxSize + (layout.spacingX || 0);
                    }
                    else {
                        offsetX -= maxSize + (layout.spacingX || 0);
                    }
                    offsetY = basePointY;
                    maxSize = 0;
                }
                var ancherX = childContainer.sgmed.anchor ? childContainer.sgmed.anchor.x : 0;
                var ancherY = childContainer.sgmed.anchor ? childContainer.sgmed.anchor.y : 0;
                child.position.x = _this.calcPositionX(layout, ancherX, childWidth, offsetX);
                child.position.y = _this.calcPositionY(layout, ancherY, childHeight, offsetY);
                offsetY = _this.calcOffsetY(layout, childHeight, offsetY);
            }
        });
    };
    LayoutComponent.calcLayoutBasePointX = function (layout, baseWidth) {
        if (layout.horizontalDirection === HorizontalDirection.LEFT_TO_RIGHT) {
            return layout.paddingLeft || 0;
        }
        return baseWidth + (layout.paddingRight || 0);
    };
    LayoutComponent.calcLayoutBasePointY = function (layout, baseHeight) {
        if (layout.verticalDirection === VerticalDirection.BOTTOM_TO_TOP) {
            return baseHeight + (layout.paddingBottom || 0);
        }
        return layout.paddingTop || 0;
    };
    LayoutComponent.calcPositionX = function (layout, anchorX, width, offsetX) {
        if (layout.horizontalDirection === HorizontalDirection.LEFT_TO_RIGHT) {
            return offsetX + anchorX * width;
        }
        return offsetX - (1 - anchorX) * width;
    };
    LayoutComponent.calcPositionY = function (layout, anchorY, height, offsetY) {
        if (layout.verticalDirection === VerticalDirection.BOTTOM_TO_TOP) {
            return offsetY - (1 - anchorY) * height;
        }
        return offsetY + anchorY * height;
    };
    LayoutComponent.calcOffsetX = function (layout, width, currentOffsetX) {
        if (layout.horizontalDirection === HorizontalDirection.LEFT_TO_RIGHT) {
            return currentOffsetX + width + (layout.spacingX || 0);
        }
        return currentOffsetX - (width + (layout.spacingX || 0));
    };
    LayoutComponent.calcOffsetY = function (layout, height, currentOffsetY) {
        if (layout.verticalDirection === VerticalDirection.BOTTOM_TO_TOP) {
            return currentOffsetY - (height + (layout.spacingY || 0));
        }
        return currentOffsetY + height + (layout.spacingY || 0);
    };
    return LayoutComponent;
}());
export { LayoutComponent };
//# sourceMappingURL=Layout.js.map