
var winston = require('winston'),
    nconf = require('nconf'),
    path = require('path'),
    session = require('express-session'),
    redis = require('redis'),
    connectRedis = require('connect-redis')(session);

function Redis() {};

Redis.prototype.constructor = Redis;

Redis.prototype.init = function(next) {
  this.createConnection();
  this.sessionStore = new connectRedis({
    client: this.client,
    ttl: 60 * 60 * 24 * 14
  });

  if(typeof next === 'function') {
    this.client.once('ready', function() {
      winston.info('[Database] Redis Connection ready.');
      next();
    });
  }
};

Redis.prototype.createConnection = function(options) {
  var index,
      options = options || {},
      host = nconf.get('redis:host'),
      port = nconf.get('redis:port');
  
  this.client = redis.createClient(port, host, options);
  this.client.on('error', this.error);
  this.client.on('end', this.end);
  
  if(nconf.get('redis:password')) {
    this.client.auth(nconf.get('redis:password'));
  }
  
  index = parseInt(nconf.get('redis:database'), 10);
  if(index) {
    this.client.select(index, function(error) {
      if(error) {
        winston.error('[Database] Could not connect to database: ' + error.message);
        process.exit(1);
      }
    });
  }
  
  return this.client;
};

Redis.prototype.close = function() {
  this.client.quit();
};

Redis.prototype.error = function(err) {
  winston.error('[Database] ' + err.message);
  switch(err.code) {
    case 'ECONNREFUSED':
      process.exit(1);
      break;
    default: break;
  }
};

Redis.prototype.end = function() {
  winston.error('[Database] connection has ended.');
};

Redis.prototype.info = function(callback) {
  this.client.info(function(err, data) {
    if(err) {
      return callback(err);
    }

    var lines = data.toString().split("\r\n").sort();
    var redisData = {};
    
    lines.forEach(function(line) {
      var parts = line.split(':');
      if(parts[1]) {
        redisData[parts[0]] = parts[1];
      }
    });

    redisData.raw = JSON.stringify(redisData, null, 4);
    redisData.redis = true;

    callback(null, redisData);
  });
};

// initialize prototypes
require('./helpers/main')(Redis);
require('./helpers/hash')(Redis);
require('./helpers/sets')(Redis);
require('./helpers/sorted')(Redis);
require('./helpers/list')(Redis);

module.exports = Redis;
