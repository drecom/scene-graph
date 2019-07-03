"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var yaml = require("yaml");
var scene_graph_mediator_cli_1 = require("@drecom/scene-graph-mediator-cli");
var IUnity = require("../../interface/Unity");
var UnityAssetFile_1 = require("../../asset/UnityAssetFile");
/**
 * Unity scene exporter
 */
var DefaultSceneExporter = /** @class */ (function () {
    function DefaultSceneExporter() {
        this.guidMap = new Map();
    }
    /**
     * Returns runtime identifier string.
     */
    DefaultSceneExporter.prototype.getIdentifier = function () {
        return 'unity';
    };
    /**
     * export scene graph
     *
     * - createGuidMap
     * - (for each scene file)
     *   - loadSceneFile
     *     - addUnityAssetFiles
     *       - addUnityAssetFile
     *     - loadSceneFile (recursive)
     *   - createSceneGraph
     */
    DefaultSceneExporter.prototype.createSceneGraphSchemas = function (sceneFiles, assetRoot, plugins) {
        var _this = this;
        var graphs = new Map();
        var assetFileMap = new scene_graph_mediator_cli_1.sgmed.AssetFileMap(assetRoot);
        assetFileMap.scan();
        this.guidMap = this.createGuidMap(assetFileMap);
        sceneFiles.forEach(function (sceneFile) {
            var sceneJson = _this.loadSceneFile(sceneFile);
            var graph = _this.createSceneGraph(sceneJson);
            graphs.set(sceneFile, graph);
            if (plugins) {
                _this.pluginPostProcess(graph, sceneJson, assetFileMap, plugins);
            }
        });
        return graphs;
    };
    /**
     * Read scene file using file system and convert to javascript object.
     */
    DefaultSceneExporter.prototype.loadSceneFile = function (sceneFile) {
        var _this = this;
        var components = {};
        var content = fs.readFileSync(sceneFile).toString();
        // TODO: parseAllDocuments takes long time
        var documents = yaml.parseAllDocuments(content);
        var childEntities = [];
        // parse scene components
        documents.forEach(function (document) {
            var json = document.toJSON();
            var anchor = Object.keys(document.anchors.map)[0];
            var componentName = Object.keys(json)[0];
            var prefab = (componentName === IUnity.Component.Name.PREFAB_INSTANCE) ? true : false;
            var data = json[componentName];
            var entity = { prefab: prefab, componentName: componentName, data: data };
            components[anchor] = entity;
            if (entity.componentName === IUnity.Component.Name.PREFAB_INSTANCE) {
                childEntities.push({ anchor: anchor, entity: entity });
            }
        });
        this.addUnityAssetFiles(components);
        var childSceneFiles = this.collectChildSceneFiles(components);
        childSceneFiles.forEach(function (item) {
            var nestedComponents = _this.loadSceneFile(item.path);
            components[item.anchor].data = nestedComponents;
        });
        return components;
    };
    DefaultSceneExporter.prototype.collectChildSceneFiles = function (scene) {
        var childSceneFiles = [];
        Object.entries(scene).forEach(function (array) {
            var anchor = array[0];
            var entity = array[1];
            if (!entity.sgmed || !entity.sgmed.assets) {
                return;
            }
            var key = null;
            switch (entity.componentName) {
                // FIXME: direct string literal
                case IUnity.Component.Name.PREFAB_INSTANCE:
                    key = 'm_SourcePrefab';
                    break;
                default: break;
            }
            if (!key) {
                return;
            }
            var assets = entity.sgmed.assets[key];
            if (!assets) {
                return;
            }
            if (assets.length === 0) {
                return;
            }
            var file = assets[0].file;
            if (!file) {
                return;
            }
            childSceneFiles.push({
                anchor: anchor,
                path: file.asset
            });
        });
        return childSceneFiles;
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
                    yDown: false,
                    zFront: false
                },
                baseCoordinate: {
                    x: 'center',
                    y: 'center',
                    z: 'center'
                },
                format: this.getIdentifier()
            }
        };
        this.appendComponents(json, graph);
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
    DefaultSceneExporter.prototype.createGuidMap = function (assetFileMap) {
        var guidMap = new Map();
        assetFileMap.forEach(function (item) {
            var metaFile = item.filePath;
            if (!UnityAssetFile_1.default.isMetaFile(metaFile)) {
                return;
            }
            var content = fs.readFileSync(metaFile, 'utf-8');
            try {
                var json = yaml.parse(content);
                var assetFile = UnityAssetFile_1.default.createWithMetaFile(metaFile);
                guidMap.set(json.guid, assetFile);
            }
            catch (e) {
                // can not avoid unity's invalid yaml semantic
                console.warn(metaFile, e.message);
            }
        });
        return guidMap;
    };
    DefaultSceneExporter.prototype.addUnityAssetFiles = function (scene) {
        var _this = this;
        Object.entries(scene).forEach(function (array) {
            var entity = array[1];
            switch (entity.componentName) {
                case IUnity.Component.Name.GAME_OBJECT: {
                    // FIXME: direct string literal
                    _this.addUnityAssetFile(entity, 'm_CorrespondingSourceObject');
                    break;
                }
                case IUnity.Component.Name.PREFAB_INSTANCE: {
                    // FIXME: direct string literal
                    _this.addUnityAssetFile(entity, 'm_SourcePrefab');
                    break;
                }
                case IUnity.Component.Name.SKINNED_MESH_RENDERER: {
                    // FIXME: direct string literal
                    _this.addUnityAssetFile(entity, 'm_Mesh');
                    _this.addUnityAssetFile(entity, 'm_Materials');
                    break;
                }
                default: break;
            }
        });
    };
    DefaultSceneExporter.prototype.addUnityAssetFile = function (entity, key) {
        var _this = this;
        var value = entity.data[key];
        if (!value) {
            return;
        }
        entity.sgmed = entity.sgmed || {};
        entity.sgmed.assets = entity.sgmed.assets || {};
        entity.sgmed.assets[key] = [];
        var assets = (value.constructor.name === 'Array') ? value : [value];
        assets.forEach(function (item) {
            var ref = item;
            if (!ref.guid) {
                return;
            }
            var file = _this.guidMap.get("" + ref.guid);
            if (!file) {
                return;
            }
            entity.sgmed.assets[key].push({ ref: ref, file: file });
        });
    };
    DefaultSceneExporter.prototype.appendComponents = function (scene, graph) {
        var _this = this;
        // expand prefab instances
        Object.entries(scene).forEach(function (array) {
            var entity = array[1];
            if (entity.componentName === IUnity.Component.Name.PREFAB_INSTANCE) {
                _this.appendComponents(entity.data, graph);
            }
        });
        // collect gameobjects
        var gameObjects = new Map();
        Object.entries(scene).forEach(function (array) {
            var anchor = array[0];
            var entity = array[1];
            if (entity.componentName === IUnity.Component.Name.GAME_OBJECT) {
                var gameObject = entity.data;
                var node = {
                    id: anchor,
                    name: gameObject.m_Name,
                    constructorName: entity.componentName
                };
                gameObjects.set(anchor, { entity: entity, node: node });
                graph.scene.push(node);
            }
        });
        Object.entries(scene).forEach(function (array) {
            var entity = array[1];
            switch (entity.componentName) {
                case IUnity.Component.Name.TRANSFORM: {
                    var transform = entity.data;
                    var gameObject = gameObjects.get("" + transform.m_GameObject.fileID);
                    if (!gameObject) {
                        break;
                    }
                    var transform3d = {
                        x: transform.m_LocalPosition.x,
                        y: transform.m_LocalPosition.y,
                        z: transform.m_LocalPosition.z,
                        scale: {
                            x: transform.m_LocalScale.x,
                            y: transform.m_LocalScale.y,
                            z: transform.m_LocalScale.z
                        },
                        rotation: {
                            x: transform.m_LocalRotation.x,
                            y: transform.m_LocalRotation.y,
                            z: transform.m_LocalRotation.z,
                            w: transform.m_LocalRotation.w
                        }
                    };
                    gameObject.node.transform3d = transform3d;
                    break;
                }
                case IUnity.Component.Name.SKINNED_MESH_RENDERER: {
                    if (!entity.sgmed || !entity.sgmed.assets) {
                        break;
                    }
                    var meshRenderer = entity.data;
                    var gameObject = gameObjects.get("" + meshRenderer.m_GameObject.fileID);
                    if (!gameObject) {
                        break;
                    }
                    var renderer_1 = {
                        mesh: { url: '' },
                        materials: []
                    };
                    var meshFile = entity.sgmed.assets['m_Mesh'][0].file;
                    var materialAssetInfo = entity.sgmed.assets['m_Materials'];
                    if (meshFile) {
                        renderer_1.mesh.url = meshFile.asset;
                    }
                    if (materialAssetInfo) {
                        materialAssetInfo.forEach(function (assetInfo) {
                            var content = fs.readFileSync(assetInfo.file.asset).toString();
                            var materialJson = yaml.parse(content);
                            var textures = materialJson.Material.m_SavedProperties.m_TexEnvs;
                            textures.forEach(function (texture) {
                                Object.entries(texture).forEach(function (array) {
                                    var textureProp = array[1];
                                    if (!textureProp.m_Texture.guid) {
                                        return;
                                    }
                                    var file = _this.guidMap.get(textureProp.m_Texture.guid);
                                    if (!file) {
                                        return;
                                    }
                                    renderer_1.materials.push({
                                        url: file.asset
                                    });
                                });
                            });
                        });
                    }
                    gameObject.node.meshRenderer = renderer_1;
                    break;
                }
                case IUnity.Component.Name.GAME_OBJECT:
                case IUnity.Component.Name.PREFAB_INSTANCE:
                default: break;
            }
        });
    };
    return DefaultSceneExporter;
}());
exports.default = DefaultSceneExporter;
//# sourceMappingURL=DefaultSceneExporter.js.map