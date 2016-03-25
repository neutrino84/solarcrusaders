
var redis = require('redis'),
    utils = require('caminte/lib/utils'),
    helpers = utils.helpers;

exports.name = 'redis';
exports.toLowerCase = function() { return module.exports };

exports.initialize = function(schema, callback) {
  schema.adapter = new BridgeToRedis(schema, callback);
};

function Client(client, adapter) {
  this._client = client;
  this._adapter = adapter;
};

var commands = Object.keys(redis.Multi.prototype).filter(function(n) {
  return n.match(/^[a-z]/);
});

commands.forEach(function(cmd) {
  Client.prototype[cmd] = function(args, callback) {
    var c = this._client, log, cargs;
    if(typeof args === 'string') { args = [args]; }
    if(!args) { args = []; }
    
    var lstr = cmd.toUpperCase() + ' ' + args.map(function(a) {
      if(typeof a === 'object') { return JSON.stringify(a); }
      return a;
    }).join(' ');

    cargs = args.slice(0);
    cargs.push(function(err, replies) {
      if(err) { console.log(err); }
      callback && callback(err, replies);
    });
    c[cmd].apply(c, cargs);
  };
});

Client.prototype.multi = function(commands, callback) {
  if(commands.length === 0) {
    return callback && callback();
  }

  if(commands.length === 1) {
    return this[commands[0].shift().toLowerCase()].call(
      this, commands[0], callback && function(e, r) {
        callback(e, [r]);
      });
  }
  
  var lstr = 'MULTI\n  ' + commands.map(function(x) {
    return x.join(' ');
  }).join('\n  ') + '\nEXEC';

  this._client.multi(commands).exec(function(err, replies) {
    if(err) { console.log(err); }
    callback && callback(err, replies);
  });
};

Client.prototype.batch = function(commands, callback) {
  if(commands.length === 0) {
    return callback && callback();
  }

  if(commands.length === 1) {
    return this[commands[0].shift().toLowerCase()].call(
      this, commands[0], callback && function(e, r) {
        callback(e, [r]);
      });
  }

  this._client.batch(commands).exec(function(err, replies) {
    if(err) { console.log(err); }
    callback && callback(err, replies);
  });
};

Client.prototype.transaction = function() {
  return new Transaction(this);
};

function Transaction(client) {
  this._client = client;
  this._handlers = [];
  this._schedule = [];
}

Transaction.prototype.run = function(cb) {
  var t = this,
      atLeastOneHandler = false;
  switch(this._schedule.length) {
    case 0:
      return cb();
    case 1:
      return this._client[this._schedule[0].shift()].call(
          this._client,
          this._schedule[0],
          this._handlers[0] || cb);
    default:
      this._client.multi(this._schedule, function(err, replies) {
        if(err) {
          return cb(err);
        }
        replies.forEach(function(r, i) {
          if(t._handlers[i]) {
            atLeastOneHandler = true;
            t._handlers[i](err, r);
          }
        });
        if(!atLeastOneHandler) {
          cb(err);
        }
      });
  }
};

commands.forEach(function(k) {
  Transaction.prototype[k] = function(args, cb) {
    if(typeof args === 'string') {
      args = [args];
    }
    args.unshift(k);
    this._schedule.push(args);
    this._handlers.push(cb || false);
  };
});

function BridgeToRedis(schema, callback) {
  this.name = 'redis';
  this.indexes = {};
  this.schema = schema;
  this.callback = callback;
  this.models = {};
};

BridgeToRedis.prototype.initialize = function(client) {
  var callbackCalled = false,
      callback = this.callback,
      schema = this.schema,
      settings = schema.settings,
      database = settings.hasOwnProperty('database') && settings.database;

  this.client = new Client(client, this);

  client.on('connect', function() {
    if(database === false) {
      callback();
    } else if(database !== false) {
      schema.client.select(settings.database, callback);
    }
  });
};

