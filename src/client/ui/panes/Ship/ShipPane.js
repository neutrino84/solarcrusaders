
var engine = require('engine'),
    Layout = require('../../Layout'),
    Panel = require('../../Panel'),
    Image = require('../../components/Image'),
    Label = require('../../components/Label'),
    ButtonIcon = require('../../components/ButtonIcon');

function ShipPane(game, data) {
  Panel.call(this, game, this);

  this.data = data;
  this.hardpoints = [];

  this.setPreferredSize(256, 192);

  this.image = new engine.Sprite(game, game.cache.getRenderTexture(data.chassis + '-outline').texture);
  this.image.blendMode = engine.BlendMode.ADD;
  this.image.tint = 0x336699;
  this.image.rotation = global.Math.PI;
  this.image.pivot.set(this.image.width/2, this.image.height/2);
  this.image.position.set(128, 192/2);
  this.image.scale.set(1.25, 1.25);

  this.addChild(this.image);
};

ShipPane.prototype = Object.create(Panel.prototype);
ShipPane.prototype.constructor = ShipPane;

ShipPane.prototype.doLayout = function() {};

module.exports = ShipPane;
