
var bcrypt = require('bcryptjs'),
    async = require('async');

function done(err, result) {
  if(err) {
    process.send({ err: err.message });
    return process.disconnect();
  }
  process.send({ result: result });
  process.disconnect();
};

process.on('message', function(msg) {
  if(msg.type === 'hash') {
    async.waterfall([
      function(next) {
        bcrypt.genSalt(parseInt(msg.rounds, 10), next);
      },
      function(salt, next) {
        bcrypt.hash(msg.password, salt, next);
      }
    ], done);
  } else if(msg.type === 'compare') {
    bcrypt.compare(msg.password, msg.hash, done);
  }
});
