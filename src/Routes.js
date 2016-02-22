
var Authentication = require('./controllers/Authentication'),
    Latency = require('./controllers/Latency'),
    Utils = require('./utils');

function Routes(app) {
  this.app = app;
  this.express = app.server.express;
  this.play = app.server.play;
  this.iorouter = app.sockets.iorouter;
  this.io = app.sockets.io;
  this.game = app.game;
  
  this.authentication = new Authentication(this);
  this.latency = new Latency(this);
};

Routes.DESCRIPTION =
  'Solar Crusaders is a multiplayer top-down strategy game featuring ' +
  'a sandbox universe, base building, and exploration.';

Routes.prototype.constructor = Routes;

Routes.prototype.init = function(next) {
  var self = this,
      routeParameters = {
        description: Routes.DESCRIPTION,
        production: this.app.nconf.get('production')
      };

  /*
   * Initialize controllers
   */
  this.authentication.init();
  this.latency.init();

  /*
   * API Calls
   */
  this.express.post('/login', function(req, res, next) {
    self.authentication.login(req, res, next);
  });

  this.express.post('/register', function(req, res, next) {
    self.authentication.register(req, res, next);
  });

  this.express.get('/logout', function(req, res, next) {
    self.authentication.logout(req, res, next);
  });

  /*
   * Website
   */
  this.express.get('/', function(req, res, next) {
    res.render('index',
      Utils.extend({
        title: 'Solar Crusaders by Puremana Studios'
      }, routeParameters));
  });

  this.express.get('*', function(req, res, next) {
    res.redirect('/');
  });

  /*
   * Play Subdomain
   */
  this.play.get('/', function(req, res, next) {
    res.render('play',
      Utils.extend({
        title: 'Play Solar Crusaders',
        user: req.session.user && req.session.user.role !== 'guest' ? true : false
      }, routeParameters));
  });

  this.play.get('*', function(req, res, next) {
    res.redirect('/');
  });

  /*
   * Error
   */
  this.express.use(function(err, req, res, next) {
    self.app.winston.error('[Routes] ' + err.message + ' --- ' + err.stack);
    res.json({ error: err.message });
  });

  /*
   * Core IO Routes
   */
  this.iorouter.on(function(sock, args) {
    self.app.winston.info('[Server] Uncaught socket message: ' + args[0]);
  });

  this.iorouter.on(function(err, sock, args, next) {
    sock.emit(args[0], {
      error: error.message
    });
    next();
  });

  next();
};

module.exports = Routes;
