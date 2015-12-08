
var xhr = require('xhr'),
    engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    ButtonIcon = require('../components/ButtonIcon');

function LeftPane(game, settings) {
  Pane.call(this, game, {
    padding: [6],
    layout: {
      gap: 6
    },
    bg: {
      color: 0x336699,
      fillAlpha: 0.2,
      borderSize: 0.0,
      radius: 1
    }
  });

  this.icon1 = new ButtonIcon(game, 'icon1');
  this.icon1.on('inputUp', this._logout, this);

  this.addPanel(Layout.NONE, this.icon1);
};

LeftPane.prototype = Object.create(Pane.prototype);
LeftPane.prototype.constructor = LeftPane;

LeftPane.prototype._logout = function() {
  var self = this,
      header = {
        method: 'get',
        uri: '/logout',
        headers: {
          'Content-Type': 'application/json'
        }
      };
  xhr(header, function(err, resp, body) {
    var response = JSON.parse(body),
        user = response.user,
        error = err || response.error;
    if(error) {
      self.game.emit('gui/alert', 'an unknown error has occurred');
    }
    self.game.emit('gui/logout');
  });
};

module.exports = LeftPane;
