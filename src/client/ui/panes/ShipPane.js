
var engine = require('engine'),
    Layout = require('../Layout'),
    ContentPane = require('./ContentPane'),
    SystemPane = require('./SystemPane'),
    Tilemap = require('../components/Tilemap'),
    ButtonIcon = require('../components/ButtonIcon'),
    Class = engine.Class;

function ShipPane(game, settings) {
  ContentPane.call(this, game, '',
    Class.mixin(settings, {
      tab: {
        padding: [2],
        icon: {
          padding: [0],
          border: [0],
          frame: 'icon-edit.png',
          bg: {
            highlight: false,
            borderSize: 0.0,
            fillAlpha: 0.0,
            radius: 0.0
          }
        },
        bg: {
          // color: 0x3868b8,
          fillAlpha: 0.5,
          // blendMode: engine.BlendMode.ADD,
          borderSize: 0.0,
          radius: 0.0
        }
      }
    })
  );
  
  this.socket = game.net.socket;
  this.shipNetManager = game.shipNetManager;

  this.current = null;
  this.last = null;
  this.isPlayer = settings.player;

  this.panes = {};

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

  // if(this.isPlayer) {
  //   this.editButton = new ButtonIcon(game, 'texture-atlas', this.settings.tab);
  //   this.editButton.on('inputUp', this._fitting, this);
  //   this.editButton.alert();

  //   this.addTab(Layout.NONE, this.editButton);
  // }

  // subscribe to messages
  this.game.on('ships/selected', this._selected, this);
  this.game.on('ship/target', this._target, this);
  this.game.on('ship/targeted', this._targeted, this);
  this.game.on('ship/attack', this._attack, this);
  this.game.on('ship/destroyed', this._destroyed, this);
  
  // set default
  this.set(this.blank);
};

ShipPane.prototype = Object.create(ContentPane.prototype);
ShipPane.prototype.constructor = ShipPane;

ShipPane.prototype.set = function(data) {
  this.current && this.reset();

  this.label.text = data.label;
  
  this.current = data;
  this.current.tilemap.start();
  this.current.tilemap.on('targeted', this._roomTargeted, this);
  this.current.ship && this._setTargets(this.current.ship.targeted);

  this.last = data;

  this.addContent(Layout.NONE, data.tilemap);
  this.title.addPanel(Layout.RIGHT, data.system);
  this.invalidate(true);
};

ShipPane.prototype.reset = function() {
  this.last = null;
  this.removeContent(this.current.tilemap);
  this.title.removePanel(this.current.system);
  this.current.tilemap.stop();
  this.current.tilemap.removeListener('roomDown', this._roomDown);
};

ShipPane.prototype._data = function(data) {
  var system, systems = data.systems,
      buttons = this.system.buttons,
      d = this.data;
  if(systems !== undefined) {
    for(var s in systems) {
      system = systems[s];
      if(system.health < 30) {
        buttons[s].tint = 0xFF0000;
      } else if(system.health < 90) {
        buttons[s].tint = 0xFFFF00;
      } else {
        buttons[s].tint = 0x00FF00;
      }
    }
  }
};

ShipPane.prototype._follow = function() {
  this.current.ship && this.game.emit('ship/follow', this.current.ship);
};

ShipPane.prototype._fitting = function() {
  this.current.ship && this.game.emit('ship/fitting', this.current.data);
};

ShipPane.prototype._target = function(data) {
  if(this.isPlayer) {
    if(this.current !== this.blank) {
      this.socket.emit('ship/target', {
        origin: this.current.data.uuid,
        target: data.target,
        room: data.room,
        id: data.id
      });
    }
  }
};

ShipPane.prototype._setTargets = function(targeted) {
  var target, battle;
  for(var t in targeted) {
    target = targeted[t];
    battle = this.shipNetManager.getBattleByOriginUuid(target.uuid);
    battle && this._updateTarget(battle, true);
  }
};

ShipPane.prototype._targeted = function(data) {
  var battle = this.shipNetManager.getBattleByOriginUuid(data.origin);
      battle && this._updateTarget(battle, false);
  this._updateTarget(data, true);
};

ShipPane.prototype._attack = function(data) {
  var battle = this.shipNetManager.getBattleByOriginUuid(data.origin);
  if(battle !== undefined) {
    this._updateTarget(data, true);
  }
};

ShipPane.prototype._updateTarget = function(data, show) {
  var pane = this.panes[data.target];
  if(pane && pane.tilemap) {
    pane.tilemap.target(data.id, show);
    
    if(pane === this.current && data.type === 'hit') {
      pane.tilemap.alert();
    }
  }
};

ShipPane.prototype._destroyed = function(ship) {
  var battle = this.shipNetManager.getBattleByOriginUuid(ship.uuid);
      battle && this._updateTarget(battle, false);
  if(this.current && ship.uuid === this.current.data.uuid) {
    this.set(this.blank);
  }
};

ShipPane.prototype._roomTargeted = function(room) {
  if(!this.isPlayer) {
    this.game.emit('ship/target', {
      target: this.current.data.uuid,
      room: room.system,
      id: room.id
    });
  }
};

ShipPane.prototype._roomSelected = function(room) {
  //..
};

ShipPane.prototype._selected = function(ships) {
  var ship, pane,
      data, matches = 0;
  for(var s in ships) {
    ship = ships[s];
    data = this.shipNetManager.getShipDataByUuid(ship.uuid);
    if(this._filter(ship)) {
      if(this.panes[ship.uuid]) {
        pane = this.panes[ship.uuid];
      } else {
        pane = this.panes[ship.uuid] = {
          label: ship.name,
          ship: ship,
          data: data,
          tilemap: new Tilemap(this.game, ship, { player: this.isPlayer }),
          system: new SystemPane(this.game, {
            systems: data.systems
          })
        };
        data.on('data', this._data, pane);
      }
      if(!ship.destroyed) {
        if(matches === 0) {
          // only set new
          if(this.last !== pane) {
            this.set(pane);
            if(this.isPlayer) {
              this.game.emit('gui/player/select', data);
            }
          }
        } else {
          //.. send to ship list
        }
        matches++;
      }
    }
  }

  // set to blank
  if(matches === 0) {
    this.set(this.blank);
  }

  // save selection
  // this.selected = ships;
};

ShipPane.prototype._filter = function(ship) {
  return (this.isPlayer && ship.isPlayer) || (!this.isPlayer && !ship.isPlayer);
};

module.exports = ShipPane;
