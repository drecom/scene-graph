var fs   = require('fs');
var path = require('path');
var validator = require('../');

var rootDir    = path.resolve(path.join(__dirname, '..'));
var exampleDir = __dirname;

var validSchemaResult,    invalidSchemaResult;
var validHierarchyResult, invalidHierarchyResult;
TestDto: {
  var valid   = fs.readFileSync(path.join(exampleDir, 'valid_example.json'));
  var invalid = fs.readFileSync(path.join(exampleDir, 'invalid_example.json'));

  var validJson   = JSON.parse(valid);
  var invalidJson = JSON.parse(invalid);

  validSchemaResult   = validator.validateSchema(validJson);
  invalidSchemaResult = validator.validateSchema(invalidJson);
  validHierarchyResult = validator.validateHierarchy({
    "scene": [
      {
        "id": "Parent",
        "transform": {
          "children": [ "Child" ]
        }
      },
      {
        "id": "Child",
        "transform": {
          "parent": "Parent"
        }
      }
    ]
  });
  invalidHierarchyResult = validator.validateHierarchy({
    "scene": [
      {
        "id": "Parent",
        "transform": {
          "children": [ "Child" ]
        }
      },
      {
        "id": "Child",
        "transform": {}
      }
    ]
  });
}

Report: {
  var logLines = [];
  logLines.push("valid dto should not have any schema error");
  logLines.push("error count : " + validSchemaResult.errors.length);
  logLines.push("\n");
  logLines.push("invalid dto should have schema errors");
  for (var i = 0; i < invalidSchemaResult.errors.length; i++) {
    logLines.push(invalidSchemaResult.errors[i].stack);
  }
  logLines.push("\n");
  logLines.push("valid dto should not have any hierarchical error");
  logLines.push("is valid : " + validHierarchyResult);
  logLines.push("\n");
  logLines.push("invalid dto should have hierarchical error");
  logLines.push("is valid : " + invalidHierarchyResult);

  console.log(logLines.join("\n"));
}
