var Authentication = require('./controllers/Authentication');

function Routes(app) {
  this.app = app;
  this.express = app.server.express;
  this.iorouter = app.sockets.iorouter;
  
  this.authentication = new Authentication(this);
};

Routes.prototype.constructor = Routes;

Routes.prototype.init = function(next) {
  var self = this;

  /*
   * Initialize controllers
   */
  this.authentication.init();

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
   * Core Routes
   */
  this.express.get('/', function(req, res, next) {
    res.render('index', {
      title: 'Solar Crusaders',
      description: 'A multiplayer strategy game featuring 4X gameplay, sandbox universe, and simulated virtual economy.',
      production: Boolean(process.env.PRODUCTION),
      user: req.session.user && req.session.user.uid ? true : false
    });
  });

  this.express.get('*', function(req, res, next) {
    res.redirect('/');
  });

  this.express.use(function(err, req, res, next) {
    self.app.winston.error('[Routes] ' + err.message + ' --- ' + err.stack);
    res.json({ error: err.message });
  });

  /*
   * Core IO Routes
   */
  this.iorouter.on('ping', function(sock, args, next) {
    sock.emit('pong', { now: global.Date.now() });
  });

  this.iorouter.on('user', function(sockets, args, next) {
    var sock = sockets.sock,
        session = sock.handshake.session;
    session.reload(function() {
      sockets.emit('user', {
        user: sockets.sock.handshake.session.user
      });
    });
  });

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
