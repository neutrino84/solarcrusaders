
var xhr = require('xhr'),
    engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    Image = require('../components/Image'),
    Input = require('../components/Input'),
    Button = require('../components/Button'),
    Class = engine.Class;

function UserPane(game, settings) {
  Pane.call(this, game, {
    padding: [1],
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD,
      radius: 0.0
    },
    user: {
      padding: [3, 4, 4, 3],
      layout: {
        direction: Layout.HORIZONTAL,
        gap: 4
      },
      bg: {
        fillAlpha: 0.8,
        color: 0x000000,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.MULTIPLY
      }
    },
    edition: {
      padding: [5, 5, 4, 5],
      border: [0],
      bg: {
        color: 0x336699,
        fillAlpha: 1.0,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.ADD,
      },
      text: {
        fontName: 'full'
      }
    },
    label: {
      padding: [5, 10, 4, 10],
      bg: {
        fillAlpha: 0.0,
        radius: 0.0,
        borderSize: 0.0
      },
      text: {
        fontName: 'full'
      }
    },
    icon: {
      border: [0],
      bg: false
    },
    logout: {
      padding: [1],
      border: [0],
      bg: {
        radius: 0.0,
        color: 0x336699,
        fillAlpha: 1.0,
        blendMode: engine.BlendMode.ADD
      },
      label: {
        padding: [4, 5, 3, 5],
        bg: {
          fillAlpha: 0.2,
          color: 0x000000,
          radius: 0.0,
          borderSize: 0.0,
          blendMode: engine.BlendMode.MULTIPLY
        },
        text: {
          fontName: 'full'
        }
      }
    }
  });

  this.user = new Pane(game, this.settings.user);
  
  this.logoutButton = new Button(game, 'logout', this.settings.logout);
  this.logoutButton.on('inputUp', this._logout, this);
  
  this.editionLabel = new Label(game, '', this.settings.edition);

  this.usernameLabel = new Label(game, '', this.settings.label);
  this.usernameLabel.tint = 0x00ff00;

  this.creditsImage = new Image(game, 'texture-atlas', Class.mixin({
    padding: [1, 10, 0, 0],
    frame: 'icon-credits.png'
  }, this.settings.icon));

  this.reputationImage = new Image(game, 'texture-atlas', Class.mixin({
    padding: [2, 10, 0, 0],
    frame: 'icon-reputation.png'
  }, this.settings.icon));

  this.killsImage = new Image(game, 'texture-atlas', Class.mixin({
    padding: [1, 10, 0, 0],
    frame: 'icon-kills.png'
  }, this.settings.icon));

  this.creditsLabel = new Label(game, '0.00', this.settings.label);
  this.reputationLabel = new Label(game, '0', this.settings.label);
  this.killsLabel = new Label(game, '0/0/0', this.settings.label);

  // this.user.addPanel(Layout.NONE, this.editionLabel);
  this.user.addPanel(Layout.NONE, this.usernameLabel);
  this.user.addPanel(Layout.NONE, this.creditsImage);
  this.user.addPanel(Layout.NONE, this.creditsLabel);
  this.user.addPanel(Layout.NONE, this.reputationImage);
  this.user.addPanel(Layout.NONE, this.reputationLabel);
  this.user.addPanel(Layout.NONE, this.killsImage);
  this.user.addPanel(Layout.NONE, this.killsLabel);
  // this.user.addPanel(Layout.NONE, this.logoutButton);

  this.addPanel(Layout.STRETCH, this.user);

  this.game.on('gui/player/select', this._playerSelect, this);
};

UserPane.prototype = Object.create(Pane.prototype);
UserPane.prototype.constructor = UserPane;

UserPane.prototype.start = function() {

};

UserPane.prototype.stop = function() {

};

UserPane.prototype.login = function(user) {
  // this.visible = true;
  this._updateUser(user);
  this._updateEdition(user);
  this.invalidate(true);
};

UserPane.prototype.logout = function() {
  // this.visible = false;
  this._updateUser()
  this.invalidate(true);
};

UserPane.prototype._updateUser = function() {
  var user = user || this.game.auth.user;
  this.usernameLabel.text = user.username;
  this.creditsLabel.text = engine.Math.formatMoney(user.credits);
  this.reputationLabel.text = user.reputation;
};

UserPane.prototype._updateEdition = function(data) {
  var group,
      edition = data.edition;
  switch(edition) {
    case 'captain':
      group = 'alpha'; break;
    case 'commander':
      group = 'alpha'; break;
    case 'lieutenant':
      group = 'beta'; break;
    case 'none':
      group = 'alpha'; break;
    default:
      group = edition;
  }
  this.editionLabel.text = group.toUpperCase();
}

UserPane.prototype._playerSelect = function(data) {
  this.data && this.data.removeListener('data', this._updateStats, this);
  this.data = data;
  this.data.on('data', this._updateStats, this);
  
  this._updateStats(data);
};

UserPane.prototype._updateStats = function(data) {
  if(data.kills || data.disables || data.assists) {
    this.killsLabel.text = this.data.kills + '/' +
      this.data.disables + '/' + this.data.assists;
    this.invalidate(true);
  }
};

UserPane.prototype._logout = function() {
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

module.exports = UserPane;