BridgeToRedis.prototype.define = function(descr) {
  var m = descr.model.modelName,
      self = this;
      self.models[m] = descr;
      self.indexes[m] = {
        id: Number
      };
  Object.keys(descr.properties).forEach(function(prop) {
    if(descr.properties[prop].index) {
      self.indexes[m][prop] = descr.properties[prop].type;
    } else if(prop === 'id') {
      self.indexes[m][prop] = descr.properties[prop].type;
    }
  }.bind(this));
};

BridgeToRedis.prototype.defineForeignKey = function(model, key, cb) {
  this.indexes[model][key] = Number;
  cb(null, Number);
};

BridgeToRedis.prototype.forDatabase = function(model, data) {
  var p = this.models[model].properties;
  for(var i in data) {
    if(!p[i]) { continue; }
    if(typeof data[i] === 'undefined' || data[i] === null) {
      if(p[i].default || p[i].default === 0) {
        if(typeof p[i].default === 'function') {
          data[i] = p[i].default();
        } else {
          data[i] = p[i].default;
        }
      } else {
        data[i] = '';
        continue;
      }
    }
    switch((p[i].type.name || '').toString().toLowerCase()) {
      case 'date':
        if(data[i].getTime) {
          data[i] = data[i].getTime().toString();
        } else if(parseInt(data[i]) > 0) {
          data[i] = data[i].toString();
        } else {
          data[i] = '0';
        }
        break;
      case 'number':
        data[i] = data[i].toString();
        break;
      case 'boolean':
        data[i] = !!data[i] ? '1' : '0';
        break;
      case 'json':
        if(typeof data[i] === 'object') {
          data[i] = JSON.stringify(data[i]);
        }
        break;
      default:
        data[i] = data[i].toString();
        break;
    }
  }
  return data;
};

BridgeToRedis.prototype.fromDatabase = function(model, data) {
  var p = this.models[model].properties, d;
  for(var i in data) {
    if(!p[i]) { continue; }
    if(typeof data[i] === 'undefined' || data[i] === null) {
      if(p[i].default || p[i].default === 0) {
        if(typeof p[i].default === 'function') {
          data[i] = p[i].default();
        } else {
          data[i] = p[i].default;
        }
      } else {
        data[i] = '';
        continue;
      }
    }
    switch((p[i].type.name || '').toString().toLowerCase()) {
      case 'json':
        try {
          if(typeof data[i] === 'string') {
            data[i] = JSON.parse(data[i]);
          }
        } catch(err) {
        }
        break;
      case 'date':
        d = new Date(data[i]);
        d.setTime(data[i]);
        data[i] = d;
        break;
      case 'number':
        data[i] = Number(data[i]);
        break;
      case 'boolean':
        data[i] = data[i] === '1';
        break;
    }
  }
  return data;
};

BridgeToRedis.prototype.save = function(model, data, callback) {
  var self = this,
      schedule = [],
      copy = {},
      data = self.forDatabase(model, data);
  deleteNulls(data);
  self.client.hgetall(model + ':' + data.id, function(err, prevData) {
    if(err) { return callback(err); }
    schedule.push(['HMSET', model + ':' + data.id, data]);
    prevData && Object.keys(prevData)
      .forEach(function(k) {
        if(data.hasOwnProperty(k)) {
          copy[k] = data[k];
        } else {
          copy[k] = prevData[k];
        }
      });
    self.updateIndexes(model, data.id, prevData ? copy : data, callback, prevData, schedule);
  }.bind(this));
};

BridgeToRedis.prototype.uniqueIndexes = function(model, id, data) {
  var uniques = [],
      props = this.models[model].properties;
  for(var key in props) {
    if(props[key].unique) {
      uniques.push('indexes:' + model + ':' + key + ':' + data[key]);
    }
  }
  return uniques;
};

BridgeToRedis.prototype.updateIndexes = function(model, id, data, callback, prevData, schedule) {
  var indexes = this.indexes[model],
      schedule = schedule || [];
  
  if(!callback.removed) {
    schedule.push(['SADD', 'set:' + model, id]);
  }

  Object.keys(indexes).forEach(function(key) {
    if(data.hasOwnProperty(key)) {
      schedule.push(['SADD', 'indexes:' + model + ':' + key + ':' + data[key], id]);
    }
    if(prevData && prevData[key] !== data[key]) {
      schedule.push(['SREM', 'indexes:' + model + ':' + key + ':' + prevData[key], id]);
    }
  });

  if(schedule.length) {
    this.client.multi(schedule, function(err, reply) {
      callback(err, data);
    });
  } else {
    callback(null);
  }
};

