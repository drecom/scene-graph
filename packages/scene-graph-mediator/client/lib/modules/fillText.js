"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
String.prototype.fillLeft = function (word, count) {
    var input = this;
    // check arg
    if (word.length === 0) {
        return input;
    }
    // ERROR
    if (word.length > 1) {
        throw new Error('[fillText.length] the arg allow \'length <= 1\' -> \
    (inputed: ${ word.length } )');
    }
    if (count < 0) {
        throw new Error('[fillText.count] the arg allow \'integer\' and \'over than 0\' -> \
    (inputed: + ${ count } + )');
    }
    input = word.repeat(count) + input;
    return input.slice(-count);
};
String.prototype.fillRight = function (word, count) {
    var input = this;
    // check arg
    if (word.length === 0) {
        return input;
    }
    // ERROR
    if (word.length > 1) {
        throw new Error('[fillText.length] the arg allow \'length <= 1\' ->\
     (inputed: ${ word.length })');
    }
    if (count < 0) {
        throw new Error('[fillText.count] the arg allow \'integer\' and \'over than 0\' -> \
    (inputed: ${ count })');
    }
    input += word.repeat(count);
    return input.substr(0, count);
};
function dummy() { }
exports.default = dummy;
//# sourceMappingURL=fillText.js.map