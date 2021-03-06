(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["scene-graph-event-rt"] = factory();
	else
		root["scene-graph-event-rt"] = factory();
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

/***/ "./src/EventRuntime.ts":
/*!*****************************!*\
  !*** ./src/EventRuntime.ts ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var defaultEventAdapter = function (event) {
    return event;
};
/**
 * Plugin for scene-graph-mediator-rt
 * Handles animation data desceibed in scene-graph-cocos-animation-cli in PIXI runtime
 */
var EventRuntime = /** @class */ (function () {
    function EventRuntime() {
    }
    /**
     * Plugin interface inplementation
     * Custom extension for runtime object
     */
    EventRuntime.prototype.extendRuntimeObjects = function (_, nodeMap, runtimeObjectMap, option) {
        // FIXME: any
        var eventAdapter = option.customEventAdapter || defaultEventAdapter;
        nodeMap.forEach(function (node, id) {
            if (!node.events)
                return;
            var container = runtimeObjectMap.get(id);
            container.interactive = true;
            var _loop_1 = function (i) {
                var event_1 = node.events[i];
                var target = runtimeObjectMap.get(event_1.targetId);
                if (!target) {
                    return "continue";
                }
                var parsedEvent = eventAdapter(event_1);
                var callback = target[parsedEvent.callback];
                if (!callback) {
                    return "continue";
                }
                if (parsedEvent.params) {
                    container.on(parsedEvent.type, function () { return callback.call.apply(callback, [target].concat(parsedEvent.params)); });
                }
                else {
                    container.on(parsedEvent.type, function () { return callback.call(target); });
                }
            };
            for (var i = 0; i < node.events.length; i++) {
                _loop_1(i);
            }
        });
    };
    return EventRuntime;
}());
/* harmony default export */ __webpack_exports__["default"] = (EventRuntime);


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! exports provided: EventRuntime */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _EventRuntime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EventRuntime */ "./src/EventRuntime.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EventRuntime", function() { return _EventRuntime__WEBPACK_IMPORTED_MODULE_0__["default"]; });





/***/ })

/******/ });
});
//# sourceMappingURL=scene-graph-event-rt.js.map