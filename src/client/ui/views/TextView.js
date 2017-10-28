
var engine = require('engine');

function TextView(game, settings) {
  engine.Sprite.call(this, game);

  this.settings = settings;
  this.font = new engine.Font(game, this.settings);
  this.font.text = this.settings.text || '';
  this.texture = this.font.texture;
};

TextView.prototype = Object.create(engine.Sprite.prototype);
TextView.prototype.constructor = TextView;

TextView.prototype.paint = function() {};

module.exports = TextView;
