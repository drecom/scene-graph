"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var cc = require("../../interface/CocosCreator");
var scene_graph_mediator_cli_1 = require("@drecom/scene-graph-mediator-cli");
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
var DefaultSceneExporter = /** @class */ (function () {
    function DefaultSceneExporter() {
    }
    /**
     * Returns runtime identifier string.
     */
    DefaultSceneExporter.prototype.getIdentifier = function () {
        return 'cocoscreator';
    };
    /**
     * export scene graph
     */
    DefaultSceneExporter.prototype.createSceneGraphSchemas = function (sceneFiles, assetRoot, plugins) {
        var graphs = new Map();
        var assetFileMap = new scene_graph_mediator_cli_1.sgmed.AssetFileMap(assetRoot);
        assetFileMap.scan();
        var resourceMap = this.createLocalResourceMap(assetFileMap);
        for (var i = 0; i < sceneFiles.length; i++) {
            var sceneFile = sceneFiles[i];
            var sceneJson = this.loadSceneFile(sceneFile);
            var graph = this.createSceneGraph(sceneJson);
            this.appendComponents(sceneJson, graph, resourceMap);
            graphs.set(sceneFile, graph);
            if (plugins) {
                this.pluginPostProcess(graph, sceneJson, assetFileMap, plugins);
            }
        }
        return graphs;
    };
    /**
     * Read scene file using file system and convert to javascript object.
     */
    DefaultSceneExporter.prototype.loadSceneFile = function (sceneFile) {
        var content = fs.readFileSync(sceneFile).toString();
        return JSON.parse(content);
    };
    /**
     * Create scene graph with scene file dto and collected resource map
     */
    DefaultSceneExporter.prototype.createSceneGraph = function (json) {
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
    DefaultSceneExporter.prototype.pluginPostProcess = function (graph, sceneJson, assetFileMap, plugins) {
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
    DefaultSceneExporter.prototype.createLocalResourceMap = function (assetFileMap) {
        var _this = this;
        var resourceMap = new Map();
        assetFileMap.forEach(function (item) {
            var entities = _this.createResourceMapEntities(item.filePath);
            entities.forEach(function (entity) { resourceMap.set(entity.id, entity); });
        });
        return resourceMap;
    };
    /**
     * Create array of RespirceMapEntity
     */
    DefaultSceneExporter.prototype.createResourceMapEntities = function (absPath) {
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
    DefaultSceneExporter.prototype.appendNodes = function (json, graph) {
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
            if (node.__type__ !== cc.MetaTypes.NODE) {
                transform.x = 0;
                transform.y = 0;
            }
            if (isCanvas) {
                transform.x = (transform.width || 0) * transform.anchor.x;
                transform.y = (transform.height || 0) * transform.anchor.y;
                transform.width = 0;
                transform.height = 0;
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
    DefaultSceneExporter.prototype.createDefaultTransform = function (component) {
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
    DefaultSceneExporter.prototype.appendMetaData = function (json, graph) {
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
    DefaultSceneExporter.prototype.appendComponents = function (json, graph, resourceMap) {
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
    DefaultSceneExporter.prototype.findSpriteData = function (resourceMap, spriteFrameUuid, atlasUuid) {
        if (!spriteFrameUuid) {
            return null;
        }
        var spriteFrameEntity = resourceMap.get(spriteFrameUuid.__uuid__);
        if (!spriteFrameEntity) {
            return null;
        }
        // _spriteFrame may directs sprite that may contain atlas path
        if (atlasUuid) {
            return this.findAtlasData(resourceMap, spriteFrameUuid, atlasUuid);
        }
        return this.findSpriteFrameData(spriteFrameEntity);
    };
    DefaultSceneExporter.prototype.findAtlasData = function (resourceMap, spriteFrameUuid, atlasUuid) {
        var atlasEntity = resourceMap.get(atlasUuid.__uuid__);
        if (!atlasEntity) {
            return null;
        }
        // TODO: shouldn't read file
        var atlasMetaContent = fs.readFileSync(atlasEntity.metaPath);
        var atlasMetaJson = JSON.parse(atlasMetaContent.toString());
        var frameName = null;
        var submeta = null;
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
            return null;
        }
        // path to sprite
        var rawTextureEntity = resourceMap.get(submeta.rawTextureUuid);
        if (!rawTextureEntity) {
            return null;
        }
        return {
            frameName: frameName,
            url: rawTextureEntity.path,
            atlasUrl: atlasEntity.path,
            submeta: submeta
        };
    };
    DefaultSceneExporter.prototype.findSpriteFrameData = function (spriteFrameEntity) {
        // TODO: shouldn't read file
        var spriteFrameMetaContent = fs.readFileSync(spriteFrameEntity.metaPath);
        var spriteFrameMetaJson = JSON.parse(spriteFrameMetaContent.toString());
        var keys = Object.keys(spriteFrameMetaJson.subMetas);
        if (keys.length === 0) {
            return null;
        }
        var frameName = keys[0];
        var submeta = spriteFrameMetaJson.subMetas[frameName];
        return {
            frameName: frameName,
            url: spriteFrameEntity.path,
            submeta: submeta
        };
    };
    DefaultSceneExporter.prototype.findAtlasDataBySpriteFrameUuid = function (resourceMap, spriteFrameUuid) {
        if (!spriteFrameUuid) {
            return null;
        }
        var it = resourceMap.entries();
        var result = it.next();
        while (!result.done) {
            var _a = result.value, key = _a[0], entity = _a[1];
            if (!entity || !entity.submetas) {
                result = it.next();
                continue;
            }
            var submetasKeys = Object.keys(entity.submetas);
            for (var k = 0; k < submetasKeys.length; k++) {
                var submetasKey = submetasKeys[k];
                var submeta = entity.submetas[submetasKey];
                if (!submeta) {
                    continue;
                }
                if (submeta.uuid === spriteFrameUuid.__uuid__) {
                    return { __uuid__: key };
                }
            }
            result = it.next();
        }
        return null;
    };
    /**
     * Detect and append supported component to scene graph node
     */
    DefaultSceneExporter.prototype.appendComponentByType = function (schemaNode, component, resourceMap) {
        switch (component.__type__) {
            case cc.MetaTypes.SPRITE: {
                var spriteFrameUuid = component._spriteFrame;
                var atlasUuid = component._atlas;
                var spriteData = this.findSpriteData(resourceMap, spriteFrameUuid, atlasUuid);
                if (!spriteData) {
                    break;
                }
                schemaNode.sprite = {
                    frameName: spriteData.frameName,
                    url: spriteData.url,
                    atlasUrl: spriteData.atlasUrl
                };
                var submeta = spriteData.submeta;
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
                    colorStr = "#" + this.colorToHexString(schemaNode.renderer.color);
                }
                schemaNode.text.style.color = colorStr;
                break;
            }
            case cc.MetaTypes.LAYOUT: {
                var layout = component;
                schemaNode.layout = {
                    layoutSize: layout._layoutSize,
                    resize: layout._resize,
                    layoutType: layout._N$layoutType,
                    cellSize: layout._N$cellSize,
                    startAxis: layout._N$startAxis,
                    paddingLeft: layout._N$paddingLeft,
                    paddingRight: layout._N$paddingRight,
                    paddingTop: layout._N$paddingTop,
                    paddingBottom: layout._N$paddingBottom,
                    spacingX: layout._N$spacingX,
                    spacingY: layout._N$spacingY,
                    verticalDirection: layout._N$verticalDirection,
                    horizontalDirection: layout._N$horizontalDirection
                };
                break;
            }
            case cc.MetaTypes.MASK: {
                var mask = component;
                var spriteFrameUuid = mask._spriteFrame;
                var atlasUuid = this.findAtlasDataBySpriteFrameUuid(resourceMap, spriteFrameUuid);
                var spriteData = this.findSpriteData(resourceMap, spriteFrameUuid, atlasUuid);
                var spriteFrame = void 0;
                if (spriteData) {
                    spriteFrame = {
                        frameName: spriteData.frameName,
                        url: spriteData.url,
                        atlasUrl: spriteData.atlasUrl
                    };
                }
                schemaNode.mask = {
                    maskType: mask._type,
                    spriteFrame: spriteFrame,
                    inverted: mask._N$inverted
                };
                break;
            }
            default: break;
        }
    };
    DefaultSceneExporter.prototype.colorToHexString = function (color) {
        var colorStrs = {
            r: (color.r < 0x10) ? "0" + color.r.toString(16) : color.r.toString(16),
            g: (color.g < 0x10) ? "0" + color.g.toString(16) : color.g.toString(16),
            b: (color.b < 0x10) ? "0" + color.b.toString(16) : color.b.toString(16)
        };
        return "" + colorStrs.r + colorStrs.g + colorStrs.b;
    };
    /**
     * Find and return component data if node has target component
     */
    DefaultSceneExporter.prototype.findComponentByType = function (json, type) {
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
    DefaultSceneExporter.prototype.findSchemaNodeById = function (graph, id) {
        var scene = graph.scene;
        for (var i = 0; i < scene.length; i++) {
            var element = scene[i];
            if (element.id === id) {
                return element;
            }
        }
        return null;
    };
    return DefaultSceneExporter;
}());
exports.default = DefaultSceneExporter;
//# sourceMappingURL=DefaultSceneExporter.js.map