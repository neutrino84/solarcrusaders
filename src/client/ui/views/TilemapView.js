
var engine = require('engine'),
    View = require('../View'),
    TilemapSprite = engine.TilemapSprite;

function TilemapView(game, key, index, width, height) {
  TilemapSprite.call(this, game, key, index, width, height);
  View.call(this);
};

// multiple inheritence
TilemapView.prototype = Object.create(TilemapSprite.prototype);
TilemapView.prototype.mixinPrototype(View.prototype);
TilemapView.prototype.constructor = TilemapView;

module.exports = TilemapView;
