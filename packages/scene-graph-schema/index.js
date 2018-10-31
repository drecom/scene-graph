(function(){
  var fs   = require('fs');
  var path = require('path');
  var JsonSchema = require('jsonschema');

  var validator = new JsonSchema.Validator();

  var baseSchemaFile = 'Schema.json';

  var rootDir        = __dirname;
  var definitionsDir = path.join(rootDir, 'definitions');

  var entities = fs.readdirSync(definitionsDir);
  var schemaPattern = /\.json$/;
  for (var i = 0; i < entities.length; i++) {
    var entity = entities[i];
    if (schemaPattern.test(entity)) {
      var json = fs.readFileSync(path.join(definitionsDir, entity));
      validator.addSchema(JSON.parse(json));
    }
  }

  var schemaJson = fs.readFileSync(path.join(rootDir, baseSchemaFile));
  var schema     = JSON.parse(schemaJson);

  module.exports = {
    validateSchema: function validate(sceneDto) {
      return validator.validate(sceneDto, schema);
    },
    validateHierarchy: function validate(sceneDto) {
      var map = new Map();
      for (let i = 0; i < sceneDto.scene.length; i++) {
        var entity = sceneDto.scene[i];
        map.set(entity.id, entity);
      }

      var validity = true;
      map.forEach(function(entity, id){
        if (!validity) {
          return;
        }

        var parentId    = entity.transform.parent;
        var childrenIds = entity.transform.children;

        // check parent relation
        if (parentId) {
          var parent = map.get(parentId);
          if (!parent) {
            validity = false;
            return;
          }

          if (!parent.transform.children || parent.transform.children.indexOf(id) === -1) {
            validity = false;
            return;
          }
        }
        // check children relation
        if (childrenIds) {
          for (var i = 0; i < childrenIds.length; i++) {
            var child = map.get(childrenIds[i]);
            if (!child) {
              validity = false;
              return;
            }
            if (child.transform.parent !== id) {
              validity = false;
              return;
            }
          }
        }
      });

      return validity;
    },
  };
}());
