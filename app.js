var path = require('path'),
    express = require('express'),
    compression = require('compression'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    app = express(),
    publicDir = path.resolve('public'),
    viewsDir = path.resolve('views'),
    production = Boolean(process.env.PRODUCTION);

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

app.listen(3000);
