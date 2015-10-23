
module.exports = function(Redis) {
  Redis.prototype.listPrepend = function(key, value, callback) {
    callback = callback || function() {};
    this.client.lpush(key, value, function(err, res) {
      callback(err);
    });
  };

  Redis.prototype.listAppend = function(key, value, callback) {
    callback = callback || function() {};
    this.client.rpush(key, value, function(err, res) {
      callback(err);
    });
  };

  Redis.prototype.listRemoveLast = function(key, callback) {
    callback = callback || function() {};
    this.client.rpop(key, callback);
  };

  Redis.prototype.listRemoveAll = function(key, value, callback) {
    callback = callback || function() {};
    this.client.lrem(key, 0, value, function(err, res) {
      callback(err);
    });
  };

  Redis.prototype.listTrim = function(key, start, stop, callback) {
    callback = callback || function() {};
    this.client.ltrim(key, start, stop, function(err, res) {
      callback(err);
    });
  };

  Redis.prototype.getListRange = function(key, start, stop, callback) {
    callback = callback || function() {};
    this.client.lrange(key, start, stop, callback);
  };
};
