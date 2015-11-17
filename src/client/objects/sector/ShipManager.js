
var engine = require('engine'),
    EventEmitter = require('eventemitter3'),
    Ship = require('./Ship');

function ShipManager(game) {
  EventEmitter.call(this);

  // initialize
  this.game = game;
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
  game.auth.on('invalidated', this._invalidated, this);

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
      ships = data.ships,
      length = ships.length;
  for(var s=0; s<length; s++) {
    ship = ships[s];
    cached = this.ships[ship.uuid];
    if(cached === undefined) {
      cached = this.ships[ship.uuid] = this.createShip(ship);
    } else if(engine.Point.distance(ship.current, cached.position) > 64) {
      cached.rotation = ship.rotation;
      cached.position.set(ship.current.x, ship.current.y);
      cached.movement.throttle = ship.throttle;

      // cached.movement.animation.stop();
      if(ship.moving) {
        cached.movement.plot(ship.destination, ship.current, ship.previous);
        // if(!cached.movement.valid) {
        //   console.log('plot linear');
        //   cached.movement.plotLinear(ship.destination, ship.current, ship.previous);
        // }
        // cached.movement.drawData();
      } else {
        cached.movement.animation.stop();
      }

      // if(ship.moving) {
        // cached.movement.plot(ship.destination, ship.current, ship.previous);
        // cached.position.set(ship.destination.x, ship.destination.y);
      // } else {
      // }
    }

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

  return ship;
};

ShipManager.prototype.removeShip = function(ship) {
  var s = this.ships[ship.uuid];
      s.destroy();
  delete this.ships[ship.uuid];
};

ShipManager.prototype.removeShips = function() {
  var ship,
      ships = this.ships;
  for(var s in ships) {
    this.removeShip(ships[s]);
  }
};

ShipManager.prototype.createShips = function() {
  // for(var key in iterator) {
  //   for(var i=0; i<iterator[key].count; i++) {
  //     ship = new Ship(this, key);
      
  //     ship.boot();
  //     ship.trajectoryGraphics = this.trajectoryGraphics;
  //     ship.fxGroup = this.fxGroup;

  //     this.shipsGroup.add(ship);
  //   }
  //   if(key === 'vessel-x01') {
  //     ship.position.set(2048 - 128, 2048 - 128);
  //     this.playerShip = ship;
  //     ship.isPlayer = true;
  //     ship.autopilotPositionInView = true;
  //     // ship.select();
  //     game.camera.focusOn(ship);
  //     game.camera.follow(ship);
  //   }
  // }

  // drones
  // must have all init 
  // functions from above...
  // for(var i=0; i<1; i++) {
  //   ship = new Ship(this, 'vessel-x05');
    
  //   ship.boot();
  //   ship.fxGroup = this.fxGroup;
  //   ship.follow = this.playerShip;
  //   ship.isPlayer = true;
  //   ship.trajectoryGraphics = this.trajectoryGraphics;

  //   this.shipsGroup.add(ship);
  // }
};

ShipManager.prototype.destroy = function() {
  var game = this.game,
      auth = this.game.auth,
      socket = this.socket;

  game.removeListener('gui/sector/selected', this._selected);

  auth.removeListener('user', this._user)
  auth.removeListener('invalidated', this._invalidated);
  
  socket.removeListener('sync', this._syncBind);
  socket.removeListener('plotted', this._plottedBind);
  socket.removeListener('destroyed', this._destroyedBind);

  this.game = this.socket =
    this._syncBind = this._plottedBind =
    this._destroyedBind = undefined;

  this.removeShips();
};

ShipManager.prototype._plotted = function(data) {
  var ship = this.ships[data.uuid];
  if(ship !== undefined) {
    ship.rotation = data.rotation;
    ship.position.set(data.current.x, data.current.y);
    ship.movement.throttle = data.throttle;
    ship.movement.plot(data.destination, data.current, data.previous);
    // ship.movement.drawData(0xFF3300);
  }
};

ShipManager.prototype._destroyed = function(ship) {
  this.removeShip(ship);
};

ShipManager.prototype._invalidated = function() {
  this.removeShips();
};

ShipManager.prototype._selected = function(pointer, rectangle) {
  var point, selected = [], ship,
      camera = this.game.camera,
      playerShip = this.playerShip;

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
        child.deselect();
      }
    }
    if(child.selected && pointer.button === engine.Mouse.RIGHT_BUTTON && rectangle.volume <= 300) {
      selected.push(child);
    }
  });

  if(selected.length > 0) {
    point = game.world.worldTransform.applyInverse(rectangle);
    
    this.trajectoryTween && this.trajectoryTween.stop();
    this.trajectoryGraphics.clear();
    this.trajectoryGraphics.alpha = 1.0;

    for(var i=0; i<selected.length; i++) {
      ship = selected[i];
      if(ship.isPlayer) {
        ship.movement.plot(point);
        this.game.net.socket.emit('plot', {
          uuid: ship.uuid,
          destination: point
        });
        
        if(ship.movement.valid) {
          ship.movement.drawDebug();
        }
      }
    }

    this.trajectoryTween = this.game.tweens.create(this.trajectoryGraphics);
    this.trajectoryTween.to({ alpha: 0.0 }, 500, engine.Easing.Quadratic.InOut);
    this.trajectoryTween.start();
  }
};

module.exports = ShipManager;
