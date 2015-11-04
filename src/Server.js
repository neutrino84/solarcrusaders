var path = require('path'),
    http = require('http'),
    express = require('express'),
    session = require('express-session'),
    compression = require('compression'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    
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

  next();
};

Server.prototype.listen = function(port) {
  this.http.listen(port);
};

module.exports = Server;
