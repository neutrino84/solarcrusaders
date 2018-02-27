
var engine = require('engine'),
    Graphics = engine.Graphics,
    CircleView = require('../views/CircleView'),
    Ship = require('../../objects/sector/minimap/Ship'),
    Class = engine.Class;

function MiniMapPane(game, settings) {
  CircleView.call(this, game);
  this.game = game;
  this.settings = Class.mixin(settings, {
    color: 0x008080,
    fillAlpha: 0.25,
    radius: 100,
    borderSize: 0.0,
    borderColor: 0x000000,
    borderAlpha: 0.0,
    blendMode: engine.BlendMode.NORMAL
  });

  // modify values
  this.modifier = { left: 0.0, top: 0.0, width: 1.0, height: 1.0 };

  var divider = 4;

  var size = game.width < game.height ? game.width/divider : game.height/divider;

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  this.mapSettings = {
    size: 200,
    divider: divider,
    zoom: 15,
    colors: {
      pirates: 0xFF0000, 
      neutrals: 0xFFFF00, 
      other: 0x8A8A8A, 
      squadron : 0xffffff, 
      user: 0x00ffff,
      enforcers: 0xe26816,
      scavengers: 0xdb57c3,
      pirate_stations : 0xFF0000,
      scavenger_stations : 0xdb57c3,
      ubadian_stations : 0xFFFF00
    },
    user: {
      ship: {
        x: 2000,
        y: 2000
      }
    }
  }
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  this._width = this._height = this.mapSettings.size;
  // fill and blend mode
  this.fillAlpha = this.settings.fillAlpha;
  this.blendMode = this.settings.blendMode;

  this.shipGroup = new engine.Group( this.game, this);

  this.catalogue = {
    squadron : [],
    pirates : [],
    neutrals : [],
    scavengers : [],
    enforcers : [],
    users : [],
    others : [],
    pirate_stations : [],
    scavenger_stations : [],
    ubadian_stations : []
  }

  this.ships = {};
  this.stations = {};
  this.player;
  this.target;

  this._drawShips();

  this.game.on('shipsDump', this._shipsRefresh, this)
  this.game.on('sector/sync', this._sync, this);

  this.game.on('ship/player', this._player, this);
  this.game.on('player/disabled', this._fadeOut, this);
  this.game.on('player/enabled', this._fadeIn, this);
  this.game.on('map/off', this._mapOff, this);

  this.game.on('squad/engageHostile', this._target, this);
};


MiniMapPane.prototype = Object.create(Graphics.prototype);
MiniMapPane.prototype.constructor = MiniMapPane;

MiniMapPane.prototype._shipsRefresh = function(ships, stations) {
    this.ships = ships;
    this.stations = stations;
};

MiniMapPane.prototype._player = function(ship) {
    this.player = ship;
};

MiniMapPane.prototype._target = function(uuid) {
    this.target = uuid;
};

MiniMapPane.prototype._sync = function(data) {
  // return
  var game = this.game,
      ships = data.ships,
      stations = data.stations,
      shipsLength = ships.length,
      stationsLength = stations.length,
      pirate = /^(pirate)/,
      ubaidian = /^(ubaidian)/,
      ubadian = /^(ubadian)/,
      general = /^(general)/,
      scav = /^(scavenger)/,
      enforcer = /^(enforcer)/,
      sync, stationSync, station, ship, type, targetted;

  this.catalogue = {
    squadron : [],
    pirates : [],
    neutrals : [],
    scavengers : [],
    users : [],
    enforcers: [],
    others : [],
    pirate_stations : [],
    scavenger_stations : [],
    ubadian_stations : []
  }

  for(var s=0; s<shipsLength; s++) {
    sync = ships[s];
    ship = this.ships[sync.uuid];
    type = null,
    targetted = false;

    if(ship && !ship.disabled) {
      if(ship === this.player){
        this.mapSettings.user.ship.x = ship.x;
        this.mapSettings.user.ship.y = ship.y;
        continue
      }
      if(ship.data.masterShip && ship.data.masterShip == this.player.uuid){
        type = 'squadron'
      } else if(ubaidian.test(ship.data.chassis)){
        type = 'neutrals'
      } else if (pirate.test(ship.data.chassis)){
        type = 'pirates'
      } else if (scav.test(ship.data.chassis)){
        type = 'scavengers'
      } else if (enforcer.test(ship.data.chassis)){
        type = 'enforcers'
      } else {
        type = 'others'
      };

      if(ship.uuid === this.target){
        targetted = true;
      }

      if(type && !targetted){
        this.catalogue[type].push({
          ship: {
            x: ship.position.x,
            y: ship.position.y,
            size : ship.data.size
          },
          color: this.mapSettings.colors[type]
        })
      } else if(type && targetted){
        this.catalogue[type].push({
          ship: {
            x: ship.position.x,
            y: ship.position.y,
            size : ship.data.size,
            targetted : true
          },
          color: this.mapSettings.colors[type]
        })
      }
    }
  };
  // if(this.stations.length){
    for(var st=0; st<stationsLength; st++) {
      stationSync = stations[st];
      station = this.stations[stationSync.uuid];
      type = null;
      // debugger
      if(station && ubadian.test(station.data.chassis)){
        type = 'ubadian_stations';
      } else if(station && general.test(station.data.chassis)){
        type = 'pirate_stations';
      } else if(station && scav.test(station.data.chassis)){
        type = 'scavenger_stations';
      };
      if(type){
        this.catalogue[type].push({
          station: {
            x: station.position.x,
            y: station.position.y,
            size : station.data.size
          },
          color: this.mapSettings.colors[type]
        })
      }
    }
  // }
  this._removeShips();
  this._drawShips(); 
};

