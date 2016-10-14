
var path = require('path'),
    async = require('async'),
    nconf = require('nconf'),
    winston = require('winston'),
    pkg = require('../package.json'),

    configFilePath = path.join(__dirname, '/../config.json'),

    Database = require('./database'),
    Model = require('./model'),
    // Configuration = require('./Configuration'),
    Server = require('./Server'),
    Sockets = require('./Sockets'),
    Game = require('./core/Game'),
    Routes = require('./Routes');

function Application() {
  this.database = null;
  this.configuration = null;
  this.server = null;
  this.sockets = null;
  this.game = null;
  this.routes = null;
};

Application.prototype.constructor = Application;

Application.prototype.init = function() {
  global.env = process.env.NODE_ENV || 'production';
  process.env.port = process.env.port || 4567;

  nconf.argv().env('__');
  nconf.file({ file: configFilePath });
  nconf.defaults({
    version: pkg.version
  });

  if(!nconf.get('isCluster')) {
    nconf.set('isPrimary', 'true');
    nconf.set('isCluster', 'false');
  }

  this.nconf = nconf;
  this.winston = winston;
  
  // add process listeners
  process.on('SIGTERM', this.shutdown.bind(this));
  process.on('SIGINT', this.shutdown.bind(this));
  process.on('SIGHUP', this.restart.bind(this));

  process.on('message', this.message.bind(this));
  process.on('uncaughtException', this.exception.bind(this));
}

Application.prototype.start = function() {
  var self = this;

  // start
  async.waterfall([
    function(next) {
      self.database = new Database(self);
      self.database.init(next);

      winston.info('[Application] Connected database client...');
    },
    function(next) {
      self.model = new Model(self);
      self.model.init(next);

      winston.info('[Application] Models loaded...');
    },
    // function(next) {
    //   self.configuration = new Configuration(self);
    //   self.configuration.init(next);

    //   winston.info('[Application] Loaded configuration...');
    // },
    function(next) {
      self.server = new Server(self);
      self.server.init(next);
      
      winston.info('[Application] Starting web engine...');
    },
    function(next) {
      self.sockets = new Sockets(self);
      self.sockets.init(next);

      winston.info('[Application] Starting sockets engine...');
    },
    function(next) {

      self.game = new Game(self);
      self.game.init(next);

      winston.info('[Application] Started game engine...');
    },
    function(next) {
      self.routes = new Routes(self);
      self.routes.init(next);

      winston.info('[Application] Linking routes...');
    },
    function(next) {
      self.server.listen(process.env.port);
      next();

      winston.info('[Application] Listening on port ' + process.env.port + ' [' + global.process.pid + ']');
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
    this.server.http.close();
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
