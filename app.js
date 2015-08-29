var path = require('path'),
    express = require('express'),
    compression = require('compression'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    publicDir = path.resolve('public'),
    viewsDir = path.resolve('views'),
    production = Boolean(process.env.PRODUCTION);

io.on('connection', function() {
  console.log('connection established');
});

app.set('views', viewsDir);
app.set('view engine', 'jade');

app.use(favicon(publicDir + '/favicon.ico', { maxAge: 0 }));
app.use(bodyParser.json());
app.use(compression());
app.use(express.static(publicDir));

app.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Solar Crusaders',
    description: 'A multiplayer strategy game featuring 4X gameplay, sandbox universe, and simulated virtual economy.'
  });
});

server.listen(3000);
