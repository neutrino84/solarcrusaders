
var engine = require('engine'),
    Panel = require('../Panel'),
    SelectionView = require('../views/SelectionView'),
    Class = engine.Class;

function Selection(game) {
  Panel.call(this, game, this);

  this.selection = new SelectionView(game);
  this.selection.start();
  // this.selection.on('selected', this._selected, this);

  this.addView(this.selection);
};

Selection.prototype = Object.create(Panel.prototype);
Selection.prototype.constructor = Selection;

Selection.prototype.calcPreferredSize = function(target) {
  return { width: 0, height: 0 };
};

Selection.prototype.doLayout = function() {};

// Selection.prototype._selected = function(rectangle) {
//   this.game.emit('gui/sector/selected', rectangle);
// };

module.exports = Selection;
