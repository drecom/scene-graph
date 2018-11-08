(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["scene-graph-cocos-animation-rt"] = factory();
	else
		root["scene-graph-cocos-animation-rt"] = factory();
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

/***/ "./src/CocosAnimationRuntime.ts":
/*!**************************************!*\
  !*** ./src/CocosAnimationRuntime.ts ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _CocosAnimationRuntimeExtension__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CocosAnimationRuntimeExtension */ "./src/CocosAnimationRuntimeExtension.ts");

/**
 * Plugin for scene-graph-mediator-rt
 * Handles animation data desceibed in scene-graph-cocos-animation-cli in PIXI runtime
 */
var CocosAnimationRuntime = /** @class */ (function () {
    function CocosAnimationRuntime() {
    }
    /**
     * Plugin interface inplementation
     * Custom extension for runtime object
     */
    CocosAnimationRuntime.prototype.extendRuntimeObjects = function (_, nodeMap, runtimeObjectMap, option) {
        nodeMap.forEach(function (node, id) {
            if (!node.animations)
                return;
            var container = runtimeObjectMap.get(id);
            if (!container.sgmed) {
                container.sgmed = {};
            }
            container.sgmed.cocosAnimations = node.animations;
            if (!container.sgmed.cocosAnimations) {
                return;
            }
            for (var i = 0; i < container.sgmed.cocosAnimations.length; i++) {
                var cocosAnimation = container.sgmed.cocosAnimations[i];
                cocosAnimation.runtime = new _CocosAnimationRuntimeExtension__WEBPACK_IMPORTED_MODULE_0__["default"](cocosAnimation, container);
            }
            if (option.autoCoordinateFix) {
                // calibrate anchor system difference
                if (!container.anchor) {
                    container.pivot.set(container.width * 0.5, container.height * 0.5);
                    container.position.x += container.width * container.scale.x * 0.5;
                    container.position.y += container.height * container.scale.y * 0.5;
                }
            }
        });
    };
    /**
     * Collect conatiners with animation
     */
    CocosAnimationRuntime.prototype.filterAnimationContainer = function (rootContainer, vector) {
        if (vector === void 0) { vector = []; }
        if (rootContainer.sgmed && rootContainer.sgmed.cocosAnimations) {
            vector.push(rootContainer);
        }
        for (var i = 0; i < rootContainer.children.length; i++) {
            this.filterAnimationContainer(rootContainer.children[i], vector);
        }
        return vector;
    };
    return CocosAnimationRuntime;
}());
/* harmony default export */ __webpack_exports__["default"] = (CocosAnimationRuntime);


/***/ }),

/***/ "./src/CocosAnimationRuntimeExtension.ts":
/*!***********************************************!*\
  !*** ./src/CocosAnimationRuntimeExtension.ts ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Easing__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Easing */ "./src/Easing.ts");
/* harmony import */ var _besier__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./besier */ "./src/besier.ts");


var DEGREE_TO_RADIAN = Math.PI / 180;
function createBezierByTime(controlPoints) {
    return function (ratio) { return Object(_besier__WEBPACK_IMPORTED_MODULE_1__["default"])(controlPoints, ratio); };
}
/**
 * Cocos animation augment object for PIXI.Container.
 */
