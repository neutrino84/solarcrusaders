
var engine = require('engine'),
    Panel = require('../Panel'),
    TilemapSprite = require('../views/TilemapView'),
    BackgroundView = require('../views/BackgroundView'),
    StackLayout = require('../layouts/StackLayout');

function Tilemap(game, key, layers, settings) {
  Panel.call(this, game, this); //new StackLayout());

  this.setPadding(0);
  this.setBorder(0);

  settings = settings || {};
  settings.bg = settings.bg || {
    // highlight: 2,
    fillAlpha: 0.25,
    color: 0x000000,
    borderSize: 0.0,
    blendMode: engine.BlendMode.MULTIPLY,
  };

  this.sprites = [];
  this.bg = new BackgroundView(game, settings.bg);
  this.tilemap = new engine.Tilemap(game, key);

  this.addView(this.bg);
  
  for(var l in layers) {
    this.sprites.push(new TilemapSprite(
      game, this.tilemap,
        this.tilemap.getLayerIndex(layers[l]),
        this.tilemap.widthInPixels,
        this.tilemap.heightInPixels
    ));
    
    this.tilemap.addTilesetImage(layers[l]);

    this.addView(this.sprites[l]);
  }
};

Tilemap.prototype = Object.create(Panel.prototype);
Tilemap.prototype.constructor = Tilemap;

Tilemap.prototype.calcPreferredSize = function(target) {
  return { width: this.tilemap.widthInPixels, height: this.tilemap.heightInPixels };
};

Tilemap.prototype.doLayout =
  function() {
    var sprite, sprites = this.sprites;
    for(var s in sprites) {
      sprite = sprites[s];
      sprite.position.set(this.left, this.top);
    }
  };

module.exports = Tilemap;
