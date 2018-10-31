"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var SceneGraphAnimation = /** @class */ (function () {
    function SceneGraphAnimation() {
    }
    SceneGraphAnimation.prototype.extendSceneGraph = function (graph, dataSource, assetFileMap) {
        var animationFilesMap = this.collectAnimationFiles(assetFileMap);
        var animationComponents = this.collectAnimationNodes(dataSource);
        for (var i = 0; i < graph.scene.length; i++) {
            var node = graph.scene[i];
            ;
            var component = animationComponents.get(node.id);
            if (!component)
                continue;
            this.extendNodeWithAnimationComponent(animationFilesMap, node, component);
        }
    };
    SceneGraphAnimation.prototype.replaceExtendedPaths = function (sceneGraphMap, exportMap) {
        sceneGraphMap.forEach(function (graph) {
            for (var i = 0; i < graph.scene.length; i++) {
                var node = graph.scene[i];
                if (!node.animations)
                    continue;
                for (var j = 0; j < node.animations.length; j++) {
                    var animation = node.animations[j];
                    var entity = exportMap.get(animation.url);
                    if (entity) {
                        animation.url = entity.url;
                    }
                }
            }
        });
    };
    SceneGraphAnimation.prototype.getExportMapExtendPaths = function (node) {
        var paths = [];
        if (node.animations) {
            for (var i = 0; i < node.animations.length; i++) {
                paths.push(node.animations[i].url);
            }
        }
        return paths;
    };
    SceneGraphAnimation.prototype.collectAnimationFiles = function (assetFileMap) {
        var animationFilesMap = new Map();
        // retrieve animation files
        var pattern = new RegExp("\\." + SceneGraphAnimation.AnimationFileExt + "$");
        assetFileMap.forEach(function (entity) {
            var absPath = entity.filePath;
            if (!pattern.test(absPath))
                return;
            var metaPath = absPath + "." + SceneGraphAnimation.MetaFileExt;
            if (!fs.existsSync(metaPath))
                return;
            var content = fs.readFileSync(metaPath).toString();
            var meta = JSON.parse(content);
            animationFilesMap.set(meta.uuid, {
                anim: absPath,
                meta: metaPath
            });
        });
        return animationFilesMap;
    };
    SceneGraphAnimation.prototype.collectAnimationNodes = function (dataSource) {
        var animationComponents = new Map();
        for (var i = 0; i < dataSource.length; i++) {
            var fireNode = dataSource[i];
            if (!fireNode.__type__)
                continue;
            if (fireNode.__type__ === 'cc.Animation') {
                // set relation with parent node id
                animationComponents.set("" + fireNode.node.__id__, fireNode);
            }
        }
        return animationComponents;
    };
    SceneGraphAnimation.prototype.extendNodeWithAnimationComponent = function (animationFilesMap, nodeRef, componentRef) {
        nodeRef.animations = [];
        for (var i = 0; i < componentRef._clips.length; i++) {
            var animationFiles = animationFilesMap.get(componentRef._clips[i].__uuid__);
            if (!animationFiles) {
                continue;
            }
            var content = fs.readFileSync(animationFiles.anim).toString();
            var clipJson = JSON.parse(content);
            var animation = {
                sample: clipJson.sample,
                speed: clipJson.speed,
                url: animationFiles.anim,
                curves: {}
            };
            var properties = Object.keys(clipJson.curveData.props);
            for (var j = 0; j < properties.length; j++) {
                var property = properties[j];
                animation.curves[property] = this.createAnimationFrames(clipJson.curveData.props[property]);
            }
            nodeRef.animations.push(animation);
        }
    };
    SceneGraphAnimation.prototype.createAnimationFrames = function (frames) {
        var curveData = {
            keyFrames: []
        };
        for (var i = 0; i < frames.length; i++) {
            var frame = frames[i];
            var graphFrame = {
                frame: frame.frame,
                value: {}
            };
            if (frame.curve) {
                graphFrame.curve = frame.curve;
            }
            if (typeof frame.value === 'number') {
                graphFrame.value = frame.value;
            }
            else {
                var keys = Object.keys(frame.value);
                for (var j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    if (key === '__type__')
                        continue;
                    graphFrame.value[key] = frame.value[key];
                }
            }
            curveData.keyFrames.push(graphFrame);
        }
        return curveData;
    };
    SceneGraphAnimation.AnimationFileExt = 'anim';
    SceneGraphAnimation.MetaFileExt = 'meta';
    return SceneGraphAnimation;
}());
exports.default = SceneGraphAnimation;
//# sourceMappingURL=SceneGraphAnimation.js.map