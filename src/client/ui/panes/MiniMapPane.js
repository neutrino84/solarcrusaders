
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
      scavengers: 0x9932CC
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
    users : [],
    others : []
  }

  this.ships = {};
  this.player;

  this._drawShips();

  // this.game.on('mapData', this._mapData, this)

  this.game.on('shipsDump', this._shipsRefresh, this)
  this.game.on('sector/sync', this._sync, this);

  this.game.on('ship/player', this._player, this);
  this.game.on('player/disabled', this._fadeOut, this);
  this.game.on('player/enabled', this._fadeIn, this);
};


MiniMapPane.prototype = Object.create(Graphics.prototype);
MiniMapPane.prototype.constructor = MiniMapPane;

MiniMapPane.prototype._shipsRefresh = function(ships) {
    this.ships = ships;
};

MiniMapPane.prototype._player = function(ship) {
    this.player = ship;
};

MiniMapPane.prototype._sync = function(data) {
  var game = this.game,
      ships = data.ships,
      length = ships.length,
      pirate = /^(pirate)/,
      ubaidian = /^(ubaidian)/,
      scav = /^(scavenger)/,
      sync, ship, type;
  this.catalogue = {
    squadron : [],
    pirates : [],
    neutrals : [],
    scavengers : [],
    users : [],
    others : []
  }

  for(var s=0; s<length; s++) {
    sync = ships[s];
    ship = this.ships[sync.uuid];
    type = null;

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
      } else {
        type = 'others'
      }
      if(type){
        this.catalogue[type].push({
          ship: {
            x: ship.position.x,
            y: ship.position.y,
            size : ship.data.size
          },
          color: this.mapSettings.colors[type]
        })
      }
    }
  }
  this._removeShips();
  this._drawShips(); 
};

// MiniMapPane.prototype._mapData = function(player, data) {
//   var scope = this, 
//       pirate = /^(pirate)/,
//       ubaidian = /^(ubaidian)/,
//       scav = /^(scavenger)/, type,
//       ai;
//   this.mapSettings.user.ship.x = player.position.x;
//   this.mapSettings.user.ship.y = player.position.y;


//   this.catalogue = {
//     squadron : [],
//     pirates : [],
//     neutrals : [],
//     scavengers : [],
//     users : [],
//     others : []
//   }
//   for(var i = 0; i < data.length; i++){
//     // data[i].data.ai = ai;
//     if(data[i].data.masterShip && data[i].data.masterShip == player.uuid){
//       type = 'squadron'
//     } else if(ubaidian.test(data[i].data.chassis)){
//       type = 'neutrals'
//     } else if (pirate.test(data[i].data.chassis)){
//       type = 'pirates'
//     } else if (scav.test(data[i].data.chassis)){
//       type = 'scavengers'
//     } else {
//       type = 'others'
//     }
//     this.catalogue[type].push({
//       ship: {
//         x: data[i].position.x,
//         y: data[i].position.y,
//         size : data[i].data.size
//       },
//       color: this.mapSettings.colors[type]
//     })
//   }
//   this._removeShips();
//   this._drawShips();
// };

MiniMapPane.prototype._drawShips = function() {
  var scope = this;

  draw(this.catalogue.pirates);
  draw(this.catalogue.neutrals);
  draw(this.catalogue.others);
  draw(this.catalogue.squadron);
  draw(this.catalogue.scavengers);


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

MiniMapPane.prototype._fadeIn = function() {

  this.game.clock.events.add(3000, function(){
    if(this.parent.alpha < 0.1){
      this.game.clock.events.loop(90, minimapFadeIn = function(){
        this.parent.alpha += 0.055;
        if(this.parent.alpha >= 1){
          for(var i = 0; i < this.game.clock.events.events.length; i++){
            if(this.game.clock.events.events[i].callback.name === 'minimapFadeIn'){
              this.game.clock.events.remove(this.game.clock.events.events[i]);
              console.log('got here. found FadeIn  1111111')
            }
          }
          this.game.emit('system/sound', 'sensors-online');
        }
      }, this);
    };
  }, this)

};

MiniMapPane.prototype._fadeOut = function() {

  console.log(this.game.clock.events.events)
  for(var i = 0; i < this.game.clock.events.events.length; i++){
    if(this.game.clock.events.events[i].callback.name === 'minimapFadeIn'){
      console.log('got here. found FadeIn')
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
