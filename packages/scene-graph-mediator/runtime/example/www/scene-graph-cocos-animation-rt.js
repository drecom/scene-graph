(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["scene-graph-mediator-rt"] = factory();
	else
		root["scene-graph-mediator-rt"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/exporter/Exporter.ts":
/*!**********************************!*\
  !*** ./src/exporter/Exporter.ts ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/**
 * Abstract class for runtime mediation.<br />
 * It handles runtime object like Unity's GameObject or Cocos's Node
 */
var Exporter = /** @class */ (function () {
    function Exporter() {
    }
    /**
     * Export current runtime node structure to desired format
     * like text tree or raw intermediates.<br />
     * FIXME: Child node(s) added in constructor may duplicate.
     */
    Exporter.prototype.export = function (rootNode, width, height) {
        return this.createSchema(rootNode, width, height);
    };
    return Exporter;
}());
/* harmony default export */ __webpack_exports__["default"] = (Exporter);


/***/ }),

/***/ "./src/exporter/Pixi.ts":
/*!******************************!*\
  !*** ./src/exporter/Pixi.ts ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var exporter_Exporter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! exporter/Exporter */ "./src/exporter/Exporter.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

/**
 * Abstract class for runtime mediation.<br />
 * It handles runtime object like Unity's GameObject or Cocos's Node
 */
var Pixi = /** @class */ (function (_super) {
    __extends(Pixi, _super);
    function Pixi() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Pixi.prototype.createSchema = function (scene, width, height) {
        var root = {
            scene: this.createNodeRecursive(scene),
            metadata: {
                width: width,
                height: height,
                positiveCoord: {
                    xRight: true,
                    yDown: true
                }
            }
        };
        return root;
    };
    Pixi.prototype.createNode = function (base) {
        var className = base.constructor.name;
        var node = {
            id: base.name,
            name: base.name,
            constructorName: className,
            transform: {
                x: base.position.x,
                y: base.position.y,
                anchor: {
                    x: 0,
                    y: 0
                }
            }
        };
        if (base.parent) {
            node.transform.parent = base.parent.name;
        }
        if (base.children) {
            node.transform.children = [];
            for (var i = 0; i < base.children.length; i++) {
                node.transform.children.push(base.children[i].name);
            }
        }
        switch (className) {
            case 'NineSlicePlane': break; // TODO:
            case 'Spine': break; // TODO:
            case 'Sprite': {
                // TODO: base64 image
                node.sprite = {
                    url: base.texture.baseTexture.imageUrl
                };
                // TODO: texture atlas
                break;
            }
            case 'Text': {
                node.text = {
                    text: base.text,
                    style: {
                        size: base.style.fontSize,
                        color: base.style.fill
                    }
                };
                break;
            }
        }
        // extras
        node.properties = {};
        // for..in iterator crawls all properties includes prototype
        var keys = Object.keys(base);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = base[key];
            var valueType = typeof value;
            // restrict to JSON types
            if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
                node.properties[key] = value;
            }
        }
        return node;
    };
    Pixi.prototype.createNodeRecursive = function (base) {
        var nodes = [];
        nodes.push(this.createNode(base));
        if (base.children) {
            for (var i = 0; i < base.children.length; i++) {
                nodes = nodes.concat(this.createNodeRecursive(base.children[i]));
            }
        }
        return nodes;
    };
    return Pixi;
}(exporter_Exporter__WEBPACK_IMPORTED_MODULE_0__["default"]));
/* harmony default export */ __webpack_exports__["default"] = (Pixi);


/***/ }),

/***/ "./src/exporter/index.ts":
/*!*******************************!*\
  !*** ./src/exporter/index.ts ***!
  \*******************************/
/*! exports provided: Exporters */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Exporters", function() { return Exporters; });
/* harmony import */ var exporter_Exporter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! exporter/Exporter */ "./src/exporter/Exporter.ts");
/* harmony import */ var exporter_Pixi__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! exporter/Pixi */ "./src/exporter/Pixi.ts");


var Exporters = {
    Pixi: exporter_Pixi__WEBPACK_IMPORTED_MODULE_1__["default"],
    Abstract: exporter_Exporter__WEBPACK_IMPORTED_MODULE_0__["default"]
};



/***/ }),

/***/ "./src/importer/Importer.ts":
/*!**********************************!*\
  !*** ./src/importer/Importer.ts ***!
  \**********************************/
/*! exports provided: Importer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Importer", function() { return Importer; });
/**
 * Abstract class for runtime mediation.<br />
 * It handles runtime object like Unity's GameObject or Cocos's Node
 */
var Importer = /** @class */ (function () {
    function Importer() {
    }
    /**
     * Returns initiate methods related to class name.<br />
     * Often it is used to define initiation of a class instance
     * with constructor that has argument.<br />
     * Initiators are defined in each runtime implementation and it should be augmented by user.<br />
     * Remarks: This is an experimental design and may be changed in the future.
     */
    Importer.prototype.getInitiator = function (_name) {
        return function () { };
    };
    /**
     * Returns initiator exists
     */
    Importer.prototype.hasInitiator = function (_name) {
        return false;
    };
    return Importer;
}());



