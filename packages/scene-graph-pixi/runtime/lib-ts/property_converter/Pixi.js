var DEGREE_TO_RADIAN = Math.PI / 180;
export var Pixi = {
    createConvertedObject: function (schema, transform) {
        var coordVector = {
            x: (schema.metadata.positiveCoord.xRight ? 1 : -1),
            y: (schema.metadata.positiveCoord.yDown ? 1 : -1)
        };
        return {
            // convert coordinate system
            position: {
                x: transform.x * coordVector.x,
                y: transform.y * coordVector.y
            },
            // default scale is 1/1
            scale: (transform.scale) ? {
                x: transform.scale.x,
                y: transform.scale.y
            } : { x: 1, y: 1 },
            // scene-graph-mediator extended properties
            anchor: {
                // TODO: magic
                x: (coordVector.x === 1) ? transform.anchor.x : 0.5 - (transform.anchor.x - 0.5),
                y: (coordVector.y === 1) ? transform.anchor.y : 0.5 - (transform.anchor.y - 0.5)
            },
            // pixi rotation is presented in radian
            rotation: (transform.rotation) ? transform.rotation * DEGREE_TO_RADIAN : 0
        };
    },
    fixCoordinate: function (schema, convertedObject, node) {
        var transform = node.transform;
        if (!transform) {
            return;
        }
        if (!transform.parent) {
            var sceneBasePoint = {
                x: schema.metadata.positiveCoord.xRight ? 0 : schema.metadata.width,
                y: schema.metadata.positiveCoord.yDown ? 0 : schema.metadata.height
            };
            convertedObject.position.x += sceneBasePoint.x;
            convertedObject.position.y += sceneBasePoint.y;
        }
        else if (node.sprite && node.sprite.slice) {
            var scale = transform.scale || { x: 1, y: 1 };
            convertedObject.position.x -= (transform.width || 0) * scale.x * transform.anchor.x;
            convertedObject.position.y -= (transform.height || 0) * scale.y * transform.anchor.y;
        }
    },
    applyConvertedObject: function (target, convertedObject) {
        target.position.x = convertedObject.position.x;
        target.position.y = convertedObject.position.y;
        target.scale.x = convertedObject.scale.x;
        target.scale.y = convertedObject.scale.y;
        target.rotation = convertedObject.rotation;
        if (target.anchor) {
            target.anchor.x = convertedObject.anchor.x;
            target.anchor.y = convertedObject.anchor.y;
        }
    }
};
//# sourceMappingURL=Pixi.js.map