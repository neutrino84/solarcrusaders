
var helpers = require('./');

module.exports = function(Redis) {

  Redis.prototype.sortedSetAdd = function(key, score, value, callback) {
    callback = callback || function() {};
    if(Array.isArray(score) && Array.isArray(value)) {
      return sortedSetAddMulti(key, score, value, callback);
    }
    this.client.zadd(key, score, value, function(err) {
      callback(err);
    });
  };

  function sortedSetAddMulti(key, scores, values, callback) {
    if(!scores.length || !values.length) {
      return callback();
    }

    if(scores.length !== values.length) {
      return callback(new Error('[[error:invalid-data]]'));
    }

    var args = [key];

    for(var i=0; i<scores.length; ++i) {
      args.push(scores[i], values[i]);
    }

    this.client.zadd(args, function(err, res) {
      callback(err);
    });
  }

  Redis.prototype.sortedSetsAdd = function(keys, score, value, callback) {
    callback = callback || function() {};
    var multi = this.client.multi();

    for(var i=0; i<keys.length; ++i) {
      multi.zadd(keys[i], score, value);
    }

    multi.exec(function(err, res) {
      callback(err);
    });
  };

  Redis.prototype.sortedSetRemove = function(key, value, callback) {
    callback = callback || function() {};
    if(!Array.isArray(value)) {
      value = [value];
    }

    helpers.multiKeyValues(this.client, 'zrem', key, value, function(err, result) {
      callback(err);
    });
  };

  Redis.prototype.sortedSetsRemove = function(keys, value, callback) {
    helpers.multiKeysValue(this.client, 'zrem', keys, value, function(err, result) {
      callback(err);
    });
  };

  Redis.prototype.sortedSetsRemoveRangeByScore = function(keys, min, max, callback) {
    callback = callback || function() {};
    var multi = this.client.multi();
    for(var i=0; i<keys.length; ++i) {
      multi.zremrangebyscore(keys[i], min, max);
    }
    multi.exec(function(err, result) {
      callback(err);
    });
  };

  Redis.prototype.getSortedSetRange = function(key, start, stop, callback) {
    this.client.zrange(key, start, stop, callback);
  };

  Redis.prototype.getSortedSetRevRange = function(key, start, stop, callback) {
    this.client.zrevrange(key, start, stop, callback);
  };

  Redis.prototype.getSortedSetRangeWithScores = function(key, start, stop, callback) {
    sortedSetRangeWithScores('zrange', key, start, stop, callback);
  };

  Redis.prototype.getSortedSetRevRangeWithScores = function(key, start, stop, callback) {
    sortedSetRangeWithScores('zrevrange', key, start, stop, callback);
  };

  function sortedSetRangeWithScores(method, key, start, stop, callback) {
    this.client[method]([key, start, stop, 'WITHSCORES'], function(err, data) {
      if(err) {
        return callback(err);
      }
      var objects = [];
      for(var i=0; i<data.length; i+=2) {
        objects.push({value: data[i], score: data[i+1]});
      }
      callback(null, objects);
    });
  }

  Redis.prototype.getSortedSetRangeByScore = function(key, start, count, min, max, callback) {
    this.client.zrangebyscore([key, min, max, 'LIMIT', start, count], callback);
  };

  Redis.prototype.getSortedSetRevRangeByScore = function(key, start, count, max, min, callback) {
    this.client.zrevrangebyscore([key, max, min, 'LIMIT', start, count], callback);
  };

  Redis.prototype.getSortedSetRangeByScoreWithScores = function(key, start, count, min, max, callback) {
    sortedSetRangeByScoreWithScores('zrangebyscore', key, start, count, min, max, callback);
  };

  Redis.prototype.getSortedSetRevRangeByScoreWithScores = function(key, start, count, max, min, callback) {
    sortedSetRangeByScoreWithScores('zrevrangebyscore', key, start, count, max, min, callback);
  };

  function sortedSetRangeByScoreWithScores(method, key, start, count, min, max, callback) {
    this.client[method]([key, min, max, 'WITHSCORES', 'LIMIT', start, count], function(err, data) {
      if(err) {
        return callback(err);
      }
      var objects = [];
      for(var i=0; i<data.length; i+=2) {
        objects.push({value: data[i], score: data[i+1]});
      }
      callback(null, objects);
    });
  }

  Redis.prototype.sortedSetCount = function(key, min, max, callback) {
    this.client.zcount(key, min, max, callback);
  };

  Redis.prototype.sortedSetCard = function(key, callback) {
    this.client.zcard(key, callback);
  };

  Redis.prototype.sortedSetsCard = function(keys, callback) {
    if(Array.isArray(keys) && !keys.length) {
      return callback(null, []);
    }
    var multi = this.client.multi();
    for(var i=0; i<keys.length; ++i) {
      multi.zcard(keys[i]);
    }
    multi.exec(callback);
  };

  Redis.prototype.sortedSetRank = function(key, value, callback) {
    this.client.zrank(key, value, callback);
  };

  Redis.prototype.sortedSetsRanks = function(keys, values, callback) {
    var multi = this.client.multi();
    for(var i=0; i<values.length; ++i) {
      multi.zrank(keys[i], values[i]);
    }
    multi.exec(callback);
  };

  Redis.prototype.sortedSetRanks = function(key, values, callback) {
    var multi = this.client.multi();
    for(var i=0; i<values.length; ++i) {
      multi.zrank(key, values[i]);
    }
    multi.exec(callback);
  };

  Redis.prototype.sortedSetRevRank = function(key, value, callback) {
    this.client.zrevrank(key, value, callback);
  };

  Redis.prototype.sortedSetScore = function(key, value, callback) {
    this.client.zscore(key, value, callback);
  };

  Redis.prototype.sortedSetsScore = function(keys, value, callback) {
    helpers.multiKeysValue(this.client, 'zscore', keys, value, callback);
  };

  Redis.prototype.sortedSetScores = function(key, values, callback) {
    helpers.multiKeyValues(this.client, 'zscore', key, values, callback);
  };

  Redis.prototype.isSortedSetMember = function(key, value, callback) {
    this.sortedSetScore(key, value, function(err, score) {
      callback(err, !!score);
    });
  };

  Redis.prototype.isSortedSetMembers = function(key, values, callback) {
    helpers.multiKeyValues(this.client, 'zscore', key, values, function(err, results) {
      if(err) {
        return callback(err);
      }
      callback(null, results.map(Boolean));
    });
  };

  Redis.prototype.isMemberOfSortedSets = function(keys, value, callback) {
    helpers.multiKeysValue(this.client, 'zscore', keys, value, function(err, results) {
      if(err) {
        return callback(err);
      }
      callback(null, results.map(Boolean));
    });
  };

  Redis.prototype.getSortedSetsMembers = function(keys, callback) {
    var multi = this.client.multi();
    for (var i=0; i<keys.length; ++i) {
      multi.zrange(keys[i], 0, -1);
    }
    multi.exec(callback);
  };

  Redis.prototype.getSortedSetUnion = function(sets, start, stop, callback) {
    sortedSetUnion(sets, false, start, stop, callback);
  };

  Redis.prototype.getSortedSetRevUnion = function(sets, start, stop, callback) {
    sortedSetUnion(sets, true, start, stop, callback);
  };

  function sortedSetUnion(sets, reverse, start, stop, callback) {
    var  multi = this.client.multi();

    // zunionstore prep
    sets.unshift(sets.length);
    sets.unshift('temp');

    multi.zunionstore.apply(multi, sets);
    multi[reverse ? 'zrevrange' : 'zrange']('temp', start, stop);
    multi.del('temp');
    multi.exec(function(err, results) {
      callback(err, results ? results[1] : null);
    });
  }

  Redis.prototype.sortedSetIncrBy = function(key, increment, value, callback) {
    this.client.zincrby(key, increment, value, callback);
  };

  Redis.prototype.getSortedSetRangeByLex = function(key, min, max, start, count, callback) {
    if(min !== '-') {
      min = '[' + min;
    }
    if(max !== '+') {
      max = '(' + max;
    }
    this.client.zrangebylex([key, min, max, 'LIMIT', start, count], callback);
  };
};