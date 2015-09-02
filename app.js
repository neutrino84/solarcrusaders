var path = require('path'),
    express = require('express'),
    session = require('express-session'),
    compression = require('compression'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    ios = require('socket.io-express-session'),
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

app.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Solar Crusaders',
    description: 'A multiplayer strategy game featuring 4X gameplay, sandbox universe, and simulated virtual economy.',
    production: production
  });
});

io.use(ios(sess));
io.on('connection', function(socket) {
  var session = socket.handshake.session;

  console.log('connection established');
});

server.listen(3000);
