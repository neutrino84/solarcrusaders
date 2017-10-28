
var Pane = require('../../components/Pane'),
    Label = require('../../components/Label'),
    Layout = require('../../Layout'),
    ShipButton = require('./ShipButton');

function ShipPane(game) {
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    margin: [8, 0, 0, 0],
    layout: {
      type: 'list',
      columns: 8,
      gap: [8, 8]
    }
  });

  this.buttons = {};
  this.selectable = ['ubaidian-x01', 'ubaidian-x05'];
  this.config = this.game.cache.getJSON('ship-configuration');
};

ShipPane.prototype = Object.create(Pane.prototype);
ShipPane.prototype.constructor = ShipPane;

ShipPane.prototype.create = function() {
  var game = this.game,
      settings = this.settings,
      selectable = this.selectable,
      config = this.config,
      buttons = this.buttons,
      button;

  for(var i=0; i<selectable.length; i++) {
    button = new ShipButton(game, selectable[i], config[selectable[i]]);
    button.create();
    button.start();
    button.on('inputUp', this.selected, this);
    buttons[selectable[i]] = button;
    
    this.addPanel(button);
  }
};

ShipPane.prototype.selected = function(button) {
  this.game.emit('ui/shipyard/hide');
  this.game.net.socket.emit('user/ship', {
    name: button.name
  });
};

module.exports = ShipPane;