BridgeToRedis.prototype.create = function(model, data, callback) {
  if(data.id) { return create.call(this, data.id, true); }
  
  this.client.incr('id:' + model, function(err, id) {
    if(err) { return callback(err); }
    var schedule = [],
        uniques = this.uniqueIndexes(model, id, data);
    if(uniques.length) {
      schedule.push(['WATCH'].concat(uniques));
      for(var u in uniques) {
        schedule.push(['SCARD', uniques[u]]);
      }
      this.client.batch(schedule, function(err, reply) {
        if(err) { return callback(err); }
        for(var r in reply) {
          if(reply[r] === 'OK') { continue; }
          if(reply[r] > 0) {
            return this.client.unwatch([], function() {
              callback('[Redis] unique property already set in database');
            });
          }
        }
        create.call(this, id);
      }.bind(this));
    } else {
      create.call(this, id);
    }
  }.bind(this));
  
  function create(id) {
    data.id = id.toString();
    this.save(model, data, function(err) {
      if(callback) {
        callback(err, parseInt(id, 10));
      }
    });
  };
};

BridgeToRedis.prototype.update = function(model, filter, data, callback) {
  if('function' === typeof filter) {
    callback = filter;
    filter = {};
  }
  if(!filter) { filter = {}; }
  if(!filter.where) { filter = { where : filter }; }
  
  var self = this;
      self.all(model, filter, function(err, found) {
        if(!found || !found.length) {
          return callback && callback(err);
        }
        var dlen = found.length;
        found.forEach(function(doc) {
          doc = helpers.merge(doc, data);
          self.save(model, doc, function(error) {
            if(--dlen === 0) {
              callback && callback(error);
            }
          });
        });
      });
};

BridgeToRedis.prototype.exists = function(model, id, callback) {
  this.client.exists(model + ':' + id, function(err, exists) {
    if(callback) { callback(err, exists ? true : false); }
  });
};

BridgeToRedis.prototype.findById = function findById(model, id, callback) {
  var self = this;
  self.client.hgetall(model + ':' + id, function(err, data) {
    if(data && Object.keys(data).length > 0) {
      data.id = id;
    } else {
      data = null;
    }
    data = self.fromDatabase(model, data);
    callback(err, data);
  }.bind(this));
};

BridgeToRedis.prototype.destroy = function destroy(model, id, callback) {
  var br = this;
  var trans = br.client.transaction();
  br.client.hgetall(model + ':' + id, function(err, data) {
    if(err) { return callback(err); }
    trans.srem(['set:' + model, id]);
    trans.del(model + ':' + id);
    trans.run(function(err) {
      if(err) { return callback(err); }
      callback.removed = true;
      br.updateIndexes(model, id, {}, callback, data);
    });
  });
};

