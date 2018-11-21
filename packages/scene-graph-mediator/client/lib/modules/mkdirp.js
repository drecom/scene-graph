"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
function mkdirp(target) {
    var directories = target.split(path.sep);
    var makingDirectories = [];
    var tempRoot = target;
    while (!fs.existsSync(tempRoot)) {
        var dir = directories.pop();
        if (!dir)
            break;
        makingDirectories.push(dir);
        tempRoot = directories.join(path.sep);
    }
    while (makingDirectories.length > 0) {
        var dir = makingDirectories.pop();
        if (!dir)
            break;
        tempRoot = path.join(tempRoot, dir);
        fs.mkdirSync(tempRoot);
    }
}
exports.default = mkdirp;
//# sourceMappingURL=mkdirp.js.map