
var helpers = require('./');

module.exports = function(Redis) {

  Redis.prototype.setAdd = function(key, value, callback) {
    callback = callback || function() {};
    this.client.sadd(key, value, function(err, res) {
      callback(err);
    });
  };

  Redis.prototype.setsAdd = function(keys, value, callback) {
    callback = callback || function() {};
    helpers.multiKeysValue(this.client, 'sadd', keys, value, function(err, res) {
      callback(err);
    });
  };

  Redis.prototype.setRemove = function(key, value, callback) {
    callback = callback || function() {};
    this.client.srem(key, value, function(err, res) {
      callback(err);
    });
  };

  Redis.prototype.setsRemove = function(keys, value, callback) {
    callback = callback || function() {};
    helpers.multiKeysValue(this.client, 'srem', keys, value, function(err, res) {
      callback(err);
    });
  };

  Redis.prototype.isSetMember = function(key, value, callback) {
    this.client.sismember(key, value, function(err, result) {
      callback(err, result === 1);
    });
  };

  Redis.prototype.isSetMembers = function(key, values, callback) {
    helpers.multiKeyValues(this.client, 'sismember', key, values, function(err, results) {
      callback(err, results ? helpers.resultsToBool(results) : null);
    });
  };

  Redis.prototype.isMemberOfSets = function(sets, value, callback) {
    helpers.multiKeysValue(this.client, 'sismember', sets, value, function(err, results) {
      callback(err, results ? helpers.resultsToBool(results) : null);
    });
  };

  Redis.prototype.getSetMembers = function(key, callback) {
    this.client.smembers(key, callback);
  };

  Redis.prototype.getSetsMembers = function(keys, callback) {
    helpers.multiKeys(this.client, 'smembers', keys, callback);
  };

  Redis.prototype.setCount = function(key, callback) {
    this.client.scard(key, callback);
  };

  Redis.prototype.setsCount = function(keys, callback) {
    helpers.multiKeys(this.client, 'scard', keys, callback);
  };

  Redis.prototype.setRemoveRandom = function(key, callback) {
    callback = callback || function() {};
    this.client.spop(key, callback);
  };

  return module;
};