
function Latency(routes) {
  this.routes = routes;
  this.game = routes.game;
};

Latency.prototype.init = function(next) {
  var timer,
      self = this;

  this.routes.iorouter.on('ping', function(sock, args, next) {
    sock.emit('pong', { now: global.Date.now() });
  });

  // ping connections
  this.routes.io.on('connection', function(socket) {
    var timer = self.game.clock.events.loop(3000, self.drip, socket);
    socket.on('disconnect', function() {
      self.game.clock.events.remove(timer);
    });
  });

  this.routes.iorouter.on('drop', this.drop.bind(this));
};

Latency.prototype.drip = function() {
  var now = global.Date.now(),
      session = this.handshake.session;
      session.drip = now;
  this.emit('drip');
};

Latency.prototype.drop = function(sock, args, next) {
  var session = sock.sock.handshake.session;
      session.drop = global.Date.now();
      session.rtt = session.drip - session.drop;
};

module.exports = Latency;