BridgeToRedis.prototype.possibleIndexes = function(model, filter, callback) {
  if(!filter || Object.keys(filter.where || {}).length === 0) {
    return callback([], [], true);
  }

  var self = this,
      dest = 'where:' + (Date.now() * Math.random()),
      props = self.models[model].properties,
      compIndex = {},
      foundIndex = [],
      noIndex = [];

  Object.keys(filter.where).forEach(function(key) {
    var val, cin,
        index = self.indexes[model][key];
    if(index && typeof index !== 'undefined') {
      // index value
      val = filter.where[key];
      
      if(val && typeof val === 'object' && !val.getTime) {
        // compound index
        cin = 'indexes:' + model + ':' + key + ':';
        if(!compIndex[key]) {
          compIndex[key] = { conds: [] };
        }
        if(index.name === 'Date') {
          Object.keys(val).forEach(function(cndkey) {
            val[cndkey] = val[cndkey] && val[cndkey].getTime ? val[cndkey].getTime() : 0;
          });
        }
        compIndex[key].rkey = cin + '*';
        compIndex[key].fkey = cin;
        compIndex[key].type = props[key].type.name;
        compIndex[key].conds.push(val);
      } else {
        // regular index
        if(index.name === 'Date') {
          val = val && val.getTime ? val.getTime() : 0;
        }
        foundIndex.push('indexes:' + model + ':' + key + ':' + val);
      }
    } else {
      noIndex.push(key);
    }
  }.bind(this));

  if(Object.keys(compIndex || {}).length > 0) {
    var multi = self.client._client.multi();
    for (var ik in compIndex) {
      multi.keys(compIndex[ik].rkey);
    }
    multi.exec(function(err, mkeys) {
      if(err) { console.log(err); }
      var condIndex = [];
      for (var ic in compIndex) {
        var kregex = new RegExp('^' + compIndex[ic].fkey + '(.*)');
        if(mkeys) {
          for (var i in mkeys) {
            var keys = mkeys[i];
            if(keys.length) {
              keys.forEach(function(key) {
                if(kregex.test(key)) {
                  var fkval = RegExp.$1;
                  // if(compIndex[ic].type === 'Number' || compIndex[ic].type === 'Date') {
                  //     fkval = parseInt(fkval);
                  // }
                  if(helpers.parseCond(fkval, compIndex[ic].conds[0])) {
                    condIndex.push(key);
                  }
                }
              }.bind(this));
            }
          }
        }
      }
      condIndex.unshift(dest);
      self.client._client.sunionstore(condIndex, function(err, replies) {
        if(replies > 0) {
          foundIndex.push(dest);
        }
        callback([foundIndex, noIndex, [dest]]);
      });
    }.bind(this));
  } else {
    callback(foundIndex, noIndex);
  }
};

BridgeToRedis.prototype.all =
BridgeToRedis.prototype.find = function all(model, filter, callback) {
  if('function' === typeof filter) { callback = filter; filter = {}; }
  if(!filter) { filter = {}; }

  var self = this;
  var dest = 'temp:' + (Date.now() * Math.random());

  if(!filter) { filter = {}; }
  if(!filter.order) { filter.order = 'id'; }
  if(!filter.where) {
    dest = 'set:' + model;
    filter.where = {};
  }

  self.possibleIndexes(model, filter, function(indexes, noIndexes, bypass) {
    var client = self.client,
        sortCmd = [],
        allNumeric = true,
        reverse = false,
        props = self.models[model].properties,
        trans = self.client.transaction(),
        cmd, orders, offset, limit;

    // no index error
    if(noIndexes.length) {
      throw new Error(model + ': no indexes found for ' + noIndexes.join(', ') +
        ' impossible to sort and filter using redis adapter');
    }

    // temp
    if(!bypass) {
      if(indexes && indexes.length > 0) {
        indexes.unshift(dest);
        trans.sinterstore(indexes);
      } else {
        return callback(null, null);
      }
    }

    // only count
    if(filter.getCount) {
      trans.scard(dest, callback);
      return trans.run();
    }

    // order
    if(typeof filter.order === 'string') {
      orders = [filter.order];
    } else {
      orders = filter.order;
    }
    orders.forEach(function(key) {
      var match = key.match(/\s+(A|DE)SC$/i);
      if(match) {
        key = key.replace(/\s+(A|DE)SC/i, '');
        if(match[1] === 'DE') {
          reverse = true;
        }
      }
      if(key !== 'id') {
        if(props[key].type.name !== 'Number' && props[key].type.name !== 'Date') {
          allNumeric = false;
        }
      }
      sortCmd.push('BY', model + ':*->' + key);
    });

    // limit
    if(filter.limit) {
      offset = (filter.offset || filter.skip || 0);
      limit = filter.limit;
      sortCmd.push('LIMIT', offset, limit);
    }

    // alpha modifier
    if(!allNumeric) {
      sortCmd.push('ALPHA');
    }

    if(reverse) {
      sortCmd.push('DESC');
    }

    sortCmd.unshift(dest);
    sortCmd.push('GET', '#');
    cmd = 'SORT ' + sortCmd.join(' ');

    trans.sort(sortCmd, function(err, ids) {
      if(err) { return callback(err, []); }
      var sortedKeys = ids.map(function(i) {
        return model + ':' + i;
      });
      handleKeys(err, sortedKeys);
    }.bind(this));

    if(dest.match(/^temp/)) {
      trans.del(dest);
    }

    // if(indexes && indexes.length > 0) {
    //   indexes.forEach(function(idx) {
    //     if(idx.match(/^where/)) {
    //       trans.del(idx);
    //     }
    //   }.bind(this));
    // }

    // run
    trans.run(callback);
        
    function handleKeys(err, keys) {
      if(err) { console.log(err); }
      var query = keys.map(function(key) {
        return ['hgetall', key];
      });
      client.multi(query, function(err, replies) {
        callback(err, (replies || []).map(function(r) {
          return self.fromDatabase(model, r);
        }));
      }.bind(this));
    };

    // function numerically(a, b) {
    //   return a[this[0]] - b[this[0]];
    // };

    // function literally(a, b) {
    //   return a[this[0]] > b[this[0]];
    // };
  });
};

