
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
  this.nconf = app.nconf;
  this.client = null;
  this.schema = null;
};

Database.schema = new Schema(Redis, {});

Database.prototype.constructor = Database;

Database.prototype.init = function(next) {
  var options = this.nconf.get('redis:options'),
      host = this.nconf.get('redis:host'),
      port = this.nconf.get('redis:port'),
      password = this.nconf.get('redis:password'),
      db = parseInt(this.nconf.get('redis:database'), 10),
      client = redis.createClient(port, host, options);

  // redis init
  this.client = client;
  this.client.on('error', this.error);
  this.client.on('end', this.end);
  password && this.client.auth(password);

  // caminte init
  this.schema = Database.schema;
  this.schema.client = this.client;
  this.schema.settings.database = db;
  this.schema.adapter.initialize(this.client);
  var scope = this;
  this.schema.on('connected', function() {
    winston.info('[Database] Redis client ready...');
    //this.client.set('myKey', 'Hello Redis5', function (err, repl) {
    //  if (err) {
    //    console.log('Some error: ' + err);
    //  } else {
    //    scope.client.get('sess:tb4drmggrdJdLzIgjJ7xuctBJZqL7EEU', function (err, repl) {
    //      if (err) {
    //        console.log('Error: ' + err);
    //      } else if (repl) {
    //        console.log('Key: ' + repl);
    //      } else {
    //        console.log('Key not found.' + repl);
    //
    //      };
    //    });
    //    scope.client.keys('*', function (err, repl) {
    //      if (err) {
    //        console.log('Error: ' + err);
    //      } else if (repl) {
    //        console.log('Keys: ' + repl);
    //      } else {
    //        console.log('Key not found.' + repl);
    //
    //      };
    //    });
    //  };
    //});
    next();
  });
};

Database.prototype.close = function() {
  this.client.quit();
};

Database.prototype.error = function(err) {
  winston.error('[Database] ' + err.message);
  switch(err.code) {
    case 'ECONNREFUSED':
      process.exit(1);
      break;
    default: break;
  }
};

Database.prototype.end = function() {
  winston.error('[Database] connection has ended.');
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
