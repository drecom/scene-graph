var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as PIXI from 'pixi.js';
import { Importer } from '@drecom/scene-graph-mediator-rt';
import { Pixi as PropertyConverter } from '../property_converter/Pixi';
import { LayoutComponent } from './component/Layout';
var defaultImportOption = {
    autoCoordinateFix: true
};
/**
 * Pixi implementation of Importer
 */
var Pixi = /** @class */ (function (_super) {
    __extends(Pixi, _super);
    function Pixi() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Dtect if given colors are default color
     */
    Pixi.isDefaultColor = function (r, g, b, a) {
        return (r === 255 && g === 255 && b === 255 && (!a || a === 255));
    };
    /**
     * Returns atlas resource name with node id
     */
    Pixi.prototype.getAtlasResourceNameByNodeId = function (id) { return id + "_atlas"; };
    /**
     * Returns pixi class as initializer
     */
    Pixi.prototype.getInitiator = function (name) {
        return function (_node) { return new PIXI[name](); };
    };
    /**
     * Returns if pixi has property with given name
     */
    Pixi.prototype.hasInitiator = function (name) {
        return PIXI.hasOwnProperty(name);
    };
    /**
     * Import Schema and rebuild runtime node structure.<br />
     * Resources are automatically downloaded.<br />
     * Use createAssetMap if any customized workflow are preffered.
     */
    Pixi.prototype.import = function (schema, param1, param2) {
        var _this = this;
        var option = this.assembleImportOption(param1, param2);
        var root = new PIXI.Container();
        // create asset list to download
        var assets = this.createAssetMap(schema);
        // load if any asset is required
        if (assets.size > 0) {
            assets.forEach(function (asset) { PIXI.loader.add(asset); });
            PIXI.loader.load(function () {
                _this.restoreScene(root, schema, option.config);
                option.callback(root);
            });
        }
        else {
            this.restoreScene(root, schema, option.config);
            option.callback(root);
        }
        return root;
    };
    /**
     * Create asset map from schema.<br />
     * Users can use this method and restoreScene individually to inject custom pipeline.
     */
    Pixi.prototype.createAssetMap = function (schema) {
        // resources
        var assets = new Map();
        // collect required resource
        for (var i = 0; i < schema.scene.length; i++) {
            var url = void 0;
            var node = schema.scene[i];
            if (node.spine) {
                // TODO: support spine
                // url  = node.spine.url;
                continue;
            }
            else if (node.sprite) {
                url = node.sprite.url;
            }
            else {
                continue;
            }
            if (!url) {
                continue;
            }
            var asset = { url: url, name: url };
            // user custom process to modify url or resource name
            this.onAddLoaderAsset(node, asset);
            assets.set(url, asset);
        }
        return assets;
    };
    /**
     * Rstore pixi container to given root container from schema
     */
    Pixi.prototype.restoreScene = function (root, schema, option) {
        if (option === void 0) { option = defaultImportOption; }
        // map all nodes in schema first
        var nodeMap = this.createNodeMap(schema);
        // then instantiate all containers from node map
        var containerMap = this.createRuntimeObjectMap(nodeMap, PIXI.loader.resources);
        // restore renderer
        this.restoreRenderer(nodeMap, containerMap);
        // restore transform in the end
        this.restoreTransform(root, schema, nodeMap, containerMap, option);
    };
    /**
     * Create container instance from given node<br />
     * Textures in loader.resources may be refered.
     */
    Pixi.prototype.createRuntimeObject = function (node, resources) {
        var object;
        if (node.spine) {
            // TODO: support spine
            // object = new PIXI.spine.Spine(resources[node.id].data);
        }
        else if (node.sprite) {
            var texture = null;
            if (node.sprite.atlasUrl && node.sprite.frameName) {
                texture = PIXI.Texture.fromFrame(node.sprite.frameName);
            }
            else if (node.sprite.url) {
                texture = resources[node.sprite.url].texture;
            }
            else if (node.sprite.base64) {
                texture = PIXI.Texture.fromImage(node.sprite.base64);
            }
            if (!texture) {
                return null;
            }
            if (node.sprite.slice) {
                object = new PIXI.mesh.NineSlicePlane(texture, node.sprite.slice.left, node.sprite.slice.top, node.sprite.slice.right, node.sprite.slice.bottom);
                object.width = node.transform.width;
                object.height = node.transform.height;
            }
            else {
                object = new PIXI.Sprite(texture);
            }
        }
        else if (node.text) {
            var style = new PIXI.TextStyle({});
            if (node.text.style) {
                style.fontSize = node.text.style.size || 26;
                style.fill = node.text.style.color || 'black';
                switch (node.text.style.horizontalAlign) {
                    case 2:
                        style.align = 'right';
                        break;
                    case 1:
                        style.align = 'center';
                        break;
                    case 0:
                    default:
                        style.align = 'left';
                        break;
                }
            }
            object = new PIXI.Text(node.text.text || '', style);
        }
        else if (this.hasInitiator(node.constructorName)) {
            object = this.getInitiator(node.constructorName)(node);
        }
        else {
            object = new PIXI.Container();
        }
        return object;
    };
    /**
     * Restore transform<br />
     * Process this method after applying textures
     * since bounds can not be calculated properly if no texture are applied.
     */
    Pixi.prototype.restoreTransform = function (root, schema, nodeMap, containerMap, option) {
        var _this = this;
        if (option === void 0) { option = defaultImportOption; }
        // restore transform for each mapped container
        // TODO: should separate restoration of hieralchy and property ?
        containerMap.forEach(function (container, id) {
            // node that is not from schema
            var node = nodeMap.get(id);
            if (!node || !node.transform) {
                return;
            }
            var transform = node.transform;
            var parentNode = transform.parent ? nodeMap.get(transform.parent) : undefined;
            // restore hieralchy
            if (transform.parent === undefined) {
                // container that has no parent is the root element
                root.addChild(container);
            }
            else {
                var parentContainer = containerMap.get(transform.parent);
                // skip if any parent could not be detected
                if (!parentContainer || !parentNode) {
                    return;
                }
                parentContainer.addChild(container);
            }
            if (!container.sgmed) {
                container.sgmed = {};
            }
            container.sgmed.anchor = {
                x: node.transform.anchor.x,
                y: node.transform.anchor.y
            };
            if (option.autoCoordinateFix) {
                // scene-graph-mediator extended properties
                _this.fixCoordinate(schema, container, node);
            }
            else {
                _this.applyCoordinate(schema, container, node);
            }
        });
        // update under Layout component node
        containerMap.forEach(function (container, id) {
            var node = nodeMap.get(id);
            if (!node || !node.layout || !node.transform) {
                return;
            }
            LayoutComponent.fixLayout(container, node);
        });
        this.pluginPostProcess(schema, nodeMap, containerMap, option);
        containerMap.forEach(function (container, id) {
            var node = nodeMap.get(id);
            if (!node || !node.transform) {
                return;
            }
            var parentNode = node.transform.parent ? nodeMap.get(node.transform.parent) : undefined;
            _this.onTransformRestored(schema, id, container, node, parentNode);
        });
    };
    Pixi.prototype.fixCoordinate = function (schema, obj, node) {
        var convertedValues = PropertyConverter.createConvertedObject(schema, node.transform);
        PropertyConverter.fixCoordinate(schema, convertedValues, node);
        PropertyConverter.applyConvertedObject(obj, convertedValues);
    };
    Pixi.prototype.applyCoordinate = function (schema, obj, node) {
        var convertedValues = PropertyConverter.createConvertedObject(schema, node.transform);
        PropertyConverter.applyConvertedObject(obj, convertedValues);
    };
    Pixi.prototype.restoreRenderer = function (nodeMap, containerMap) {
        containerMap.forEach(function (container, id) {
            // node that is not from schema
            var node = nodeMap.get(id);
            if (!node) {
                return;
            }
            if (!node.renderer) {
                return;
            }
            if (node.renderer.color) {
                var color = node.renderer.color;
                if (!Pixi.isDefaultColor(color.r, color.g, color.b)) {
                    // TODO: consider Sprite tint
                    var filter = new PIXI.filters.ColorMatrixFilter();
                    filter.matrix = [
                        color.r / 255, 0, 0, 0, 0,
                        0, color.g / 255, 0, 0, 0,
                        0, 0, color.b / 255, 0, 0,
                        0, 0, 0, color.a / 255, 0
                    ];
                    // getter for filters returns copy
                    var filters = container.filters || [];
                    filters.push(filter);
                    container.filters = filters;
                }
                else if (color.a !== 255) {
                    container.alpha = color.a / 255;
                }
            }
        });
    };
    return Pixi;
}(Importer));
export default Pixi;
//# sourceMappingURL=Pixi.js.map