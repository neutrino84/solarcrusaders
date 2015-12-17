
var engine = require('engine'),
    Layout = require('../Layout'),
    ContentPane = require('./ContentPane'),
    SystemPane = require('./SystemPane'),
    Tilemap = require('../components/Tilemap');

function ShipPane(game, settings) {
  ContentPane.call(this, game, '', settings);
  
  this.auth = game.auth;
  this.socket = game.net.socket;
  this.shipNetManager = game.shipNetManager;

  this.isPlayer = settings.player;

  // cache
  this.cache = {};

  // create blank
  this.blank = {
    label: 'none selected',
    ship: null,
    data: {},
    tilemap: new Tilemap(game),
    system: new SystemPane(game)
  };

  // 
  this.button.on('inputUp', this._follow, this);

  // subscribe to messages
  this.game.on('ships/selected', this._selected, this);
  this.game.on('ship/target', this._target, this);
  this.game.on('ship/untargeted', this._untargeted, this);
  
  // set default
  this.set(this.blank);
};

ShipPane.prototype = Object.create(ContentPane.prototype);
ShipPane.prototype.constructor = ShipPane;

ShipPane.prototype.set = function(data) {
  this.label.text = data.label;
  
  this.current && this.removeContent(this.current.tilemap);
  this.current && this.title.removePanel(this.current.system);
  this.current && this.current.tilemap.stop();
  this.current && this.current.tilemap.removeListener('roomDown', this._roomDown);
  
  this.current = data;
  this.current.tilemap.start();
  this.current.tilemap.on('roomDown', this._roomDown, this);

  this.addContent(Layout.NONE, data.tilemap);
  this.title.addPanel(Layout.RIGHT, data.system);
};

ShipPane.prototype._follow = function() {
  if(this.current.ship) {
    this.game.emit('ship/follow', this.current.ship);
  }
};

ShipPane.prototype._target = function(target, room) {
  if(this.isPlayer) {
    this.socket.emit('ship/target', {
      origin: this.current.data.uuid,
      target: target,
      room: room
    });
  }
};

ShipPane.prototype._untargeted = function(targeted) {
  if(targeted.uuid === this.current.data.uuid) {
    this.set(this.blank);
  }
};

ShipPane.prototype._roomDown = function(room) {
  var system, ship;
  if(!this.isPlayer && room && room.data) {
    system = room.data.system;
    ship = this.current.data;
    this.current.tilemap.target(room);
    this.game.emit('ship/target', ship.uuid, system);
  }
};

ShipPane.prototype._selected = function(ships) {
  var ship, cache,
      data, matches = 0;
  for(var s in ships) {
    ship = ships[s];
    data = this.shipNetManager.getShipDataByUuid(ship.uuid);
    if(this._filter(ship)) {
      if(this.cache[ship.uuid]) {
        cache = this.cache[ship.uuid];
      } else {
        cache = this.cache[ship.uuid] = {
          label: ship.name,
          ship: ship,
          data: data,
          tilemap: new Tilemap(this.game, ship.name, { player: this.isPlayer }),
          system: new SystemPane(this.game, {
            systems: data.systems
          })
        };
      }
      if(matches === 0) {
        this.set(cache);
      } else {
        //.. send to ship list
      }
      matches++;
    }
  }

  // set to blank
  if(matches === 0) {
    this.set(this.blank);
  }

  // save selection
  this.selected = ships;
};

ShipPane.prototype._filter = function(ship) {
  return (this.isPlayer && ship.user === this.auth.user.uuid) ||
    (!this.isPlayer && ship.user !== this.auth.user.uuid);
};

module.exports = ShipPane;
