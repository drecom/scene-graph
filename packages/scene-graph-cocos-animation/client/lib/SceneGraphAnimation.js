"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var SceneGraphAnimation = /** @class */ (function () {
    function SceneGraphAnimation() {
    }
    SceneGraphAnimation.prototype.extendSceneGraph = function (graph, dataSource, assetFileMap) {
        var animationFilesMap = this.collectAnimationFiles(assetFileMap);
        var animationComponents = this.collectAnimationNodes(dataSource);
        this.extendNodesWithAnimationComponent(animationFilesMap, animationComponents, graph);
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
    SceneGraphAnimation.prototype.extendNodesWithAnimationComponent = function (animationFilesMap, animationComponents, graph) {
        var nodeNameMap = new Map();
        for (var i = 0; i < graph.scene.length; i++) {
            var node = graph.scene[i];
            nodeNameMap.set(node.name, node);
        }
        for (var i = 0; i < graph.scene.length; i++) {
            var nodeRef = graph.scene[i];
            var componentRef = animationComponents.get(nodeRef.id);
            if (!componentRef)
                continue;
            for (var j = 0; j < componentRef._clips.length; j++) {
                var animationFiles = animationFilesMap.get(componentRef._clips[j].__uuid__);
                if (!animationFiles) {
                    continue;
                }
                var content = fs.readFileSync(animationFiles.anim).toString();
                var clipJson = JSON.parse(content);
                if (clipJson.curveData.props) {
                    var animation = {
                        duration: clipJson._duration,
                        sample: clipJson.sample,
                        speed: clipJson.speed,
                        url: animationFiles.anim,
                        curves: {}
                    };
                    var props = clipJson.curveData.props;
                    var propertyNames = Object.keys(props);
                    for (var k = 0; k < propertyNames.length; k++) {
                        var property = propertyNames[k];
                        animation.curves[property] = this.createAnimationFrames(props[property], property);
                    }
                    if (!nodeRef.animations) {
                        nodeRef.animations = [];
                    }
                    nodeRef.animations.push(animation);
                }
                if (clipJson.curveData.paths) {
                    var paths = clipJson.curveData.paths;
                    var nodePaths = Object.keys(paths);
                    for (var k = 0; k < nodePaths.length; k++) {
                        var nodePath = nodePaths[k];
                        var nodeName = nodePath.split('/').pop();
                        if (!nodeName)
                            continue;
                        var relativeNodeRef = nodeNameMap.get(nodeName);
                        if (!relativeNodeRef)
                            continue;
                        var animation = {
                            duration: clipJson._duration,
                            sample: clipJson.sample,
                            speed: clipJson.speed,
                            url: animationFiles.anim,
                            curves: {}
                        };
                        var props = paths[nodePath].props;
                        var propertyNames = Object.keys(props);
                        for (var l = 0; l < propertyNames.length; l++) {
                            var property = propertyNames[l];
                            animation.curves[property] = this.createAnimationFrames(props[property], property);
                        }
                        if (!relativeNodeRef.animations) {
                            relativeNodeRef.animations = [];
                        }
                        relativeNodeRef.animations.push(animation);
                    }
                }
            }
        }
    };
    SceneGraphAnimation.prototype.createAnimationFrames = function (frames, property) {
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
            else if (Array.isArray(frame.value)) {
                if (property === 'scale' || property === 'position') {
                    graphFrame.value.x = frame.value[0];
                    graphFrame.value.y = frame.value[1];
                }
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