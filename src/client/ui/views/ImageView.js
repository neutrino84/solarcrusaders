
var engine = require('engine'),
    Sprite = engine.Sprite;

function ImageView(game, key, frame) {
  Sprite.call(this, game, key, frame);
};

// multiple inheritence
ImageView.prototype = Object.create(Sprite.prototype);
ImageView.prototype.constructor = ImageView;

ImageView.prototype.paint = function() {
  var parent = this.parent,
      settings = this.settings,
      padding = parent.padding,
      margin = parent.margin,
      left = margin.left,
      top = margin.top;
  
  this.position.set(margin.left + padding.left, margin.top + padding.top);
};

module.exports = ImageView;