var CocosAnimationRuntimeExtension = /** @class */ (function () {
    function CocosAnimationRuntimeExtension(animation, target) {
        /**
         * Application fps
         */
        this.fps = 60;
        /**
         * Boolean to represent animation is paused
         */
        this.paused = false;
        /**
         * Animation elapsed time described in seconds
         */
        this.elapsedTime = 0;
        this.animation = animation;
        this.target = target;
        this.animationFrameTime = 1.0 / this.animation.sample;
        this.curveFuncsMap = new Map();
        var properties = Object.keys(this.animation.curves);
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            var curveFuncs = [];
            var curve = this.animation.curves[property];
            for (var j = 0; j < curve.keyFrames.length; j++) {
                var keyFrame = curve.keyFrames[j];
                var func = CocosAnimationRuntimeExtension.getCurveFunction(keyFrame.curve);
                curveFuncs.push(func);
            }
            this.curveFuncsMap.set(property, curveFuncs);
        }
    }
    Object.defineProperty(CocosAnimationRuntimeExtension.prototype, "spf", {
        /**
         * Seconds per frame by application fps
         */
        get: function () {
            return 1.0 / this.fps;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get curve function by given curve type.
     */
    CocosAnimationRuntimeExtension.getCurveFunction = function (curveType) {
        if (!curveType) {
            return _Easing__WEBPACK_IMPORTED_MODULE_0__["default"].linear;
        }
        if (typeof curveType === 'string') {
            if (_Easing__WEBPACK_IMPORTED_MODULE_0__["default"].hasOwnProperty(curveType)) {
                return _Easing__WEBPACK_IMPORTED_MODULE_0__["default"][curveType];
            }
            return _Easing__WEBPACK_IMPORTED_MODULE_0__["default"].linear;
        }
        // custom curve
        return createBezierByTime(curveType);
    };
    /**
     * Pause animation
     */
    CocosAnimationRuntimeExtension.prototype.pause = function () {
        this.paused = true;
    };
    /**
     * Resume animation
     */
    CocosAnimationRuntimeExtension.prototype.resume = function () {
        this.paused = false;
    };
    /**
     * Reset animation
     */
    CocosAnimationRuntimeExtension.prototype.reset = function () {
        this.elapsedTime = 0;
    };
    /**
     * Returns index of current key frame
     * current key frame is calcurated by elapsed time and animation fps
     */
    CocosAnimationRuntimeExtension.prototype.getCurrentFrameIndex = function (keyFrames, elapsedTime, fps) {
        var spf = 1.0 / fps;
        for (var i = keyFrames.length - 1; i >= 0; i--) {
            // 60fps: 0.1 = 6 frames, 0.016 * 6 sec
            // 30fps: 0.1 = 3 frames, 0.033 * 3 sec
            var keyFrame = keyFrames[i];
            var keyFrameTime = spf * (fps * keyFrame.frame);
            if (keyFrameTime < elapsedTime) {
                return i;
            }
        }
        return -1;
    };
    /**
     * Update animation if possible
     */
    CocosAnimationRuntimeExtension.prototype.update = function (dt) {
        if (this.paused) {
            return;
        }
        this.elapsedTime += dt * this.spf;
        var activeCurveExists = false;
        var properties = Object.keys(this.animation.curves);
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            var curve = this.animation.curves[property];
            var currentFrameIndex = this.getCurrentFrameIndex(curve.keyFrames, this.elapsedTime, this.animation.sample);
            if (currentFrameIndex === -1) {
                continue;
            }
            var curveFuncs = this.curveFuncsMap.get(property);
            if (!curveFuncs || curveFuncs.length == 0) {
                continue;
            }
            var nextFrame = void 0;
            var currentFrame = curve.keyFrames[currentFrameIndex];
            var timeRatio = 0.0;
            // last frame
            if (currentFrameIndex >= curve.keyFrames.length - 1) {
                nextFrame = currentFrame;
                currentFrame = curve.keyFrames[currentFrameIndex - 1];
                timeRatio = 1.0;
            }
            else {
                var currentKeyFrameAsTime = this.animationFrameTime * (this.animation.sample * currentFrame.frame);
                nextFrame = curve.keyFrames[currentFrameIndex + 1];
                // time_ratio = time_from_current_key_frame / time_to_next_frame
                timeRatio =
                    // time_from_current_key_frame
                    (this.elapsedTime - currentKeyFrameAsTime) /
                        // time_to_next_frame = next_key_frame_as_time - current_key_frame_as_time
                        (
                        // next_key_frame_as_time
                        (this.animationFrameTime * (this.animation.sample * nextFrame.frame)) -
                            currentKeyFrameAsTime);
                activeCurveExists = true;
            }
            var targetValue = nextFrame.value;
            var currentValue = currentFrame.value;
            var curveFunc = curveFuncs[currentFrameIndex];
            var params = {
                target: this.target,
                animationProperty: property,
                currentValue: currentValue,
                targetValue: targetValue,
                timeRatio: timeRatio,
                curveFunc: curveFunc
            };
            var convertInfo = CocosAnimationRuntimeExtension.getAnimationPropertyConversionInfoSet(params);
            convertInfo.forEach(function (item) {
                item.target[item.key] = item.value;
            });
        }
        if (!activeCurveExists) {
            this.paused = true;
        }
    };
    CocosAnimationRuntimeExtension.getPrimitiveAnimationPropertyConversionInfo = function (params) {
        var valueDistance = params.targetValue - params.currentValue;
        var value = params.currentValue + valueDistance * params.curveFunc(params.timeRatio);
        switch (params.animationProperty) {
            case 'x': return {
                target: params.target.position,
                key: params.animationProperty,
                value: value
            };
            case 'y': return {
                target: params.target.position,
                key: params.animationProperty,
                value: value * -1
            };
            case 'rotation': return {
                target: params.target,
                key: params.animationProperty,
                value: value * DEGREE_TO_RADIAN
            };
            case 'opacity': return {
                target: params.target.position,
                key: 'alpha',
                value: value / 255
            };
            default: return {
                target: params.target,
                key: params.animationProperty,
                value: value
            };
        }
    };
    CocosAnimationRuntimeExtension.getObjectAnimationPropertyConversionInfoSet = function (params) {
        var convertInfo = new Set();
        var targetValueObject = params.targetValue;
        var currentValueObject = params.currentValue;
        if (params.animationProperty === 'color') {
            var curvedRatio = params.curveFunc(params.timeRatio);
            if ('tint' in params.target) {
                var currentColorRatio = {
                    r: currentValueObject.r / 255,
                    g: currentValueObject.g / 255,
                    b: currentValueObject.b / 255
                };
                var targetColorRatio = {
                    r: targetValueObject.r / 255,
                    g: targetValueObject.g / 255,
                    b: targetValueObject.b / 255
                };
                var addingColor = {
                    r: 0xff0000 * ((targetColorRatio.r - currentColorRatio.r) * curvedRatio),
                    g: 0x00ff00 * ((targetColorRatio.g - currentColorRatio.g) * curvedRatio),
                    b: 0x0000ff * ((targetColorRatio.b - currentColorRatio.b) * curvedRatio)
                };
                convertInfo.add({
                    target: params.target,
                    key: 'tint',
                    value: (currentColorRatio.r / 0xff0000) + (addingColor.r - addingColor.r % 0x010000) +
                        (currentColorRatio.g / 0x00ff00) + (addingColor.g - addingColor.g % 0x000100) +
                        (currentColorRatio.b / 0x0000ff) + addingColor.b
                });
            }
        }
        else {
            var keys = Object.getOwnPropertyNames(currentValueObject);
            for (var j = 0; j < keys.length; j++) {
                var key = keys[j];
                var valueDistance = targetValueObject[key] - currentValueObject[key];
                var value = currentValueObject[key] + valueDistance * params.curveFunc(params.timeRatio);
                convertInfo.add({
                    target: params.target[params.animationProperty],
                    key: key,
                    value: value
                });
            }
        }
        return convertInfo;
    };
    CocosAnimationRuntimeExtension.getAnimationPropertyConversionInfoSet = function (params) {
        if (typeof params.currentValue === 'number') {
            var convertInfoSet = new Set();
            var info = CocosAnimationRuntimeExtension.getPrimitiveAnimationPropertyConversionInfo(params);
            convertInfoSet.add(info);
            return convertInfoSet;
        }
        return CocosAnimationRuntimeExtension.getObjectAnimationPropertyConversionInfoSet(params);
    };
    return CocosAnimationRuntimeExtension;
}());
/* harmony default export */ __webpack_exports__["default"] = (CocosAnimationRuntimeExtension);
;


/***/ }),

