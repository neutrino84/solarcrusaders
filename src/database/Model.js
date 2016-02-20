
var List = require('caminte/lib/list');

var Model = function() {}

Model.prototype.toStreamObject = function() {
  var data = {},
      ds = this.constructor.schema.definitions[this.constructor.modelName],
      properties = ds.properties,
      self = this;
  this.constructor.forEachProperty(function(attr) {
    if(self[attr] instanceof List) {
      data[attr] = self[attr].toObject();
    } else if(self.__data.hasOwnProperty(attr)) {
      if(attr !== 'id' && attr !== 'password' && attr.indexOf('fk_') !== 0) {
        data[attr] = self[attr];
      }
    } else {
      data[attr] = null;
    }
  });
  return data;
};

module.exports = Model;
