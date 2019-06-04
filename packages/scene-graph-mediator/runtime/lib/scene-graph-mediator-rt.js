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

/***/ "./src/exporter/index.ts":
/*!*******************************!*\
  !*** ./src/exporter/index.ts ***!
  \*******************************/
/*! exports provided: Exporter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Exporter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Exporter */ "./src/exporter/Exporter.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Exporter", function() { return _Exporter__WEBPACK_IMPORTED_MODULE_0__["default"]; });





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
var defaultImportOption = {
    autoCoordinateFix: true
};
/**
 * Abstract class for runtime mediation.<br />
 * It handles runtime object like Unity's GameObject or Cocos's Node
 */
var Importer = /** @class */ (function () {
    function Importer() {
        this.onAddLoaderAsset = function (_node, _asset) { };
        this.onRestoreNode = function (_n, _r) { return null; };
        this.onRuntimeObjectCreated = function (_i, _o) { };
        this.onTransformRestored = function (_s, _i, _o, _n, _p) { };
        /**
         * Plugins container
         */
        this.plugins = [];
    }
    /**
     * Callback called when any asset added to runtime resource loader
     */
    Importer.prototype.setOnAddLoaderAsset = function (callback) {
        if (callback === void 0) { callback = function (_n, _a) { }; }
        this.onAddLoaderAsset = callback;
    };
    /**
     * Callback called when restoring a node to runtime<br />
     * If null is returned, default initiator creates runtime object.
     */
    Importer.prototype.setOnRestoreNode = function (callback) {
        if (callback === void 0) { callback = function (_n, _r) { return null; }; }
        this.onRestoreNode = callback;
    };
    /**
     * Callback called when each runtime object is instantiated
     */
    Importer.prototype.setOnRuntimeObjectCreated = function (callback) {
        if (callback === void 0) { callback = function (_i, _o) { }; }
        this.onRuntimeObjectCreated = callback;
    };
    /**
     * Callback called when each runtime object's transform/transform3d is restored
     */
    Importer.prototype.setOnTransformRestored = function (callback) {
        if (callback === void 0) { callback = function (_s, _i, _o, _n, _p) { }; }
        this.onTransformRestored = callback;
    };
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
    /**
     * Add plugin to extend import process.
     */
    Importer.prototype.addPlugin = function (plugin) {
        this.plugins.push(plugin);
    };
    /**
     * Extend scene graph with user plugins.
     */
    Importer.prototype.pluginPostProcess = function (schema, nodeMap, runtimeObjectMap, option) {
        for (var i = 0; i < this.plugins.length; i++) {
            var plugin = this.plugins[i];
            plugin.extendRuntimeObjects(schema, nodeMap, runtimeObjectMap, option);
        }
    };
    Importer.prototype.assembleImportOption = function (param1, param2) {
        var option = {
            callback: function (_) { },
            config: defaultImportOption
        };
        if (param2) {
            option.callback = param1;
            option.config = param2;
        }
        else {
            if (param1) {
                console.log(param1.constructor.name);
                if (param1.constructor.name === 'Function') {
                    option.callback = param1;
                }
                else {
                    option.config = param1;
                }
            }
        }
        return option;
    };
    /**
     * Map all nodes from given schema
     */
    Importer.prototype.createNodeMap = function (schema) {
        var nodeMap = new Map();
        for (var i = 0; i < schema.scene.length; i++) {
            var node = schema.scene[i];
            nodeMap.set(node.id, node);
        }
        return nodeMap;
    };
    /**
     * Create and map all Containers from given nodeMap.
     * This method uses createRuntimeObject interface to create each object
     */
    Importer.prototype.createRuntimeObjectMap = function (nodeMap, resources) {
        var _this = this;
        var objectMap = new Map();
        nodeMap.forEach(function (node, id) {
            // give prior to user custome initialization
            var object = _this.onRestoreNode(node, resources);
            // then process default initialization
            if (!object) {
                object = _this.createRuntimeObject(node, resources);
            }
            // skip if not supported
            if (!object) {
                return;
            }
            // name with node name if no name given
            if (!object.name) {
                object.name = node.name;
            }
            _this.onRuntimeObjectCreated(id, object);
            objectMap.set(id, object);
        });
        return objectMap;
    };
    return Importer;
}());



/***/ }),

/***/ "./src/importer/index.ts":
/*!*******************************!*\
  !*** ./src/importer/index.ts ***!
  \*******************************/
/*! exports provided: Importer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Importer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Importer */ "./src/importer/Importer.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Importer", function() { return _Importer__WEBPACK_IMPORTED_MODULE_0__["Importer"]; });





/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! exports provided: Importer, Exporter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _importer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./importer */ "./src/importer/index.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Importer", function() { return _importer__WEBPACK_IMPORTED_MODULE_0__["Importer"]; });

/* harmony import */ var _exporter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./exporter */ "./src/exporter/index.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Exporter", function() { return _exporter__WEBPACK_IMPORTED_MODULE_1__["Exporter"]; });






/***/ })

/******/ });
});
//# sourceMappingURL=scene-graph-mediator-rt.js.map