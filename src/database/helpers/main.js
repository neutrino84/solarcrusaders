
module.exports = function(Redis) {

  Redis.prototype.flushdb = function(callback) {
    this.client.send_command('flushdb', [], function(err) {
      if (typeof callback === 'function') {
        callback(err);
      }
    });
  };

  Redis.prototype.exists = function(key, callback) {
    this.client.exists(key, function(err, exists) {
      callback(err, exists === 1);
    });
  };

  Redis.prototype.delete = function(key, callback) {
    callback = callback || function() {};
    this.client.del(key, function(err, res) {
      callback(err);
    });
  };

  Redis.prototype.deleteAll = function(keys, callback) {
    callback = callback || function() {};
    var multi = this.client.multi();
    for(var i=0; i<keys.length; ++i) {
      multi.del(keys[i]);
    }
    multi.exec(function(err, res) {
      callback(err);
    });
  };

  Redis.prototype.get = function(key, callback) {
    this.client.get(key, callback);
  };

  Redis.prototype.set = function(key, value, callback) {
    callback = callback || function() {};
    this.client.set(key, value, function(err) {
      callback(err);
    });
  };

  Redis.prototype.increment = function(key, callback) {
    callback = callback || function() {};
    this.client.incr(key, callback);
  };

  Redis.prototype.rename = function(oldKey, newKey, callback) {
    callback = callback || function() {};
    this.client.rename(oldKey, newKey, function(err, res) {
      callback(err && err.message !== 'ERR no such key' ? err : null);
    });
  };

  Redis.prototype.expire = function(key, seconds, callback) {
    callback = callback || function() {};
    this.client.expire(key, seconds, function(err) {
      callback(err);
    });
  };

  Redis.prototype.expireAt = function(key, timestamp, callback) {
    callback = callback || function() {};
    this.client.expireat(key, timestamp, function(err) {
      callback(err);
    });
  };

  Redis.prototype.pexpire = function(key, ms, callback) {
    callback = callback || function() {};
    this.client.pexpire(key, ms, function(err) {
      callback(err);
    });
  };

  Redis.prototype.pexpireAt = function(key, timestamp, callback) {
    callback = callback || function() {};
    this.client.pexpireat(key, timestamp, function(err) {
      callback(err);
    });
  };

};
