
var engine = require('engine'),
    ButtonIcon = require('./ButtonIcon'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    BackgroundView = require('../views/BackgroundView'),
    Panel = require('../Panel'),
    Class = engine.Class;

function ProgressButtonIcon(game, key, settings) {
  this.decimal = 0.0;

  this.progressBg = new BackgroundView(game,
    Class.mixin(settings.progress, {
      color: 0x09346b,
      borderSize: 0.0
    }
  ));

  this.progress = new BackgroundView(game,
    Class.mixin(settings.progress, {
      color: 0x999999,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD
    }
  ));

  ButtonIcon.call(this, game, key,
    Class.mixin(settings, {
      padding: [0, 0, 0, 4],
      bg: {
        radius: 0.0
      },
      icon: {
        bg: {
          borderSize: 0.0,
          radius: 0.0
        }
      }
    })
  );

  this.addView(this.progressBg);
  this.addView(this.progress);
}

ProgressButtonIcon.prototype = Object.create(ButtonIcon.prototype);
ProgressButtonIcon.prototype.constructor = ProgressButtonIcon;

ProgressButtonIcon.prototype.setProgressBar = function(decimal) {
  this.decimal = global.Math.min(1, decimal);
  this.recalc();
  this.progress.paint();
};

ProgressButtonIcon.prototype.recalc = function() {
  var size = this.size,
      progressBgSettings = this.progressBg.settings,
      progressSettings = this.progress.settings;
  progressSettings.size = { width: 4, height: size.height * this.decimal };
  progressSettings.offset = { x: size.width - 4, y: size.height - size.height * this.decimal };
  progressBgSettings.size = { width: 4, height: size.height };
  progressBgSettings.offset = { x: size.width - 4, y: 0 };
};

module.exports = ProgressButtonIcon;
