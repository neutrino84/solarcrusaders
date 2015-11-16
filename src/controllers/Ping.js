
function Ping(routes) {
  this.routes = routes;
};

Ping.prototype.init = function(next) {
  this.routes.iorouter.on('ping', function(sock, args, next) {
    sock.emit('pong', { now: global.Date.now() });
  });
};

module.exports = Ping;
