
function Latency(routes) {
  this.routes = routes;
  this.game = routes.game;
};

Latency.prototype.init = function(next) {
  var timer,
      self = this;

  // ping connections
  this.routes.io.on('connection', function(socket) {
    var timer = self.game.clock.events.loop(2000, self.ping, socket);
    socket.on('disconnect', function() {
      self.game.clock.events.remove(timer);
    });
  });

  this.routes.iorouter.on('pong', this.pong.bind(this));
};

Latency.prototype.ping = function() {
  var now = global.Date.now(),
      session = this.handshake.session;
      session.ping = now;
  this.emit('ping', {
    rtt: session.rtt || 0
  });
};

Latency.prototype.pong = function(sock, args, next) {
  var session = sock.sock.handshake.session;
      session.rtt = global.Date.now() - session.ping;
};

module.exports = Latency;
