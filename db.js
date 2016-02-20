
var path = require('path'),
    nconf = require('nconf'),
    redis = require('redis'),
    Model = require('./src/model'),
    Database = require('./src/database'),
    debugArgIdx, debugArgs = ['--debug', '--debug-brk'];

// delete all sess in db 1
// redis-cli -n 1 -h nodebb.dzk5vd.0001.usw2.cache.amazonaws.com KEYS "sess:*" | xargs redis-cli -n 1 -h nodebb.dzk5vd.0001.usw2.cache.amazonaws.com DEL

// disable debug
// server on children
for(var a in debugArgs) {
  debugArgIdx = process.execArgv.indexOf(debugArgs[a]);
  if(debugArgIdx !== -1) {
    process.execArgv.splice(debugArgIdx, 1);
  }
}
    
nconf.file({ file: path.join(__dirname, './config.json'), });

function startDatabaseConnection() {
  var options = nconf.get('redis:options'),
      host = nconf.get('redis:host'),
      port = nconf.get('redis:port'),
      password = nconf.get('redis:password'),
      db = parseInt(nconf.get('redis:database'), 10),
      client = redis.createClient(port, host, options);

  this.schema = Database.schema;
  this.schema.client = client;
  this.schema.settings.database = db;
  this.schema.adapter.initialize(client);

  global.model = new Model({});
};

// init db
startDatabaseConnection();
