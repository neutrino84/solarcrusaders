
var engine = require('engine');

function ImageView(game, key, frame) {
  engine.Sprite.call(this, game, key, frame);
};

ImageView.prototype = Object.create(engine.Sprite.prototype);
ImageView.prototype.constructor = ImageView;

ImageView.prototype.paint = function() {
  var parent = this.parent,
      position = this.position,
      padding = parent.padding,
      margin = parent.margin,
      left = margin.left,
      top = margin.top;
  
  // reposition
  position.set(
  	margin.left + padding.left,
  	margin.top + padding.top);
};

module.exports = ImageView;
