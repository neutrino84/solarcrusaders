
var engine = require('engine'),
    EventEmitter = require('eventemitter3'),
    Ship = require('./Ship');

function ShipManager(game) {
  EventEmitter.call(this);

  // initialize
  this.game = game;
  this.net = game.net;
  this.socket = game.net.socket;
  this.shipsGroup = new engine.Group(game);
  this.trajectoryGroup = new engine.Group(game);
  
  this.fxGroup = new engine.Group(game);
  // this.fxGroup.blendMode = engine.BlendMode.ADD;

  // trajectoryGraphics
  this.trajectoryGraphics = new engine.Graphics(game);
  this.trajectoryGroup.addChild(this.trajectoryGraphics);

  // ships
  this.ships = {};

  // add ships to world
  game.world.add(this.trajectoryGroup);
  game.world.add(this.shipsGroup);
  game.world.add(this.fxGroup);

  // stop follow
  game.input.once('keydown', function() {
    game.camera.unfollow();
  }, this);

  // authentication
  game.auth.on('disconnected', this._disconnected, this);

  // networking
  // TODO: move to client/net/Sector.js
  this.socket.on('sync', this._syncBind = this._sync.bind(this));
  this.socket.on('plotted', this._plottedBind = this._plotted.bind(this));
  this.socket.on('destroyed', this._destroyedBind = this._destroyed.bind(this));

  // subscribe to messages
  game.on('gui/sector/selected', this._selected, this);
}

ShipManager.prototype = Object.create(EventEmitter.prototype);
ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype._sync = function(data) {
  var ship, cached,
      offset, vector,
      ships = data.ships,
      length = ships.length;
  for(var s=0; s<length; s++) {
    ship = ships[s];
    cached = this.ships[ship.uuid] ? this.ships[ship.uuid] : this.ships[ship.uuid] = this.createShip(ship);
    offset = engine.Point.distance(ship.current, cached.movement.current);

    if(offset > 64) {
      cached.rotation = ship.rotation;
      cached.position.set(ship.current.x, ship.current.y);
      cached.movement.throttle = ship.throttle;

      if(ship.moving) {
        cached.movement.plot(ship.destination, ship.current, ship.previous);
        // if(!cached.movement.valid) {
        //   console.log('plot linear');
        //   cached.movement.plotLinear(ship.destination, ship.current, ship.previous);
        // }
        // cached.movement.drawData();
      } else {

        // cached.offset.set(0, 0);

        cached.movement.animation.stop();
      }

      // if(ship.moving) {
        // cached.movement.plot(ship.destination, ship.current, ship.previous);
        // cached.position.set(ship.destination.x, ship.destination.y);
      // } else {
      // }
    }

    this.trajectoryGraphics.lineStyle(0);
    this.trajectoryGraphics.beginFill(0x00FF00, 1.0)
    this.trajectoryGraphics.drawCircle(cached.position.x, cached.position.y, 4);
    this.trajectoryGraphics.endFill();

    this.trajectoryGraphics.lineStyle(0);
    this.trajectoryGraphics.beginFill(0xFF0000, 1.0)
    this.trajectoryGraphics.drawCircle(ship.current.x, ship.current.y, 2);
    this.trajectoryGraphics.endFill();

    // var frame = cached.movement.animation.frame;
    // if(frame) {
    //   this.trajectoryGraphics.lineStyle(0);
    //   this.trajectoryGraphics.beginFill(0x00FF00, 1.0)
    //   this.trajectoryGraphics.drawCircle(frame.x, frame.y, 4);
    //   this.trajectoryGraphics.endFill();

    //   this.trajectoryGraphics.lineStyle(0);
    //   this.trajectoryGraphics.beginFill(0xFF0000, 1.0)
    //   this.trajectoryGraphics.drawCircle(ship.current.x, ship.current.y, 2);
    //   this.trajectoryGraphics.endFill();
    // }
  }
};

ShipManager.prototype.update = function() {

};