/***/ }),

/***/ "./src/importer/Pixi.ts":
/*!******************************!*\
  !*** ./src/importer/Pixi.ts ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var importer_Importer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! importer/Importer */ "./src/importer/Importer.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var DEGREE_TO_RADIAN = Math.PI / 180;
var defaultImportOption = {
    autoCoordinateFix: true
};
/**
 * Pixi implementation of Importer
 */
var Pixi = /** @class */ (function (_super) {
    __extends(Pixi, _super);
    function Pixi() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onAddLoaderAsset = function (_node, _asset) { };
        _this.onRestoreNode = function (_n, _r) { return null; };
        _this.onPixiObjectCreated = function (_i, _o) { };
        _this.onTransformRestored = function (_s, _i, _o, _n, _p) { };
        _this.plugins = [];
        return _this;
    }
    /**
     * Dtect if given colors are default color
     */
    Pixi.isDefaultColor = function (r, g, b, a) {
        return (r === 255 && g === 255 && b === 255 && (!a || a === 255));
    };
    /**
     * Callback called when any asset added to pixi loader
     */
    Pixi.prototype.setOnAddLoaderAsset = function (callback) {
        if (callback === void 0) { callback = function (_n, _a) { }; }
        this.onAddLoaderAsset = callback;
    };
    /**
     * Callback called when restoring a node to pixi container<br />
     * If null is returned, default initiator creates pixi object.
     */
    Pixi.prototype.setOnRestoreNode = function (callback) {
        if (callback === void 0) { callback = function (_n, _r) { return null; }; }
        this.onRestoreNode = callback;
    };
    /**
     * Callback called when each pixi object is instantiated
     */
    Pixi.prototype.setOnRuntimeObjectCreated = function (callback) {
        if (callback === void 0) { callback = function (_i, _o) { }; }
        this.onPixiObjectCreated = callback;
    };
    Pixi.prototype.setOnTransformRestored = function (callback) {
        if (callback === void 0) { callback = function (_s, _i, _o, _n, _p) { }; }
        this.onTransformRestored = callback;
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
     * Add plugin to extend import process.
     */
    Pixi.prototype.addPlugin = function (plugin) {
        this.plugins.push(plugin);
    };
    /**
     * Import Schema and rebuild runtime node structure.<br />
     * Resources are automatically downloaded.<br />
     * Use createAssetMap if any customized workflow are preffered.
     */
    Pixi.prototype.import = function (schema, param1, param2) {
        var _this = this;
        var callback;
        var option;
        if (param2) {
            callback = param1;
            option = param2;
        }
        else {
            if (param1) {
                if (param1.constructor.name === 'Function') {
                    callback = param1;
                    option = defaultImportOption;
                }
                else {
                    callback = function (_) { };
                    option = param1;
                }
            }
            else {
                callback = function (_) { };
                option = defaultImportOption;
            }
        }
        var root = new PIXI.Container();
        // create asset list to download
        var assets = this.createAssetMap(schema);
        // load if any asset is required
        if (assets.size > 0) {
            assets.forEach(function (asset) { PIXI.loader.add(asset); });
            PIXI.loader.load(function () {
                _this.restoreScene(root, schema, option);
                callback(root);
            });
        }
        else {
            this.restoreScene(root, schema, option);
            callback(root);
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
        var containerMap = this.createContainerMap(nodeMap, PIXI.loader.resources);
        // restore renderer
        this.restoreRenderer(nodeMap, containerMap);
        // restore transform in the end
        this.restoreTransform(root, schema, nodeMap, containerMap, option);
    };
    /**
     * Extend scene graph with user plugins.
     */
    Pixi.prototype.pluginPostProcess = function (schema, nodeMap, runtimeObjectMap) {
        for (var i = 0; i < this.plugins.length; i++) {
            var plugin = this.plugins[i];
            plugin.extendRuntimeObjects(schema, nodeMap, runtimeObjectMap);
        }
    };
    /**
     * Map all nodes from given schema
     */
    Pixi.prototype.createNodeMap = function (schema) {
        var nodeMap = new Map();
        for (var i = 0; i < schema.scene.length; i++) {
            var node = schema.scene[i];
            nodeMap.set(node.id, node);
        }
        return nodeMap;
    };
    /**
     * Create and map all Containers from given nodeMap
     */
    Pixi.prototype.createContainerMap = function (nodeMap, resources) {
        var _this = this;
        var containerMap = new Map();
        nodeMap.forEach(function (node, id) {
            // give prior to user custome initialization
            var object = _this.onRestoreNode(node, resources);
            // then process default initialization
            if (!object) {
                object = _this.createContainer(node, resources);
            }
            // skip if not supported
            if (!object) {
                return;
            }
            // name with node name if no name given
            if (!object.name) {
                object.name = node.name;
            }
            _this.onPixiObjectCreated(id, object);
            containerMap.set(id, object);
        });
        return containerMap;
    };
    /**
     * Create container instance from given node<br />
     * Textures in loader.resources may be refered.
     */
    Pixi.prototype.createContainer = function (node, resources) {
        var object;
        if (node.spine) {
            // TODO: support spine
            // object = new PIXI.spine.Spine(resources[node.id].data);
        }
        else if (node.sprite) {
            // TODO: base64 image
            var texture = null;
            if (node.sprite.atlasUrl && node.sprite.frameName) {
                texture = PIXI.Texture.fromFrame(node.sprite.frameName);
            }
            else if (node.sprite.url) {
                texture = resources[node.sprite.url].texture;
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
        var metadata = schema.metadata;
        // original coordinate system adjustment
        var coordVector = {
            x: (metadata.positiveCoord.xRight ? 1 : -1),
            y: (metadata.positiveCoord.yDown ? 1 : -1)
        };
        // restore transform for each mapped container
        // TODO: should separate restoration of hieralchy and property ?
        containerMap.forEach(function (container, id) {
            // node that is not from schema
            var node = nodeMap.get(id);
            if (!node) {
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
            // convert coordinate system
            var position = {
                x: transform.x * coordVector.x,
                y: transform.y * coordVector.y
            };
            // default scale is 1/1
            var scale = (transform.scale) ? {
                x: transform.scale.x,
                y: transform.scale.y
            } : { x: 1, y: 1 };
            // pixi rotation is presented in radian
            var rotation = (transform.rotation) ? transform.rotation * DEGREE_TO_RADIAN : 0;
            // scene-graph-mediator extended properties
            if (!container.sgmed) {
                container.sgmed = {};
            }
            container.sgmed.anchor = {
                x: transform.anchor.x,
                y: transform.anchor.y
            };
            // assign everything
            container.position.set(position.x, position.y);
            container.scale.set(scale.x, scale.y);
            container.rotation = rotation;
            if (option.autoCoordinateFix) {
                _this.fixCoordinate(schema, container, node, parentNode);
            }
        });
        this.pluginPostProcess(schema, nodeMap, containerMap);
        containerMap.forEach(function (container, id) {
            var node = nodeMap.get(id);
            if (!node) {
                return;
            }
            var parentNode = node.transform.parent ? nodeMap.get(node.transform.parent) : undefined;
            _this.onTransformRestored(schema, id, container, node, parentNode);
        });
    };
    Pixi.prototype.fixCoordinate = function (_schema, obj, node, parentNode) {
        var transform = node.transform;
        var scale = transform.scale || { x: 1, y: 1 };
        if (parentNode === undefined) {
            return;
        }
        var size = {
            width: transform.width || 0,
            height: transform.height || 0
        };
        var parentSize = {
            width: parentNode.transform.width || 0,
            height: parentNode.transform.height || 0
        };
        obj.position.x += (parentSize.width - size.width * scale.x) * transform.anchor.x;
        obj.position.y += (parentSize.height - size.height * scale.y) * transform.anchor.y;
        if (obj.anchor) {
            obj.position.x += size.width * scale.x * transform.anchor.x;
            obj.position.y += size.height * scale.y * transform.anchor.y;
            obj.anchor.x = transform.anchor.x;
            obj.anchor.y = 0.5 - (transform.anchor.y - 0.5);
        }
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
}(importer_Importer__WEBPACK_IMPORTED_MODULE_0__["Importer"]));
/* harmony default export */ __webpack_exports__["default"] = (Pixi);


/***/ }),

/***/ "./src/importer/index.ts":
/*!*******************************!*\
  !*** ./src/importer/index.ts ***!
  \*******************************/
/*! exports provided: Importers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Importers", function() { return Importers; });
/* harmony import */ var importer_Importer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! importer/Importer */ "./src/importer/Importer.ts");
/* harmony import */ var importer_Pixi__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! importer/Pixi */ "./src/importer/Pixi.ts");


var Importers = {
    Pixi: importer_Pixi__WEBPACK_IMPORTED_MODULE_1__["default"],
    Abstract: importer_Importer__WEBPACK_IMPORTED_MODULE_0__["Importer"]
};



/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! exports provided: Importers, Exporters */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _importer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./importer */ "./src/importer/index.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Importers", function() { return _importer__WEBPACK_IMPORTED_MODULE_0__["Importers"]; });

/* harmony import */ var _exporter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./exporter */ "./src/exporter/index.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Exporters", function() { return _exporter__WEBPACK_IMPORTED_MODULE_1__["Exporters"]; });






/***/ })

/******/ });
});
//# sourceMappingURL=scene-graph-mediator-rt.js.map