BridgeToRedis.prototype.remove = function remove(model, filter, callback) {
  var self = this;
  var dest = 'temp:' + (Date.now() * Math.random());
  self.possibleIndexes(model, filter, function(indexes, noIndexes) {
    var trans = self.client._client.multi();

    if(noIndexes.length) {
      throw new Error(model + ': no indexes found for ' + noIndexes.join(', ') +
        ' impossible to sort and filter using redis adapter');
    }

    if(indexes && indexes.length > 0) {
      if(indexes.length === 1) {
        indexes.unshift(dest);
        trans.sunionstore(indexes);
        trans.smembers(dest);
      } else {
        indexes.unshift(dest);
        trans.sinterstore(indexes);
      }
    } else {
      callback(null, null);
    }

    if(dest.match(/^temp/)) {
      trans.del(dest);
    }

    if(indexes && indexes.length > 0) {
      indexes.forEach(function(idx) {
        if(idx.match(/^where/)) {
          trans.del(idx);
        }
      }.bind(this));
    }

    trans.exec(function(err, result) {
      if(err) { console.log(err); }

      var found = result[1] || [],
          query = found.map(function(key) {
            return ['hgetall', (model + ':' + key)];
          });
      if(found && found.length > 0) {
        self.client.multi(query, function(err, replies) {
          var schedule = [];
          if(replies && replies.length > 0) {
            replies.forEach(function(reply) {
              if(reply) {
                schedule.push(['DEL', model + ':' + reply.id]);
                schedule.push(['SREM', 'set:' + model, reply.id]);
                Object.keys(reply).forEach(function(replyKey) {
                  schedule.push(['SREM', 'indexes:' + model + ':' + replyKey + ':' + reply[replyKey], reply.id]);
                }.bind(this));
              }
            }.bind(this));
            self.client.multi(schedule, callback);
          } else {
            callback(null);
          }
        }.bind(this));
      } else {
        callback(null);
      }
    });
  });
};

BridgeToRedis.prototype.destroyAll = function destroyAll(model, callback) {
  var br = this;
  br.client.multi([
    ['KEYS', model + ':*'],
    ['KEYS', '*:' + model + ':*']
  ], function(err, k) {
    br.client.del(k[0].concat(k[1]).concat('set:' + model), callback);
  });
};

BridgeToRedis.prototype.count = function count(model, callback, where) {
  if(where && Object.keys(where).length) {
    this.all(model, {where: where, getCount: true}, callback);
  } else {
    this.client.scard('set:' + model, callback);
  }
};

BridgeToRedis.prototype.updateAttributes = function updateAttrs(model, id, data, callback) {
  data.id = id;
  this.save(model, data, callback);
};

function deleteNulls(data) {
  Object.keys(data).forEach(function(key) {
    if(data[key] === null) {
      delete data[key];
    }
  });
}

BridgeToRedis.prototype.disconnect = function disconnect() {
  this.client.quit();
};