var fork = require('child_process').fork;

function Password() {
  //..
};

Password.prototype.constructor = Password;

Password.prototype.hash = function(rounds, password, callback) {
  this._forkChild({ type: 'hash', rounds: rounds, password: password }, callback);
};

Password.prototype.compare = function(password, hash, callback) {
  this._forkChild({ type: 'compare', password: password, hash: hash }, callback);
};

Password.prototype._forkChild = function(message, callback) {
  var child = fork('./bcrypt.js', [], { silent: true });
      child.on('message', function(msg) {
        if(msg.err) { return callback(new Error(msg.err)); }
        callback(null, msg.result);
      });
      child.send(message);
};

module.exports = Password;
