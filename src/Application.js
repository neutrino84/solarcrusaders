
var path = require('path'),
    async = require('async'),
    nconf = require('nconf'),
    winston = require('winston'),
    pkg = require('../package.json'),

    configFilePath = path.join(__dirname, '/../config.json'),

    Game = require('./core/Game'),
    Database = require('./database'),
    Configuration = require('./utils/Configuration');

function Application() {
  this.server = null;
  this.database = null;
  this.configuration = null;
};

Application.prototype.constructor = Application;

Application.prototype.init = function() {
  global.env = process.env.NODE_ENV || 'production';

  nconf.argv().env('__');
  nconf.file({ file: configFilePath });
  nconf.defaults({
    version: pkg.version
  });

  if(!nconf.get('isCluster')) {
    nconf.set('isPrimary', 'true');
    nconf.set('isCluster', 'false');
  }
  
  // add process listeners
  process.on('SIGTERM', this.shutdown.bind(this));
  process.on('SIGINT', this.shutdown.bind(this));
  process.on('SIGHUP', this.restart.bind(this));

  process.on('message', this.message.bind(this));
  process.on('uncaughtException', this.exception.bind(this));
}

Application.prototype.start = function() {
  var self = this;
  async.waterfall([
    function(next) {
      var database = self.database = new Database();
          database.init(next);
      winston.info('[Application] Database client starting...');
    },
    function(next) {
      var configuration = self.configuration = new Configuration();
          configuration.init(next);
      winston.info('[Application] Configuration loading...');
    },
    function(next) {
      var game = self.game = new Game();
          game.init();
      next();
      winston.info('[Application] Game engine started...');
    },
    function(next) {
      var server = self.server = require('./Server');
          server.listen(process.env.port);
      next();
      winston.info('[Application] Starting webserver on port ' + process.env.port + ' [' + global.process.pid + ']');
    }
  ], function(err) {
    if(err) {
      winston.error('[Application] ' + err.message);
      switch(err.message) {
        default:
          if(err.stacktrace !== false) {
            winston.error('[Application] ' + err.stack);
          } else {
            winston.error('[Application] ' + err.message);
          }
          break;
      }
      process.exit(0);
    }
  });
};

Application.prototype.message = function(message) {
  if(typeof message !== 'object') { return; }
  switch(message.action) {
    case 'reload':
      winston.info('[Application] reload.');
      break;
    default:
      winston.info('[Application] Process message ' + message.action + '.');
      break;
  }
};

Application.prototype.shutdown = function(code) {
  if(this.database !== null) {
    this.database.close();
    winston.info('[Application] Database connection closed.');
  }
  if(this.server !== null) {
    this.server.close();
    winston.info('[Application] Web server closed.');
  }
  winston.info('[Application] Shutdown complete.');
  process.exit(code || 0);
};

Application.prototype.restart = function() {
  if(process.send) {
    winston.info('[Application] Restarting...');
    process.send({ action: 'restart' });
  } else {
    winston.error('[Application] Could not restart server. Shutting down.');
    this.shutdown(1);
  }
};

Application.prototype.exception = function(err) {
  winston.error('[Application] ' + err.stack);
  this.shutdown(1);
};

module.exports = Application;
