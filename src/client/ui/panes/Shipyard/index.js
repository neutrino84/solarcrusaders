
var Panel = require('../../Panel'),
    Pane = require('../../components/Pane'),
    Layout = require('../../Layout');

function Shipyard(game) {
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    padding: [4],
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.CENTER,
      direction: Layout.HORIZONTAL, 
      gap: 4
    }
  });
};

Shipyard.prototype = Object.create(Pane.prototype);
Shipyard.prototype.constructor = Shipyard;

Shipyard.prototype.create = function() {

};

Shipyard.prototype.show = function() {

};

Shipyard.prototype.hide = function() {

};

module.exports = Shipyard;
