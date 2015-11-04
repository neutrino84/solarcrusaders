var path = require('path'),
    http = require('http'),
    express = require('express'),
    session = require('express-session'),
    compression = require('compression'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    
    // Model = require('./objets/Model'),
    Authentication = require('./controllers/Authentication'),
    
    publicDir = path.resolve('public'),
    viewsDir = path.resolve('views');

function Server(app) {
  this.app = app;
  this.database = app.database;

  this.express = express();
  this.session = session({
    name: 'solar.sid',
    store: app.database.sessionStore,
    secret: app.nconf.get('secret'),
    cookie: { path: '/', httpOnly: true, secure: false, maxAge: 86400000 },
    saveUninitialized: true,
    proxy: true,
    resave: false,
    rolling: true
  });

  this.http = http.createServer(this.express);

  // controllers
  this.authentication = new Authentication();
};

Server.prototype.constructor = Server;

Server.prototype.init = function(next) {
  var self = this;

  this.express.set('trust proxy', 1);
  this.express.set('views', viewsDir);
  this.express.set('view engine', 'jade');

  this.express.use(favicon(publicDir + '/favicon.ico', { maxAge: 0 }));
  this.express.use(bodyParser.json());
  this.express.use(cookieParser());
  this.express.use(compression());
  this.express.use(express.static(publicDir));
  this.express.use(this.session);

  /*
   * API Calls
   */
  this.express.post('/login', function(req, res, next) {
    self.authentication.login(req, res, next);
  });

  this.express.post('/register', function(req, res, next) {
    self.authentication.register(req, res, next);
  });

  this.express.post('/logout', function(req, res, next) {
    self.authentication.logout(req, res, next);
  });

  /*
   * Core Routes
   */
  // this.express.get('/', function(req, res, next) {
  //   // create guest user
  //   if(!req.session.user || (!req.session.user.uid && !req.session.user.uuid)) {
  //     req.session.user = User.createDefaultData();
  //   }
  //   next();
  // });

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
    self.app.winston.error('[Server] ' + err.message);
    res.json({
      error: err.message
    });
  });

  next();
};

Server.prototype.listen = function(port) {
  this.http.listen(port);
};

module.exports = Server;
