
var engine = require('engine'),
    View = require('../View'),
    Sprite = engine.Sprite;

function ImageView(game, key) {
  Sprite.call(this, game, key);
  View.call(this);
};

// multiple inheritence
ImageView.prototype = Object.create(Sprite.prototype);
ImageView.prototype.mixinPrototype(View.prototype);
ImageView.prototype.constructor = ImageView;

module.exports = ImageView;
