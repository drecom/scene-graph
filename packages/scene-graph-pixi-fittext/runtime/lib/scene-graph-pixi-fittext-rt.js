(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["scene-graph-pixi-fittext-rt"] = factory();
	else
		root["scene-graph-pixi-fittext-rt"] = factory();
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

/***/ "./node_modules/@drecom/pixi-fittext/lib/pixi-fittext.min.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@drecom/pixi-fittext/lib/pixi-fittext.min.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

!function(t,e){ true?module.exports=e():undefined}(window,function(){return function(t){var e={};function r(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)r.d(n,o,function(e){return t[e]}.bind(null,o));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=0)}([function(t,e,r){"use strict";r.r(e);var n,o=(n=function(t,e){return(n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r])})(t,e)},function(t,e){function r(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(r.prototype=e.prototype,new r)}),i=function(t){function e(e,r,n,o){var i=t.call(this,void 0,n,o)||this;return i.requiredWidth=r,i.text=e,i}return o(e,t),e.prototype._onTextureUpdate=function(){},Object.defineProperty(e.prototype,"text",{get:function(){return this._text},set:function(t){var e=String(""===t||null==t?" ":t);if(this._text!==e){if(!this._style)return this._text=e,void(this.dirty=!0);this.fitScale(t),this._text=e,this.dirty=!0}},enumerable:!0,configurable:!0}),e.prototype.fitScale=function(t){var e=PIXI.TextMetrics.measureText(t,this._style,this._style.wordWrap,this.canvas).width;this.width=Math.max(this.requiredWidth,e),this.scale.x=Math.min(1,this.requiredWidth/e)},e}(PIXI.Text);r.d(e,"FitText",function(){return i})}])});

/***/ }),

/***/ "./src/FitTextImporterPlugin.ts":
/*!**************************************!*\
  !*** ./src/FitTextImporterPlugin.ts ***!
  \**************************************/
/*! exports provided: FitTextImporterPlugin, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FitTextImporterPlugin", function() { return FitTextImporterPlugin; });
/* harmony import */ var _drecom_pixi_fittext__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @drecom/pixi-fittext */ "./node_modules/@drecom/pixi-fittext/lib/pixi-fittext.min.js");
/* harmony import */ var _drecom_pixi_fittext__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_drecom_pixi_fittext__WEBPACK_IMPORTED_MODULE_0__);

var FitTextImporterPlugin = /** @class */ (function () {
    function FitTextImporterPlugin() {
    }
    /**
     * Plugin interface implementation
     * Custom extension for runtime object
     */
    FitTextImporterPlugin.prototype.extendRuntimeObjects = function () { };
    /**
     * Plugin interface implementation
     * Custom extension for runtime object
     */
    FitTextImporterPlugin.prototype.createRuntimeObject = function (node, _) {
        var isFitText = node.text && node.text.fitText;
        if (!isFitText) {
            return null;
        }
        var component = node.text;
        var text = component.text;
        var fitText = component.fitText;
        var nodeStyle = component.style;
        var style = new PIXI.TextStyle({});
        if (nodeStyle) {
            style.fontSize = nodeStyle.size || 26;
            style.fill = nodeStyle.color || 'black';
            switch (nodeStyle.horizontalAlign) {
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
        return new _drecom_pixi_fittext__WEBPACK_IMPORTED_MODULE_0__["FitText"](text || '', fitText.requiredWidth, style);
    };
    return FitTextImporterPlugin;
}());

/* harmony default export */ __webpack_exports__["default"] = (FitTextImporterPlugin);


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _FitTextImporterPlugin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./FitTextImporterPlugin */ "./src/FitTextImporterPlugin.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FitTextImporterPlugin", function() { return _FitTextImporterPlugin__WEBPACK_IMPORTED_MODULE_0__["FitTextImporterPlugin"]; });

/* harmony import */ var _drecom_pixi_fittext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @drecom/pixi-fittext */ "./node_modules/@drecom/pixi-fittext/lib/pixi-fittext.min.js");
/* harmony import */ var _drecom_pixi_fittext__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_drecom_pixi_fittext__WEBPACK_IMPORTED_MODULE_1__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _drecom_pixi_fittext__WEBPACK_IMPORTED_MODULE_1__) if(["FitTextImporterPlugin","default","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _drecom_pixi_fittext__WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));




/***/ })

/******/ });
});
//# sourceMappingURL=scene-graph-pixi-fittext-rt.js.map