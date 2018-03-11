
var winston = require('winston'),
    redis = require('redis'),
    caminte = require('caminte'),
    Redis = require('./Redis'),
    Model = require('./Model'),
    Utils = require('../utils'),
    Schema = caminte.Schema,
    AbstractClass = caminte.AbstractClass;

    // extend caminte
    AbstractClass.prototype.toStreamObject = Model.prototype.toStreamObject;

function Database(app) {
  this.app = app;
  this.logger = app.logger;
  this.nconf = app.nconf;
  this.client = null;
  this.schema = null;
};

Database.schema = new Schema(Redis, {});

Database.prototype.constructor = Database;

Database.prototype.init = function(next) {
  var logger = this.logger,
      options = this.nconf.get('redis:options'),
      host = this.nconf.get('redis:host'),
      port = this.nconf.get('redis:port'),
      password = this.nconf.get('redis:password'),
      db = parseInt(this.nconf.get('redis:database'), 10),
      client = redis.createClient(port, host, options);

  // redis init
  this.client = client;
  this.client.on('error', this.error);
  this.client.on('end', this.end);
  
  // authenticate redis
  if(password != '') {
    this.client.auth(password);
  }

  // caminte init
  this.schema = Database.schema;
  this.schema.client = this.client;
  this.schema.settings.database = db;
  this.schema.adapter.initialize(this.client);
  this.schema.on('connected', function() {
    logger.info('[Database] Redis client ready...');
    next();
  });
};

Database.prototype.close = function() {
  this.client.quit();
};

Database.prototype.error = function(err) {
  this.logger.error('[Database] ' + err.message);
  switch(err.code) {
    case 'ECONNREFUSED':
      process.exit(1);
      break;
    default: break;
  }
};

Database.prototype.end = function() {
  this.logger.error('[Database] connection has ended.');
};

Database.prototype.info = function(callback) {
  this.client.info(function(err, data) {
    if(err) { return callback(err); }

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

module.exports = Database;
