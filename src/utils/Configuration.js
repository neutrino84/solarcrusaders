
var winston = require('winston'),
    nconf = require('nconf');

function Configuration() {
  this.settings = {};
  this.database = global.app.database;
}

Configuration.prototype.constructor = Configuration;

Configuration.prototype.init = function(callback) {
  var self = this;
  this.list(function(err, settings) {
    if(err) { return callback(err); }
    self.settings = settings;
    // self.config['cache-buster'] = utils.generateUUID();
    callback();
  });
};

Configuration.prototype.list = function(callback) {
  this.database.getObject('config', function(err, config) {
    config = config || {};
    config.version = nconf.get('version');
    callback(err, config);
  });
};

Configuration.prototype.get = function(field, callback) {
  this.database.getObjectField('config', field, callback);
};

Configuration.prototype.getFields = function(fields, callback) {
  this.database.getObjectFields('config', fields, callback);
};

Configuration.prototype.set = function(field, value, callback) {
  callback = callback || function() {};
  
  if(!field) { return callback(new Error('[[error:no-configuration-field-set]]')); }

  this.database.setObjectField('config', field, value, function(err) {
    if(err) { return callback(err); }
    var data = {};
        data[field] = value;
        // updateConfig(data);
    callback();
  });
};

module.exports = Configuration;