ShipManager.prototype.createShip = function(data) {
  var ship = new Ship(this, data.chasis),
      plotThreshold = ship.config.oribit.radius * 2;
      
      ship.uuid = data.uuid;
      ship.user = data.user;
      ship.username = data.username;
      ship.fxGroup = this.fxGroup;

      ship.boot();

      ship.movement.throttle = data.throttle;
      ship.position.set(data.current.x, data.current.y);
      ship.rotation = data.rotation;
      ship.trajectoryGraphics = this.trajectoryGraphics;

  this.shipsGroup.add(ship);

  if(ship.user === this.game.auth.user.uuid) {
    ship.select();
    this.game.camera.follow(ship);
  }

  return ship;
};

ShipManager.prototype.remove = function(ship) {
  var s = this.ships[ship.uuid];
      s.destroy();
  delete this.ships[ship.uuid];
};

ShipManager.prototype.removeAll = function() {
  var ship,
      ships = this.ships,
      camera = this.game.camera;

  // unfollow
  camera.unfollow();

  // remove all ships
  for(var s in ships) {
    this.remove(ships[s]);
  }
};

ShipManager.prototype.destroy = function() {
  var game = this.game,
      auth = this.game.auth,
      socket = this.socket;

  game.removeListener('gui/sector/selected', this._selected);

  auth.removeListener('disconnected', this._disconnected);
  
  socket.removeListener('sync', this._syncBind);
  socket.removeListener('plotted', this._plottedBind);
  socket.removeListener('destroyed', this._destroyedBind);

  this.game = this.socket =
    this._syncBind = this._plottedBind =
    this._destroyedBind = undefined;

  this.removeAll();
};

ShipManager.prototype._plotted = function(data) {
  var auth = this.game.auth,
      ship = this.ships[data.uuid],
      startTime = this.net.ping;
  if(ship !== undefined && ship.user !== auth.user.uuid) {
    ship.rotation = data.rotation;
    ship.position.set(data.current.x, data.current.y);
    ship.movement.throttle = data.throttle;
    ship.movement.plot(data.destination, data.current, data.previous);
  }
};

ShipManager.prototype._destroyed = function(ship) {
  var camera = this.game.camera,
      target = camera.target; 
  if(target && ship.uuid === target.uuid) {
    camera.unfollow();
  }
  this.remove(ship);
};

ShipManager.prototype._disconnected = function() {
  this.removeAll();
};

ShipManager.prototype._selected = function(pointer, rectangle) {
  var point, selected = [], ship,
      camera = this.game.camera;

  this.shipsGroup.forEach(function(child) {
    if(pointer.button === engine.Mouse.LEFT_BUTTON) {
      if(child.overlap(rectangle)) {
        child.select();
        // if(!child.isPlayer) {
          //.. TODO: manage targeted
          // playerShip.target = child;
          // child.target = playerShip;
        // }
      } else {
        if(!child.isPlayer) {
          child.deselect();
        }
      }
    }
    if(child.selected && pointer.button === engine.Mouse.RIGHT_BUTTON && rectangle.volume <= 300) {
      selected.push(child);
    }
  });

  if(selected.length > 0) {
    point = game.world.worldTransform.applyInverse(rectangle);
    
    // this.trajectoryTween && this.trajectoryTween.stop();
    // this.trajectoryGraphics.clear();
    // this.trajectoryGraphics.alpha = 1.0;

    for(var i=0; i<selected.length; i++) {
      ship = selected[i];
      if(ship.isPlayer) {
        ship.movement.plot(point);
        this.game.net.socket.emit('plot', {
          uuid: ship.uuid,
          destination: point
        });

        // if(ship.movement.valid) {
        //   ship.movement.drawDebug();
        // }
      }
    }

    // this.trajectoryTween = this.game.tweens.create(this.trajectoryGraphics);
    // this.trajectoryTween.to({ alpha: 0.0 }, 500, engine.Easing.Quadratic.InOut);
    // this.trajectoryTween.start();
  }
};

module.exports = ShipManager;
