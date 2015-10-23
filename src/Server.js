var path = require('path'),
    express = require('express'),
    session = require('express-session'),
    compression = require('compression'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    winston = require('winston'),
    
    app = express(),
    server = require('http').createServer(app),
    
    io = require('socket.io')(server),
    iosess = require('socket.io-express-session'),
    iorouter = require('socket.io-events')(),

    Authentication = require('./controllers/Authentication'),

    authentication = new Authentication();
    
    publicDir = path.resolve('public'),
    viewsDir = path.resolve('views'),
    
    production = Boolean(process.env.PRODUCTION),
    sess = session({
      name: 'solar.sid',
      secret: '4wWyR5Fq2vtKxq2mEjXkpEYM=4j-hz=X',
      cookie: { path: '/', httpOnly: true, secure: false, maxAge: 86400000 },
      saveUninitialized: true,
      proxy: true,
      resave: false,
      rolling: true
    });

app.set('trust proxy', 1);
app.set('views', viewsDir);
app.set('view engine', 'jade');

app.use(favicon(publicDir + '/favicon.ico', { maxAge: 0 }));
app.use(bodyParser.json());
app.use(compression());
app.use(express.static(publicDir));
app.use(sess);

app.post('/login', function(req, res, next) {
  authentication.login(req, res, next);
});

app.post('/register', function(req, res, next) {
  authentication.register(req, res, next);
});

app.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Solar Crusaders',
    description: 'A multiplayer strategy game featuring 4X gameplay, sandbox universe, and simulated virtual economy.',
    production: production
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

io.use(iosess(sess));
io.use(iorouter);

iorouter.on(function(sock, args) {
  winston.info('[Server] Uncaught socket message: ' + args[0]);
});

iorouter.on(function(err, sock, args, next) {
  sock.emit(args[0], {
    error: error.message,
    user: args[1]
  });
  next();
});

// io.on('connection', function(socket) {
//   var session = socket.handshake.session;
//   winston.info('socket connection ready');
// });

module.exports = server;