/***/ "./src/Easing.ts":
/*!***********************!*\
  !*** ./src/Easing.ts ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/**
 * Collection of easing functions.
 */
var Easing = {
    linear: function (ratio) {
        return ratio;
    },
    quadOut: function (ratio) {
        return ratio * (2 - ratio);
    }
};
/* harmony default export */ __webpack_exports__["default"] = (Easing);


/***/ }),

/***/ "./src/besier.ts":
/*!***********************!*\
  !*** ./src/besier.ts ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return bezierByTime; });
var tau = 2 * Math.PI;
function crt(v) {
    return (v < 0) ? -Math.pow(-v, 1 / 3) : Math.pow(v, 1 / 3);
}
function cardano(curve, ratio) {
    var pa = ratio;
    var pb = ratio - curve[0];
    var pc = ratio - curve[2];
    var pd = ratio - 1;
    // to [t^3 + at^2 + bt + c] form:
    var pa3 = pa * 3;
    var pb3 = pb * 3;
    var pc3 = pc * 3;
    var d = (-pa + pb3 - pc3 + pd);
    var rd = 1 / d;
    var r3 = 1 / 3;
    var a = (pa3 - 6 * pb + pc3) * rd;
    var a3 = a * r3;
    var b = (-pa3 + pb3) * rd;
    var c = pa * rd;
    // then, determine p and q:
    var p = (3 * b - a * a) * r3;
    var p3 = p * r3;
    var q = (2 * a * a * a - 9 * a * b + 27 * c) / 27;
    var q2 = q / 2;
    // and determine the discriminant:
    var discriminant = q2 * q2 + p3 * p3 * p3;
    // If the discriminant is negative, use polar coordinates
    // to get around square roots of negative numbers
    if (discriminant < 0) {
        var mp3 = -p * r3;
        var mp33 = mp3 * mp3 * mp3;
        var r = Math.sqrt(mp33);
        // compute cosphi corrected for IEEE float rounding:
        var t = -q / (2 * r);
        var cosphi = t < -1 ? -1 : t > 1 ? 1 : t;
        var phi = Math.acos(cosphi);
        var crtr = crt(r);
        var t1 = 2 * crtr;
        var x1 = t1 * Math.cos(phi * r3) - a3;
        var x2 = t1 * Math.cos((phi + tau) * r3) - a3;
        var x3 = t1 * Math.cos((phi + 2 * tau) * r3) - a3;
        // choose best percentage
        if (0 <= x1 && x1 <= 1) {
            if (0 <= x2 && x2 <= 1) {
                return (0 <= x3 && x3 <= 1) ? Math.max(x1, x2, x3) : Math.max(x1, x2);
            }
            else {
                return (0 <= x3 && x3 <= 1) ? Math.max(x1, x3) : x1;
            }
        }
        else {
            if (0 <= x2 && x2 <= 1) {
                return (0 <= x3 && x3 <= 1) ? Math.max(x2, x3) : x2;
            }
            else {
                return x3;
            }
        }
    }
    else if (discriminant === 0) {
        var u1 = q2 < 0 ? crt(-q2) : -crt(q2);
        var x1 = 2 * u1 - a3;
        var x2 = -u1 - a3;
        // choose best percentage
        if (0 <= x1 && x1 <= 1) {
            return (0 <= x2 && x2 <= 1) ? Math.max(x1, x2) : x1;
        }
        else {
            return x2;
        }
    }
    else {
        // one real root, and two imaginary roots
        var sd = Math.sqrt(discriminant);
        return crt(-q2 + sd) - crt(q2 + sd) - a3;
    }
}
function bezierByTime(controlPoints, ratio) {
    var percent = cardano(controlPoints, ratio); // t
    // var p0y = 0;                // a
    // const p1y = controlPoints[1]; // b
    // const p2y = controlPoints[3]; // c
    // var p3y = 1;                // d
    var t1 = 1 - percent;
    return /* 0 * t1 * t1 * t1 + */ controlPoints[1] * 3 * percent * t1 * t1 +
        controlPoints[3] * 3 * percent * percent * t1 +
        /* 1 * */ percent * percent * percent;
}


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _CocosAnimationRuntime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CocosAnimationRuntime */ "./src/CocosAnimationRuntime.ts");

/* harmony default export */ __webpack_exports__["default"] = (_CocosAnimationRuntime__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ })

/******/ });
});
//# sourceMappingURL=scene-graph-cocos-animation-rt.js.map