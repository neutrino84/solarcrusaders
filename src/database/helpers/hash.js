
var helpers = require('./');

module.exports = function(Redis) {

  Redis.prototype.setObject = function(key, data, callback) {
    callback = callback || function() {};
    this.client.hmset(key, data, function(err) {
      callback(err);
    });
  };

  Redis.prototype.setObjectField = function(key, field, value, callback) {
    callback = callback || function() {};
    this.client.hset(key, field, value, function(err) {
      callback(err);
    });
  };

  Redis.prototype.getObject = function(key, callback) {
    this.client.hgetall(key, callback);
  };

  Redis.prototype.getObjects = function(keys, callback) {
    helpers.multiKeys(this.client, 'hgetall', keys, callback);
  };

  Redis.prototype.getObjectField = function(key, field, callback) {
    this.getObjectFields(key, [field], function(err, data) {
      callback(err, data ? data[field] : null);
    });
  };

  Redis.prototype.getObjectFields = function(key, fields, callback) {
    this.getObjectsFields([key], fields, function(err, results) {
      callback(err, results ? results[0] : null);
    });
  };

  Redis.prototype.getObjectsFields = function(keys, fields, callback) {
    if(!Array.isArray(fields) || !fields.length) {
      return callback(null, keys.map(function() { return {}; }));
    }
    var  multi = this.client.multi();

    for(var x=0; x<keys.length; ++x) {
      multi.hmget.apply(multi, [keys[x]].concat(fields));
    }

    function makeObject(array) {
      var obj = {};

      for(var i=0, ii=fields.length; i<ii;++i) {
        obj[fields[i]] = array[i];
      }
      return obj;
    }

    multi.exec(function(err, results) {
      if(err) {
        return callback(err);
      }

      results = results.map(makeObject);
      callback(null, results);
    });
  };

  Redis.prototype.getObjectKeys = function(key, callback) {
    this.client.hkeys(key, callback);
  };

  Redis.prototype.getObjectValues = function(key, callback) {
    this.client.hvals(key, callback);
  };

  Redis.prototype.isObjectField = function(key, field, callback) {
    this.client.hexists(key, field, function(err, exists) {
      callback(err, exists === 1);
    });
  };

  Redis.prototype.isObjectFields = function(key, fields, callback) {
    helpers.multiKeyValues(this.client, 'hexists', key, fields, function(err, results) {
      callback(err, Array.isArray(results) ? helpers.resultsToBool(results) : null);
    });
  };

  Redis.prototype.deleteObjectField = function(key, field, callback) {
    callback = callback || function() {};
    this.client.hdel(key, field, function(err, res) {
      callback(err);
    });
  };

  Redis.prototype.deleteObjectFields = function(key, fields, callback) {
    helpers.multiKeyValues(this.client, 'hdel', key, fields, function(err, results) {
      callback(err);
    });
  };

  Redis.prototype.incrObjectField = function(key, field, callback) {
    this.client.hincrby(key, field, 1, callback);
  };

  Redis.prototype.decrObjectField = function(key, field, callback) {
    this.client.hincrby(key, field, -1, callback);
  };

  Redis.prototype.incrObjectFieldBy = function(key, field, value, callback) {
    this.client.hincrby(key, field, value, callback);
  };
  
};