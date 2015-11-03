var path = require('path'),
    nconf = require('nconf'),
    express = require('express'),
    session = require('express-session'),
    compression = require('compression'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    winston = require('winston'),
    
    app = express(),
    server = require('http').createServer(app),
    
    io = require('socket.io')(server),
    iosess = require('socket.io-express-session'),
    iorouter = require('socket.io-events')(),

    Authentication = require('./controllers/Authentication'),
    
    publicDir = path.resolve('public'),
    viewsDir = path.resolve('views'),
    
    production = Boolean(process.env.PRODUCTION),
    sess = session({
      name: 'solar.sid',
      store: global.app.database.sessionStore,
      secret: nconf.get('secret'),
      cookie: { path: '/', httpOnly: true, secure: false, maxAge: 86400000 },
      saveUninitialized: true,
      proxy: true,
      resave: false,
      rolling: true
    }),

    authentication = new Authentication();

app.set('trust proxy', 1);
app.set('views', viewsDir);
app.set('view engine', 'jade');

app.use(favicon(publicDir + '/favicon.ico', { maxAge: 0 }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compression());
app.use(express.static(publicDir));
app.use(sess);

/*
 * API Calls
 */
app.post('/login', function(req, res, next) {
  authentication.login(req, res, next);
});

app.post('/register', function(req, res, next) {
  authentication.register(req, res, next);
});

app.post('/logout', function(req, res, next) {
  authentication.logout(req, res, next);
});

/*
 * Core Routes
 */
app.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Solar Crusaders',
    description: 'A multiplayer strategy game featuring 4X gameplay, sandbox universe, and simulated virtual economy.',
    production: production,
    user: req.session.user && req.session.user.uid ? true : false
  });
});

app.get('*', function(req, res, next) {
  res.redirect('/');
});

app.use(function(err, req, res, next) {
  winston.error('[Server] ' + err.message);
  res.json({
    error: err.message
  });
});

/*
 * SocketIO Routes
 */
io.use(iosess(sess));
io.use(iorouter);

iorouter.on('ping', function(sock, args, next) {
  sock.emit('pong', {
    time: 0
  });
});

iorouter.on('user', function(sock, args, next) {
  sock.emit(args[0], {
    user: sock.sock.handshake.session.user
  });
});

iorouter.on(function(sock, args) {
  winston.info('[Server] Uncaught socket message: ' + args[0]);
});

iorouter.on(function(err, sock, args, next) {
  sock.emit(args[0], {
    error: error.message
  });
  next();
});

module.exports = server;
