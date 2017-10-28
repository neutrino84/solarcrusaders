
var engine = require('engine');

function ImageView(game, key, frame) {
  engine.Sprite.call(this, game, key, frame);
};

ImageView.prototype = Object.create(engine.Sprite.prototype);
ImageView.prototype.constructor = ImageView;

ImageView.prototype.paint = function() {};

module.exports = ImageView;
