"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var cc = require("../../interface/CocosCreator");
var AssetFileMap_1 = require("../../asset/AssetFileMap");
/**
 * Cocos Creator resource type
 */
var ResourceType = Object.freeze({
    NOT_RESOURCE: 'NotResource',
    SPRITE_FRAME: 'SpriteFrame',
    ATLAS: 'Atlas',
});
/**
 * CocosCreator V1.x scene exporter
 */
var CocosCreator = /** @class */ (function () {
    function CocosCreator() {
    }
    /**
     * Returns runtime identifier string.
     */
    CocosCreator.prototype.getIdentifier = function () {
        return 'cocoscreator';
    };
    /**
     * export scene graph
     */
    CocosCreator.prototype.createSceneGraphSchemas = function (sceneFiles, assetRoot, plugins) {
        var graphs = new Map();
        var _loop_1 = function (i) {
            var sceneFile = sceneFiles[i];
            var sceneJson = this_1.loadSceneFile(sceneFile);
            var assetFileMap = new AssetFileMap_1.default(assetRoot);
            assetFileMap.scan();
            var resourceMap = this_1.createLocalResourceMap(assetFileMap);
            var graph = this_1.createSceneGraph(sceneJson);
            this_1.appendComponents(sceneJson, graph, resourceMap);
            if (!plugins)
                return "continue";
            plugins.forEach(function (plugin) {
                plugin.extendSceneGraph(graph, sceneJson, assetFileMap);
            });
            graphs.set(sceneFile, graph);
        };
        var this_1 = this;
        for (var i = 0; i < sceneFiles.length; i++) {
            _loop_1(i);
        }
        return graphs;
    };
    /**
     * Read scene file using file system and convert to javascript object.
     */
    CocosCreator.prototype.loadSceneFile = function (sceneFile) {
        var content = fs.readFileSync(sceneFile).toString();
        return JSON.parse(content);
    };
    /**
     * Create scene graph with scene file dto and collected resource map
     */
    CocosCreator.prototype.createSceneGraph = function (json) {
        var graph = {
            scene: [],
            metadata: {
                width: 0,
                height: 0,
                positiveCoord: {
                    xRight: true,
                    yDown: false
                },
                baseCoordinate: {
                    x: 'center',
                    y: 'center'
                },
                format: this.getIdentifier()
            }
        };
        this.appendMetaData(json, graph);
        this.appendNodes(json, graph);
        return graph;
    };
    /**
     * Execute plugin post process
     */
    CocosCreator.prototype.pluginPostProcess = function (graph, sceneJson, assetFileMap, plugins) {
        if (!plugins) {
            return;
        }
        plugins.forEach(function (plugin) {
            plugin.extendSceneGraph(graph, sceneJson, assetFileMap);
        });
    };
    /**
     * Created supported resource map
     */
    CocosCreator.prototype.createLocalResourceMap = function (assetFileMap) {
        var _this = this;
        var resourceMap = new Map();
        assetFileMap.forEach(function (item) {
            var entities = _this.createResourceMapEntities(item.filePath);
            entities.forEach(function (entity) { return resourceMap.set(entity.id, entity); });
        });
        return resourceMap;
    };
    /**
     * Create array of RespirceMapEntity
     */
    CocosCreator.prototype.createResourceMapEntities = function (absPath) {
        var entities = [];
        var meta = absPath + ".meta";
        if (!fs.existsSync(meta)) {
            return entities;
        }
        var json;
        var content = fs.readFileSync(meta).toString();
        try {
            json = JSON.parse(content);
        }
        catch (e) {
            return entities;
        }
        var entity = {
            id: json.uuid,
            path: absPath,
            metaPath: meta,
            type: ResourceType.NOT_RESOURCE
        };
        var ext = absPath.split('.').pop();
        if (ext) {
            switch (ext.toLowerCase()) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                    entity.type = ResourceType.SPRITE_FRAME;
                    break;
                case 'plist':
                    entity.type = ResourceType.ATLAS;
                    break;
                default:
                    entity.type = ResourceType.NOT_RESOURCE;
                    break;
            }
        }
        // add submetas if exists
        switch (entity.type) {
            case ResourceType.SPRITE_FRAME:
            case ResourceType.ATLAS: {
                var submetas = json.subMetas;
                entity.submetas = submetas;
                var keys = Object.keys(submetas);
                for (var i = 0; i < keys.length; i++) {
                    var submeta = submetas[keys[i]];
                    entities.push({
                        id: submeta.uuid,
                        path: absPath,
                        metaPath: meta,
                        type: entity.type,
                        submetas: submeta.subMetas
                    });
                }
                break;
            }
        }
        entities.push(entity);
        return entities;
    };
    /**
     * Add node to SchemaJson.scene.<br />
     * Convert transform to SchemaJson schema.
     */
    CocosCreator.prototype.appendNodes = function (json, graph) {
        var _this = this;
        var canvas = this.findComponentByType(json, cc.MetaTypes.CANVAS);
        // collect nodes identified by id, scene file terats index as node id
        var nodes = new Map();
        for (var i = 0; i < json.length; i++) {
            var component = json[i];
            if (component.__type__ === cc.MetaTypes.NODE) {
                nodes.set(i, component);
            }
        }
        nodes.forEach(function (value, i) {
            var node = value;
            if (node.__type__ === cc.MetaTypes.NODE && !node._position) {
                return;
            }
            var parentId = null;
            var isRoot = false;
            var isCanvas = (i === canvas.node.__id__);
            // CocosCreator's Scene has Canvas as root children
            if (node._parent) {
                parentId = node._parent.__id__;
                if (json[parentId].__type__ === cc.MetaTypes.SCENE) {
                    isRoot = true;
                }
            }
            var transform = _this.createDefaultTransform(node);
            if (node.__type__ !== cc.MetaTypes.NODE || isCanvas) {
                transform.x = 0;
                transform.y = 0;
            }
            if (node._rotationX !== node._rotationY) {
                transform.rotation = 0;
            }
            if (!isRoot && parentId) {
                transform.parent = parentId.toString();
            }
            var schemaNode = {
                id: i.toString(),
                name: node._name,
                constructorName: node.__type__,
                transform: transform,
                renderer: {
                    color: {
                        r: node._color.r,
                        g: node._color.g,
                        b: node._color.b,
                        // cocos's bug? _color.a is not used
                        a: node._opacity
                    }
                }
            };
            schemaNode.transform.children = [];
            // detect children and push
            var children = node._children;
            for (var j = 0; j < children.length; j++) {
                schemaNode.transform.children.push(children[j].__id__.toString());
            }
            graph.scene.push(schemaNode);
        });
    };
    /**
     * Returns object with Transform schema using Cocos Node data.
     */
    CocosCreator.prototype.createDefaultTransform = function (component) {
        var node = component;
        return {
            width: node._contentSize.width,
            height: node._contentSize.height,
            x: node._position.x,
            y: node._position.y,
            rotation: node._rotationX,
            scale: {
                x: node._scaleX,
                y: node._scaleY
            },
            anchor: {
                x: node._anchorPoint.x,
                y: node._anchorPoint.y
            }
        };
    };
    /**
     * Append metadata to scene graph data
     */
    CocosCreator.prototype.appendMetaData = function (json, graph) {
        var component = this.findComponentByType(json, cc.MetaTypes.CANVAS);
        if (!component) {
            return;
        }
        graph.metadata.width = component._designResolution.width;
        graph.metadata.height = component._designResolution.height;
        var node = json[component.node.__id__];
        graph.metadata.anchor = {
            x: node._anchorPoint.x,
            y: node._anchorPoint.y
        };
        // cocos's coordinate system has zero-zero coordinate on left bottom.
        graph.metadata.positiveCoord = {
            xRight: true,
            yDown: false
        };
    };
    /**
     * Append supported components to scene graph node
     */
    CocosCreator.prototype.appendComponents = function (json, graph, resourceMap) {
        for (var i = 0; i < json.length; i++) {
            var component = json[i];
            if (!component.node) {
                continue;
            }
            var schemaNode = this.findSchemaNodeById(graph, component.node.__id__.toString());
            if (!schemaNode) {
                continue;
            }
            this.appendComponentByType(schemaNode, component, resourceMap);
        }
    };
    /**
     * Detect and append supported component to scene graph node
     */
    CocosCreator.prototype.appendComponentByType = function (schemaNode, component, resourceMap) {
        switch (component.__type__) {
            case cc.MetaTypes.SPRITE: {
                var spriteFrameUuid = component._spriteFrame;
                if (!spriteFrameUuid) {
                    break;
                }
                var spriteFrameEntity = resourceMap.get(spriteFrameUuid.__uuid__);
                if (!spriteFrameEntity) {
                    break;
                }
                var submeta = null;
                var atlasUuid = component._atlas;
                // _spriteFrame may directs sprite that may contain atlas path
                if (atlasUuid) {
                    var atlasEntity = resourceMap.get(atlasUuid.__uuid__);
                    if (!atlasEntity) {
                        break;
                    }
                    // TODO: shouldn't read file
                    var atlasMetaContent = fs.readFileSync(atlasEntity.metaPath);
                    var atlasMetaJson = JSON.parse(atlasMetaContent.toString());
                    var frameName = null;
                    var keys = Object.keys(atlasMetaJson.subMetas);
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        if (atlasMetaJson.subMetas[key].uuid === spriteFrameUuid.__uuid__) {
                            frameName = key;
                            submeta = atlasMetaJson.subMetas[key];
                            break;
                        }
                    }
                    if (!frameName) {
                        break;
                    }
                    // path to sprite
                    var rawTextureEntity = resourceMap.get(submeta.rawTextureUuid);
                    if (!rawTextureEntity) {
                        break;
                    }
                    schemaNode.sprite = {
                        frameName: frameName,
                        url: rawTextureEntity.path,
                        atlasUrl: atlasEntity.path
                    };
                }
                else {
                    // TODO: shouldn't read file
                    var spriteFrameMetaContent = fs.readFileSync(spriteFrameEntity.metaPath);
                    var spriteFrameMetaJson = JSON.parse(spriteFrameMetaContent.toString());
                    var keys = Object.keys(spriteFrameMetaJson.subMetas);
                    if (keys.length === 0) {
                        break;
                    }
                    var frameName = keys[0];
                    submeta = spriteFrameMetaJson.subMetas[frameName];
                    schemaNode.sprite = {
                        frameName: frameName,
                        url: spriteFrameEntity.path
                    };
                }
                if (submeta && (submeta.borderTop !== 0 ||
                    submeta.borderBottom !== 0 ||
                    submeta.borderLeft !== 0 ||
                    submeta.borderRight !== 0)) {
                    schemaNode.sprite.slice = {
                        top: submeta.borderTop,
                        bottom: submeta.borderBottom,
                        left: submeta.borderLeft,
                        right: submeta.borderRight
                    };
                }
                break;
            }
            case cc.MetaTypes.LABEL: {
                schemaNode.text = {
                    text: component._N$string,
                    style: {
                        size: component._fontSize,
                        horizontalAlign: component._N$horizontalAlign
                    }
                };
                // TODO: alpha
                var colorStr = '#FFFFFF';
                if (schemaNode.renderer && schemaNode.renderer.color) {
                    // Label uses node color
                    var color = schemaNode.renderer.color;
                    colorStr = "#" + color.r.toString(16) + color.g.toString(16) + color.b.toString(16);
                }
                schemaNode.text.style.color = colorStr;
                break;
            }
            default: break;
        }
    };
    /**
     * Find and return component data if node has target component
     */
    CocosCreator.prototype.findComponentByType = function (json, type) {
        for (var i = 0; i < json.length; i++) {
            var component = json[i];
            if (component.__type__ === type) {
                return component;
            }
        }
        return null;
    };
    /**
     * Find node in scene grapph by id
     */
    CocosCreator.prototype.findSchemaNodeById = function (graph, id) {
        var scene = graph.scene;
        for (var i = 0; i < scene.length; i++) {
            var element = scene[i];
            if (element.id === id) {
                return element;
            }
        }
        return null;
    };
    return CocosCreator;
}());
exports.default = CocosCreator;
//# sourceMappingURL=CocosCreator.js.map