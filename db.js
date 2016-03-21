
var path = require('path'),
    nconf = require('nconf'),
    redis = require('redis'),
    async = require('async'),
    Model = require('./src/model'),
    Database = require('./src/database'),
    Stripe = require('./src/controllers/Stripe'),
    debugArgIdx, debugArgs = ['--debug', '--debug-brk'];

// delete all sess in db 1
// redis-cli -n 2 -h nodebb.dzk5vd.0001.usw2.cache.amazonaws.com KEYS "sess:*" | xargs redis-cli -n 2 -h nodebb.dzk5vd.0001.usw2.cache.amazonaws.com DEL
// redis-cli -n 1 -h localhost KEYS "sess:*" | xargs redis-cli -n 1 -h localhost DEL

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
  // global.stripe = new Stripe();
  // global.stripe.init();

  this.schema.on('connected', function() {
    var done = function(err) { console.log('err', err); },
        create = function(user) {
          var user = new global.model.User({
            name: user.username,
            username: user.username,
            email: user.email,
            password: user.password,
            created: new Date(user.created),
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
    for(var s in stripelist) {
      var stripe = stripelist[s];
      var model = new global.model.Stripe({
          name: stripe.name,
          email: stripe.email,
          stripe_id: stripe.stripe_id,
          default_source: stripe.default_source,
          created: new Date(stripe.created),
          currency: stripe.currency,
          edition: stripe.edition
      });
      model.save();
    }
  });

  // this.schema.on('connected', function() {
  //   global.model.User.all(function(err, users) {
  //     var user, output = [];
  //     for(var u in users) {
  //       user = users[u];
  //       output.push({
  //         name: user.name,
  //         email: user.email,
  //         username: user.username,
  //         password: user.password,
  //         created: user.created.toString(),
  //         role: 'user'
  //       });
  //     }
  //     console.log(output);
  //   });
  // });

  // this.schema.on('connected', function() {
  //   global.model.Stripe.all(function(err, stripes) {
  //     var stripe, output = [];
  //     for(var s in stripes) {
  //       stripe = stripes[s];
  //       output.push({
  //         name: stripe.name,
  //         email: stripe.email,
  //         stripe_id: stripe.stripe_id,
  //         default_source: stripe.default_source,
  //         created: stripe.created.toString(),
  //         currency: stripe.currency,
  //         edition: stripe.edition
  //       });
  //     }
  //     console.log(output);
  //   });
  // });

  // this.schema.on('connected', function() {
  //   stripe.api.customers.list({ limit: 100 }, // max limit 100
  //     function(err, customers) {
  //       var s,
  //           list = customers.data,
  //           len = list.length;
  //       for(var l=0; l<len; l++) {
  //         s = new global.model.Stripe({
  //           stripe_id: list[l].id,
  //           email: list[l].email,
  //           edition: 'captain',
  //           name: list[l].metadata.name,
  //           default_source: list[l].default_source,
  //           currency: list[l].currency,
  //           created: new Date(list[l].created * 1000)
  //         });
  //         s.save();
  //       }
  //     }
  //   );
  // });
};

var userlist = [];
var stripelist = [];

// init db
startDatabaseConnection();