MiniMapPane.prototype._drawShips = function() {
  var scope = this;

  draw(this.catalogue.pirates);
  draw(this.catalogue.neutrals);
  draw(this.catalogue.others);
  draw(this.catalogue.squadron);
  draw(this.catalogue.enforcers);
  draw(this.catalogue.scavengers);
  draw(this.catalogue.pirate_stations);
  draw(this.catalogue.scavenger_stations);
  draw(this.catalogue.ubadian_stations);


  function draw(group){
    for(var i = 0; i < group.length; i++){
      scope._drawShip(group[i]);
    }
  }
  //place userShip (center point)
  this._drawShip({ship: {x:0,y:0, size: 72}, color: 0x00ff00});
};

MiniMapPane.prototype._drawShip = function(ship) {
  this.shipGroup.add(new Ship(this.game, ship, this.mapSettings));
};

MiniMapPane.prototype._removeShips = function() {
  this.shipGroup.removeAll();
};


//CHANGE FADIN AND OUT TO TWEENS

MiniMapPane.prototype._fadeIn = function() {

  this.game.clock.events.add(3000, function(){
    if(this.parent.alpha < 0.1){
      this.game.clock.events.loop(90, minimapFadeIn = function(){
        this.parent.alpha += 0.055;
        if(this.parent.alpha >= 1){
          for(var i = 0; i < this.game.clock.events.events.length; i++){
            if(this.game.clock.events.events[i].callback.name === 'minimapFadeIn'){
              this.game.clock.events.remove(this.game.clock.events.events[i]);
            }
          }
          this.game.emit('system/sound', 'sensors-online');
        }
      }, this);
    };
  }, this)

};

MiniMapPane.prototype._fadeOut = function() {
  var lossTimer = /^(lossTimer)/;

  for(var i = 0; i < this.game.clock.events.events.length; i++){
    if(this.game.clock.events.events[i].callback.name === 'minimapFadeIn' || lossTimer.test(this.game.clock.events.events[i].callback.name)){
      this.game.clock.events.remove(this.game.clock.events.events[i]);
    }
  }

  if(this.parent.alpha >= 1){
    this.game.clock.events.loop(100, minimapFadeOut = function(){
      this.parent.alpha -= 0.055;
      if(this.parent.alpha <= 0){
        for(var i = 0; i < this.game.clock.events.events.length; i++){
          if(this.game.clock.events.events[i].callback.name === 'minimapFadeOut'){
            this.game.clock.events.remove(this.game.clock.events.events[i]);
          }
        }
      }
    }, this);
  }
};

MiniMapPane.prototype._mapOff = function() {
  // var lossTimer = /^(lossTimer)/;

  // for(var i = 0; i < this.game.clock.events.events.length; i++){
  //   if(this.game.clock.events.events[i].callback.name === 'minimapFadeIn' || lossTimer.test(this.game.clock.events.events[i].callback.name)){
  //     this.game.clock.events.remove(this.game.clock.events.events[i]);
  //   }
  // }

  if(this.parent.alpha >= 1){
    this.parent.alpha = 0;
  }
  //   this.game.clock.events.loop(100, minimapFadeOut = function(){
  //     this.parent.alpha -= 0.055;
  //     if(this.parent.alpha <= 0){
  //       for(var i = 0; i < this.game.clock.events.events.length; i++){
  //         if(this.game.clock.events.events[i].callback.name === 'minimapFadeOut'){
  //           this.game.clock.events.remove(this.game.clock.events.events[i]);
  //         }
  //       }
  //     }
  //   }, this);
  // }
};

MiniMapPane.prototype.paint = function() {
  var parent = this.parent,
      settings = this.settings,
      modifier = this.modifier,
      padding = parent.padding,
      size = parent.size,
      margin = parent.margin,
      left = margin.left + modifier.left,
      top = margin.top + modifier.top,
      width = (size.width - margin.right - margin.left) * modifier.width,
      height = (size.height - margin.top - margin.bottom) * modifier.height,
      drawMethod = 'drawCircle';
  
  if(settings.fillAlpha > 0 || (settings.borderSize > 0 && settings.borderAlpha > 0)) {
    this.clear();

    // draw border
    if(settings.borderSize > 0 && settings.borderAlpha > 0) {
      this.lineStyle(settings.borderSize, settings.borderColor, settings.borderAlpha);
    }
    
    // draw fill
    if(settings.fillAlpha > 0) {
      this.beginFill(settings.color, settings.fillAlpha);
    }
    
    // draw
    this[drawMethod](100,100, settings.radius);
    
    // end fill
    if(settings.fillAlpha > 0) {
      this.endFill();
    }
  }
};

module.exports = MiniMapPane;
