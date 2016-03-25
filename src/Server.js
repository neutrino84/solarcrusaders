var path = require('path'),
    http = require('http'),
    url = require('url'),
    express = require('express'),
    subdomain = require('express-subdomain'),
    session = require('express-session'),
    connectRedis = require('connect-redis')(session);
    compression = require('compression'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),

    publicDir = path.resolve('public'),
    viewsDir = path.resolve('views');

function Server(app) {
  this.app = global.app;
  this.database = global.app.database;
  this.nconf = global.app.nconf;

  this.express = express();
  this.play = new express.Router();
};

Server.prototype.constructor = Server;

Server.prototype.init = function(next) {
  var self = this,
      href = url.parse(this.nconf.get('url'));

  this.sessionStore = new connectRedis({
    client: this.database.client,
    ttl: 60 * 60 * 24 * 14,
    db: parseInt(this.nconf.get('redis:database'), 10)
  });

  this.session = session({
    name: 'solar.sid',
    store: this.sessionStore,
    secret: app.nconf.get('secret'),
    cookie: {
      path: '/',
      domain : '.' + href.hostname,
      httpOnly: true,
      secure: false,
      maxAge: 86400000
    },
    saveUninitialized: false,
    proxy: true,
    resave: false,
    unset: 'destroy',
    rolling: false
  });

  this.http = http.createServer(this.express);

  this.express.set('trust proxy', 1);
  this.express.set('views', viewsDir);
  this.express.set('view engine', 'jade');

  this.express.use(favicon(publicDir + '/favicon.ico', { maxAge: 0 }));
  this.express.use(bodyParser.json());
  this.express.use(cookieParser());
  this.express.use(compression());
  this.express.use(express.static(publicDir));
  this.express.use(this.session);

  this.express.use(subdomain('play', this.play));

  next();
};

Server.prototype.listen = function(port) {
  this.http.listen(port);
};

module.exports = Server;
