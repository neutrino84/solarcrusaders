
var engine = require('engine');

function TextView(game, settings) {
  engine.Sprite.call(this, game);

  this.font = new engine.Font(game, settings);
  this.font.text = settings.text || '';
};

// multiple inheritence
TextView.prototype = Object.create(engine.Sprite.prototype);
TextView.prototype.constructor = TextView;

TextView.prototype.paint = function() {
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

module.exports = TextView;
