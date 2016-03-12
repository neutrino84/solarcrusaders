
var path = require('path'),
    nconf = require('nconf'),
    redis = require('redis'),
    async = require('async'),
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

  this.schema.on('connected', function() {
    var done = function(err) { console.log('err', err); },
        create = function(user) {
          var user = new global.model.User({
            name: user.username,
            username: user.username,
            email: user.email,
            password: user.password,
            created: user.created,
            role: user.role
          });
          user.sanitize();
          return user;
        },
        worker = function(user, callback) {
          console.log('queue', user.username);
          user.save(callback);
        },
        q = async.queue(worker, 1);
    for(var u in userlist) {
      q.push(create(userlist[u]), done);
    }
    q.drain = function() {
      console.log('work complete');
    }
  });

  // global.model.User.find({}, function(err, users) {
  //   for(var u in users) {
  //     users[u].destroy(function(err) {
  //       if(!err) {
  //         console.log('destroyed');
  //       } else {
  //         console.log('error');
  //       }
  //     });
  //   }
  // });
};

var userlist = [];

// init db
startDatabaseConnection();
