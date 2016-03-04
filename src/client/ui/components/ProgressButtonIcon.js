
var engine = require('engine'),
    ButtonIcon = require('./ButtonIcon'),
    Label = require('./Label'),
    Layout = require('../Layout'),
    RasterLayout = require('../layouts/RasterLayout'),
    Pane = require('../components/Pane'),
    BackgroundView = require('../views/BackgroundView'),
    Panel = require('../Panel'),
    Class = engine.Class;

function ProgressButtonIcon(game, key, settings) {
  this.value = 0.0;

  this.progressBg = new BackgroundView(game,
    Class.mixin(settings.progress, {
      color: 0x09346b,
      borderSize: 0.0
    }
  ));

  this.progress = new BackgroundView(game,
    Class.mixin(settings.progress, {
      color: 0xf4f4f4,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD
    }
  ));

  ButtonIcon.call(this, game, key,
    Class.mixin(settings, {
      padding: [1, 1, 1, 5],
      bg: {
        fillAlpha: 1.0,
        color: 0x3868b8,
        radius: 0.0
      },
      icon: {
        bg: {
          highlight: false,
          borderSize: 0.0
        }
      },
      hotkey: {
        key: '',
        padding: [2],
        border: [0],
        text: {
          fontName: 'small'
        },
        bg: {
          color: 0x3868b8,
          fillAlpha: 1.0,
          borderSize: 0.0,
          radius: 0.0
        }
      },
      count: {
        padding: [0],
        border: [0],
        bg: {
          fillAlpha: 0.0,
          borderSize: 0.0,
          radius: 0.0
        }
      }
    })
  );

  this.addView(this.progressBg);
  this.addView(this.progress);

  this.count = new Label(game, ' ', this.settings.count);
  this.hotkey = new Label(game, this.settings.hotkey.key, this.settings.hotkey);
  
  this.raster = new Panel(game, new RasterLayout(Layout.USE_PS_SIZE));
  this.raster.setPreferredSize(this.settings.width, this.settings.height);
  this.raster.addPanel(Layout.NONE, this.hotkey);
  this.raster.addPanel(Layout.CENTER, this.count);

  this.addPanel(Layout.NONE, this.raster);

  this.hotkey.setLocation(-2, -2);
}

ProgressButtonIcon.prototype = Object.create(ButtonIcon.prototype);
ProgressButtonIcon.prototype.constructor = ProgressButtonIcon;

ProgressButtonIcon.prototype.setProgressBar = function(decimal) {
  this.value = global.Math.min(1, decimal);
  this.recalc();
  this.progress.paint();
};

ProgressButtonIcon.prototype.recalc = function() {
  var size = this.size,
      progressBgSettings = this.progressBg.settings,
      progressSettings = this.progress.settings;
  
  progressSettings.size = { width: 3, height: size.height * this.value };
  progressSettings.offset = { x: size.width - 3, y: size.height - size.height * this.value };
  
  progressBgSettings.size = { width: 4, height: size.height };
  progressBgSettings.offset = { x: size.width - 4, y: 0 };
};

Object.defineProperty(ProgressButtonIcon.prototype, 'disabled', {
  set: function(value) {
    if(value === false) {
      this.image.tint = 0xFFFFFF;
    } else {
      this.image.tint = 0xFF0000;
      this.bg.alpha = 0.75;
    }
    this._disabled = value;
  },

  get: function() {
    return this._disabled;
  }
});

module.exports = ProgressButtonIcon;
