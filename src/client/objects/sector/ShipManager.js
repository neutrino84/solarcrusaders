
var engine = require('engine'),
    Ship = require('./Ship'),
    EnhancementManager = require('./EnhancementManager'),
    ExplosionEmitter = require('./emitters/ExplosionEmitter'),
    FlashEmitter = require('./emitters/FlashEmitter'),
    GlowEmitter = require('./emitters/GlowEmitter'),
    ShockwaveEmitter = require('./emitters/ShockwaveEmitter'),
    FireEmitter = require('./emitters/FireEmitter'),
    Indicator = require('./misc/Indicator');

function ShipManager(game, state, first) {
  this.game = game;
  this.state = state;
  this.creditsPane = state.ui.bottom.creditsPane;
  this.clock = game.clock;
  this.net = game.net;
  this.socket = game.net.socket;
  this.enhancementManager = new EnhancementManager(this);

  if(first){
    this.firstIteration = true;
  }

  // player
  this.player = null;

  // ship cache
  this.ships = {};

  // create indicator
  this.indicator = new Indicator(game);

  // create containers
  this.subGroup = new engine.Group(game);
  this.shipsGroup = new engine.Group(game);
  this.fxGroup = new engine.Group(game);
  this.trajectoryGroup = new engine.Group(game);

  // create emitters
  this.explosionEmitter = new ExplosionEmitter(this.game);
  this.flashEmitter = new FlashEmitter(this.game);
  this.glowEmitter = new GlowEmitter(this.game);
  this.shockwaveEmitter = new ShockwaveEmitter(this.game);
  this.fireEmitter = new FireEmitter(this.game);

  this.game.particles.add(this.explosionEmitter);
  this.game.particles.add(this.flashEmitter);
  this.game.particles.add(this.glowEmitter);
  this.game.particles.add(this.shockwaveEmitter);
  this.game.particles.add(this.fireEmitter);

  // add ships to world
  this.game.world.add(this.trajectoryGroup);
  this.game.world.add(this.subGroup);
  this.game.world.add(this.shipsGroup);
  this.game.world.add(this.fxGroup);
  this.game.world.add(this.fireEmitter);
  this.game.world.add(this.explosionEmitter);
  this.game.world.add(this.flashEmitter);
  this.game.world.add(this.shockwaveEmitter);
  this.game.world.add(this.glowEmitter);
  this.game.world.add(this.indicator);

  this.trajectoryGraphics = new engine.Graphics(game);
  this.trajectoryGroup.addChild(this.trajectoryGraphics);

  // networking
  this.socket.on('ship/test', this._test.bind(this));

  // subscribe to messages
  this.game.on('auth/disconnect', this._disconnect, this);

  this.game.on('sector/sync', this._sync, this);

  this.game.on('game/pause', this._pause, this);
  this.game.on('game/resume', this._resume, this);

  this.game.on('player/credits', this._player_credits, this);

  this.game.on('ship/player', this._player, this);
  this.game.on('ship/primary', this._primary, this);
  this.game.on('ship/secondary', this._secondary, this);
  this.game.on('ship/attack', this._attack, this);
  this.game.on('ship/removed', this._removed, this);
  this.game.on('ship/disabled', this._disabled, this);
  this.game.on('ship/enabled', this._enabled, this);
  this.game.on('squad/shieldDestinationDeactivate', this._destinationDeactivate, this);
  this.game.on('squad/engageHostile', this._target, this);

  // this.game.clock.events.loop(10, this._sendMapData, this)
  this.game.clock.events.loop(5000, this._sendMapDataShips, this)
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype._sendMapData = function(){
  var player = this.player,
      ships = this.ships, 
      data = [], distance;
  for(var a in ships){
    if(!ships[a].disabled && !ships[a] !== player){
      distance = engine.Point.distance(player, ships[a]);
      if(distance < 2000){
        data.push(ships[a])
      }
    }
  }
  // data.push(player)
  if(data.length){
    this.game.emit('mapData', player, data) 
  }
};

ShipManager.prototype._sendMapDataShips = function(){
    this.game.emit('shipsDump', this.ships) 
};

ShipManager.prototype.create = function(data, sync) {
  var game = this.game,
      container = this.shipsGroup,
      ships = this.ships,
      ship = new Ship(this, data);

  // set data
  ship.uuid = data.uuid;
  ship.user = data.user;
  ship.username = data.username;

  // set position
  ship.position.set(sync.pos.x, sync.pos.y);

  // add ship registry
  ships[ship.uuid] = ship;

  // display
  container.add(ship);

  // boot
  ship.boot();

  //save squadron to master ship
  if(this.player && ship.data.masterShip && ship.data.masterShip === this.player.uuid){
    this.player.squadron[ship.uuid] = ship;

    if(ship.data.chassis === 'squad-shield'){
      ship.data.ai = 'squadron';
      this.game.emit('ship/player/squadSync', 'shieldship')
      this.game.emit('squad/construct', 'squad-shield')
    }
    if(ship.data.chassis === 'squad-attack'){
      ship.data.ai = 'squadron'
      this.game.emit('ship/player/squadSync', 'attackship')
      this.game.emit('squad/construct', 'squad-attack')
    }
    if(ship.data.chassis === 'squad-repair'){
      ship.data.ai = 'squadron'
      this.game.emit('ship/player/squadSync', 'repairship')
      this.game.emit('squad/construct', 'squad-repair')
    }
  }


  if(ship.data.chassis === 'scavenger-x04'){
    game.emit('ship/sound/growl', ship);
  }

  return ship;
};

ShipManager.prototype.undock = function() {
  // this.player.locked = false;
};

ShipManager.prototype.remove = function(data) {
  var game = this.game,
      camera = game.camera,
      ships = this.ships,
      ship = ships[data.uuid];
  if(ship !== undefined) {
    if(camera.target === ship) {
      camera.unfollow();
    }
    ship.destroy();
    delete ships[ship.uuid];
  }
};

ShipManager.prototype.removeAll = function() {
  var ship,
      ships = this.ships;
  for(var s in ships) {
    this.remove(ships[s]);
  }
};

ShipManager.prototype.destroy = function() {
  var game = this.game,
      auth = this.game.auth,
      socket = this.socket;

  game.removeListener('auth/disconect', this._disconnect);
  game.removeListener('sector/sync', this._sync);
  game.removeListener('ship/player', this._player);
  game.removeListener('ship/primary', this._primary);
  game.removeListener('ship/secondary', this._secondary);
  game.removeListener('ship/removed', this._removed);
  game.removeListener('ship/disabled', this._disabled);
  game.removeListener('ship/enabled', this._enabled);
  game.removeListener('game/pause', this._pause);
  game.removeListener('game/resume', this._resume);

  game.particles.remove(this.explosionEmitter);
  game.particles.remove(this.flashEmitter);
  game.particles.remove(this.glowEmitter);
  game.particles.remove(this.shockwaveEmitter);
  game.particles.remove(this.explosionEmitter);

  // game.world.remove(this.trajectoryGroup);
  game.world.remove(this.subGroup);
  game.world.remove(this.shipsGroup);
  game.world.remove(this.fxGroup);
  game.world.remove(this.fireEmitter);
  game.world.remove(this.explosionEmitter);
  game.world.remove(this.flashEmitter);
  game.world.remove(this.shockwaveEmitter);
  game.world.remove(this.glowEmitter);
  game.world.remove(this.indicator);

  this.removeAll();

  this.game = this.socket = this._syncBind =
   this._attackBind = undefined;
};

ShipManager.prototype._sync = function(data) {
  var game = this.game,
      netManager = this.state.netManager,
      ships = data.ships,
      length = ships.length,
      sync, ship, d;
  for(var s=0; s<length; s++) {
    sync = ships[s];
    ship = this.ships[sync.uuid];

    if(ship) {
      ship.movement.plot(sync);
    } else {
      d = netManager.getShipData(sync.uuid);
      d && this.create(d, sync);
    }
  }
};

ShipManager.prototype._player = function(ship) {
  // if(this.firstIteration){
    this.player = ship;
  //   ship.alpha = 0
  //   ship.locked = true;
  //   ship.events.loop(100, fadeIn = function(){
  //     ship.alpha += 0.05
  //     if(ship.alpha >= 1){
  //       for(var i = 0; i < ship.events.events.length; i++){
  //         if(ship.events.events[i].callback.name === 'fadeIn'){
  //           ship.events.remove(ship.events.events[i]);
  //         }
  //       }
  //     }
  //   }, this);
  //   this._player_credits()
  // } else {
  //   this.player = ship;
  // }
  this.player.unfriendlies = {};
  this.player.targetCount = 0;
  this.player.targetlistCooldown = false;
  this.player.previous;
  this.player.squadron = {};
  this.game.camera.follow(ship);
};

ShipManager.prototype._player_credits = function() {
  // var tempCredits;
  // if(credits){
  //   tempCredits = this.player.data.credits + credits;
  // } else {
  //   tempCredits = this.player.data.credits;
  // }
  // this.creditsPane.updateCredits(tempCredits)
  this.creditsPane.updateCredits(this.player.data.credits)
};

ShipManager.prototype._attack = function(data) {
  var ship = this.ships[data.uuid];
  if(ship != this.player) {
    ship.targetingComputer.attack(data);
  }
};

ShipManager.prototype._destinationDeactivate = function() {
  var player = this.player;
  this.socket.emit('squad/shieldDestinationDeactivate', player.uuid)
};
ShipManager.prototype._target = function(uuid) {
  var player = this.player,
      ships = this.ships;
  for(var a in ships){
    if(ships[a].targettedBy && ships[a].targettedBy === player.uuid){
      ships[a].targettedBy = null;
    }
  }
  if(this.ships[uuid]){
    this.ships[uuid].targettedBy = player.uuid 
  }
};

ShipManager.prototype._test = function(data) {
  // var ship = this.ships[data.uuid],
  //     position = new engine.Point(ship.position.x, ship.position.y),
  //     compensated = new engine.Point(data.compensated.x, data.compensated.y);

  // this.trajectoryGraphics.lineStyle(0);
  // this.trajectoryGraphics.beginFill(0x336699, 1.0);
  // this.trajectoryGraphics.drawCircle(position.x, position.y, 24);
  // this.trajectoryGraphics.endFill();

  // this.trajectoryGraphics.lineStyle(0);
  // this.trajectoryGraphics.beginFill(0x669933, 1.0);
  // this.trajectoryGraphics.drawCircle(data.targ.x, data.targ.y, 14);
  // this.trajectoryGraphics.endFill();

  // this.trajectoryGraphics.lineStyle(0);
  // this.trajectoryGraphics.beginFill(0x996633, 1.0);
  // this.trajectoryGraphics.drawCircle(compensated.x, compensated.y, 6);
  // this.trajectoryGraphics.endFill();
};

ShipManager.prototype._primary = function(data) {
  var clock = this.clock,
      ship = this.player;
  if(ship) {
    if(!ship.disabled && ship.targetingComputer && data.type === 'start') {
      this.autofire && clock.events.remove(this.autofire);
      this.autofire = clock.events.loop(20, function() {
          ship.targetingComputer.fire();
      });
    } else {
      this.autofire && clock.events.remove(this.autofire);
    }
  }
};

ShipManager.prototype._secondary = function(data) {
  var game = this.game,
      ship = this.player,
      socket = this.socket,
      indicator = this.indicator,
      start = this.shipsGroup.worldTransform.apply(ship.position),
      end = this.game.input.mousePointer,
      position = this.game.world.worldTransform.applyInverse(end),
      destination = { x: end.x - start.x, y: end.y - start.y };
  // if(ship && !ship.locked) {
    if(ship) {
      if(data.shield){
        indicator.show(position);
        socket.emit('squad/shieldDestination', {
          uuid: ship.uuid,
          destination: {x: position.x, y: position.y }
        })
      }
    else if(data.type === 'start') {
      // if(ship.docked){
      //   ship.docked = false;
      //   socket.emit('player/undock', ship.uuid)
      // }
      indicator.show(position);
      game.emit('ship/plot');
      socket.emit('ship/plot', {
        uuid: ship.uuid,
        destination: destination
      });

      game.emit('ship/sound/thrusters');
    }
  }
};

ShipManager.prototype._disabled = function(data) {
  var ship = this.ships[data.uuid],
      socket = this.socket,
      clock = this.clock,
      scav = /^(scavenger)/,
      game = this.game, chassis, isScavenger;
      
  if(ship !== undefined) {
    chassis = ship.data.chassis;
    isScavenger = scav.test(chassis);

    ship.selector.hostileHighlightStop();
    ship.selector.hostileEngagedStop();
    ship.disable();
    ship.explode();
    this.game.emit('ship/sound/death', ship);
    if(ship.isPlayer) {
      this.autofire && clock.events.remove(this.autofire);
    };

    if(chassis === 'scavenger-x04') {
      for(var i = 0; i < ship.events.events.length; i++){
        if(ship.events.events[i].callback.name === 'growlTimer'){
          ship.events.remove(ship.events.events[i]);  
        }
      }
    };

    if(ship.data.masterShip && ship.data.masterShip === this.player.uuid){
      this.game.emit('squad/disable', chassis)
    }

    if(chassis === 'scavenger-x04') {
      for(var i = 0; i < ship.events.events.length; i++){
        if(ship.events.events[i].callback.name === 'growlTimer'){
          ship.events.remove(ship.events.events[i]);  
        }
      }
    };
    if(isScavenger){
      ship.events.loop(100, alphaFader = function(){
        if(ship.alpha > 0){
          ship.alpha -= 0.01
        }
        if(ship.alpha <= 0){
          for(var i = 0; i < ship.events.events.length; i++){
            if(ship.events.events[i].callback.name === 'alphaFader'){
              ship.events.remove(ship.events.events[i]);  
            }
          };
        }
      })
    };
  }
};

ShipManager.prototype._enabled = function(data) {
  var ship = this.ships[data.uuid],
      scav = /^(scavenger)/;
  if(ship !== undefined) {
    ship.enable(data);
    if(ship.data.masterShip && ship.data.masterShip === this.player.uuid){
      this.game.emit('squad/enable', ship.data.chassis)
    }
    if(scav.test(ship.data.chassis)){
      for(var i = 0; i < ship.events.events.length; i++){
        if(ship.events.events[i].callback.name === 'alphaFader'){
          ship.events.remove(ship.events.events[i]);  
        }
      };
    }
  };
};

ShipManager.prototype._removed = function(ship) {
  var tween,
      game = this.game,
      s = this.ships[ship.uuid];
  if(s !== undefined) {
    this.remove(ship);
  }
};

ShipManager.prototype._resume = function() {
  //..
};

ShipManager.prototype._pause = function() {
  //..
};

ShipManager.prototype._disconnect = function() {
  this.removeAll();
};

module.exports = ShipManager;
