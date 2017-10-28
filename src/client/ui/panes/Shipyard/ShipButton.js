
var pixi = require('pixi'),
    Label = require('../../components/Label'),
    Layout = require('../../Layout'),
    TextView = require('../../views/TextView'),
    ImageView = require('../../views/ImageView'),
    BackgroundView = require('../../views/BackgroundView'),
    ButtonIcon = require('../../components/ButtonIcon');

function ShipButton(game, name, data) {
  ButtonIcon.call(this, game, {
    width: 128,
    height: 96,
    icon: {
      frame: 'explosion-d.png',
      tint: {
        enabled: 0x67a4ff,
        disabled: 0x333333,
        over: 0x67a4ff,
        down: 0x67a4ff,
        up: 0x67a4ff
      },
      alpha: {
        enabled: 0.8,
        disabled: 0.5,
        over: 1.0,
        down: 1.0,
        up: 1.0
      }
    },
    line: {
      color: 0x67a4ff,
      fillAlpha: 0.4,
      modifier: {
        left: 0.0, top: 0.0,
        width: 1.0, height: 2*(1/96)
      }
    },
    bg: {
      color: 0x131f30,
      fillAlpha: 0.24,
      alpha: {
        enabled: 1.0,
        disabled: 1.0,
        over: 1.0,
        down: 1.0,
        up: 1.0
      }
    }
  });

  this.name = name;
  this.data = data;
};

ShipButton.prototype = Object.create(ButtonIcon.prototype);
ShipButton.prototype.constructor = ShipButton;

ShipButton.prototype.create = function() {
  // scale background
  this.image.scale.set(1.0, 0.75);

  // labels
  this.title = new TextView(this.game, { name: 'medium', text: this.data.name.toUpperCase() });
  this.title.position.set(8, 4);
  this.title.alpha = 0.8;

  this.class = new TextView(this.game, { name: 'small', text: this.data.class });
  this.class.position.set(8, 14);
  this.class.alpha = 0.8;

  // add design
  this.line = new BackgroundView(this.game, this.settings.line);
  this.line.position.set(0, 94);
  this.line.alpha = 0.5;

  // add ship image
  this.ship = new ImageView(this.game, 'texture-atlas', this.name + '.png');
  this.ship.scale.set(0.5, 0.5);
  this.ship.position.set((128-this.ship.width)/2, (96-this.ship.height)/2);

  // add views
  this.addView(this.ship);
  this.addView(this.line);
  this.addView(this.title);
  this.addView(this.class);
};

ShipButton.prototype._inputOver = function() {
  this.ship.blendMode = pixi.BLEND_MODES.ADD;
  this.title.alpha = 1.0;
  this.class.alpha = 1.0;
  this.line.alpha = 1.0;

  ButtonIcon.prototype._inputOver.call(this);
};

ShipButton.prototype._inputOut = function() {
  this.ship.blendMode = pixi.BLEND_MODES.NORMAL;
  this.line.alpha = 0.5;
  this.title.alpha = 0.8;
  this.class.alpha = 0.8;

  ButtonIcon.prototype._inputOut.call(this);
};

module.exports = ShipButton;
