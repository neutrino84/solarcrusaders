
var engine = require('engine'),
    Graphics = engine.Graphics,
    CircleView = require('../views/CircleView'),
    Ship = require('../../objects/sector/minimap/Ship'),
    Class = engine.Class;

function MiniMapPane(game, settings) {
  CircleView.call(this, game);
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
  // console.log(game.height, divider, size)
  // debugger
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

  // this.others = [];
  // this.squadron = [];
  // this.neutrals = [];
  // this.pirates = [];
  // this.users = [];
  // this.scavengers = [];

  this._populate();

  this._drawShips();

  this.game.on('mapData', this._mapData, this)
};

// multiple inheritence
MiniMapPane.prototype = Object.create(Graphics.prototype);
MiniMapPane.prototype.constructor = MiniMapPane;

MiniMapPane.prototype._mapData = function(player, data) {
  var scope = this, 
      pirate = /^(pirate)/,
      ubaidian = /^(ubaidian)/,
      scav = /^(scavenger)/, type,
      ai;


  this.mapSettings.user.ship.x = player.position.x;
  this.mapSettings.user.ship.y = player.position.y;

  this.catalogue = {
    squadron : [],
    pirates : [],
    neutrals : [],
    scavengers : [],
    users : [],
    others : []
  }
  // this.others = [];
  // this.squadron = [];
  // this.neutrals = [];
  // this.pirates = [];
  // this.scavengers = [];

  for(var i = 0; i < data.length; i++){
    // data[i].data.ai = ai;
    if(data[i].data.masterShip && data[i].data.masterShip == player.uuid){
      type = 'squadron'

      // this.catalogue['squadron'].push({
      //   ship: {
      //     x: data[i].position.x,
      //     y: data[i].position.y
      //   },
      //   color: this.mapSettings.colors['squadron']
      // })
    } else if(ubaidian.test(data[i].data.chassis)){
      // && data[i] !== player

      type = 'neutrals'

      // this.neutrals.push({
      //   ship: {
      //     x: data[i].position.x,
      //     y: data[i].position.y
      //   },
      //   color: this.mapSettings.colors['neutral']
      // })
    } else if (pirate.test(data[i].data.chassis)){
      type = 'pirates'
      // this.pirates.push({
      //   ship: {
      //     x: data[i].position.x,
      //     y: data[i].position.y
      //   },
      //   color: this.mapSettings.colors['pirates']
      // })
    } else if (scav.test(data[i].data.chassis)){
      type = 'scavengers'

      // this.scavengers.push({
      //   ship: {
      //     x: data[i].position.x,
      //     y: data[i].position.y
      //   },
      //   color: this.mapSettings.colors['scavengers']
      // })
    }


    this.catalogue[type].push({
      ship: {
        x: data[i].position.x,
        y: data[i].position.y
      },
      color: this.mapSettings.colors[type]
    })



  }

  // debugger
  this._removeShips();
  this._drawShips();
};

// MiniMapPane.prototype._drawShips = function() {
//   var scope = this;

//   draw(this.pirate);
//   draw(this.neutrals);
//   draw(this.squadron);

//   draw(this.users);

//   function draw(group){
//     for(var i = 0; i < group.length; i++){
//       scope._drawShip(group[i]);
//     }
//   }
// };

MiniMapPane.prototype._populate = function() {
  var scope = this;

  // placeShips(this.others, 5, this.mapSettings.colors.other);
  // placeShips(this.neutrals, 4, this.mapSettings.colors.neutral);
  // placeShips(this.pirate, 6, this.mapSettings.colors.pirate);


  // placeShips(this.users, 1, this.mapSettings.colors.user);

  function placeShips(shipType, count, color){
    for(var i = 0; i < count; i++) {
      shipType.push({
          ship: {
              x: scope.mapSettings.user.ship.x + engine.Math.getRandomInt(-300, 300),
              y: scope.mapSettings.user.ship.y + engine.Math.getRandomInt(-300, 300),
          },
          color: color
      });
    }
  }
};

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
  this._drawShip({ship: {x:3100,y:200}, color: 0x00ff00});
};

MiniMapPane.prototype._drawShip = function(ship) {
  this.shipGroup.add(new Ship(this.game, ship, this.mapSettings));
};

MiniMapPane.prototype._removeShips = function() {
  this.shipGroup.removeAll();
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
