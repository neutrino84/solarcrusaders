
var engine = require('engine'),
    Layout = require('../../Layout'),
    Panel = require('../../Panel'),
    Image = require('../../components/Image'),
    Label = require('../../components/Label'),
    ButtonIcon = require('../../components/ButtonIcon');

function ShipPane(game) {
  Panel.call(this, game, this);

  this.data = null;
  this.drag = null;
  this.hardpoints = {};
  this.caps = {};

  this.setPreferredSize(256, 228);
};

ShipPane.prototype = Object.create(Panel.prototype);
ShipPane.prototype.constructor = ShipPane;

ShipPane.prototype.create = function(data) {
  var game = this.game;

  // set data
  this.data = data;

  // get configuration
  this.config = game.cache.getJSON('ship-configuration', false)[data.chassis]['targeting']['hardpoints'];

  // create ship
  this.chassis = new engine.Sprite(game, 'texture-atlas', data.chassis + '.png');
  this.chassis.rotation = global.Math.PI;
  this.chassis.pivot.set(this.chassis.width/2, this.chassis.height/2);
  this.chassis.position.set(128, 114);

  // create outline
  this.outline = new engine.Sprite(game, game.cache.getRenderTexture(data.chassis + '-outline').texture);
  this.outline.blendMode = engine.BlendMode.ADD;
  this.outline.tint = 0x5588bb;

  // add to display
  this.addChild(this.chassis);
  this.chassis.addChild(this.outline);

  // create hardpoint slots
  for(var h in this.config) {
    this.hardpoints[h] = this._hardpoint(data.hardpoints[h], this.config[h]);
    this.hardpoints[h].id = h;
    
    this.caps[h] = this._cap(this.config[h]);

    this.chassis.addChild(this.hardpoints[h]);
    this.chassis.addChild(this.caps[h]);
  }
};

ShipPane.prototype.doLayout = function() {};

ShipPane.prototype.start = function() {
  var hardpoint,
      hardpoints = this.hardpoints;
  for(var h in hardpoints) {
    hardpoint = hardpoints[h];
    hardpoint.input.start();
  }
  this.tween && this.tween.stop();
  this.tween = this.game.tweens.create(this.outline);
  this.tween.to({ alpha: 0.25 }, 2000, engine.Easing.Quadratic.InOut, true, 0, -1, true);
};

ShipPane.prototype.stop = function() {
  var hardpoint,
      hardpoints = this.hardpoints;
  for(var h in hardpoints) {
    hardpoint = hardpoints[h];
    hardpoint.input.stop();
  }
  this.tween.stop();
  this.outline.alpha = 1.0;
};

ShipPane.prototype._hardpoint = function(data, config) {
  var hardpoint;
  if(data != undefined) {
    hardpoint = new engine.Sprite(game, 'texture-atlas', data.sprite + '.png');
    hardpoint.position.set(config.position.x, config.position.y);
    hardpoint.pivot.set(config.pivot.x, config.pivot.y);

    hardpoint.inputEnabled = true;
    hardpoint.input.priorityID = 2;
    hardpoint.input.stop();

    hardpoint.on('inputDown', this._hardpointInputDown, this);
    hardpoint.on('inputUp', this._hardpointInputUp, this);
    hardpoint.on('inputOver', this._hardpointInputOver, this);
    hardpoint.on('inputOut', this._hardpointInputOut, this);
  }
  return hardpoint;
};

ShipPane.prototype._cap = function(config) {
  var cap = new engine.Sprite(game, 'texture-atlas', 'turret-cap-ubaidian.png');
      cap.position.set(config.position.x, config.position.y);
      cap.pivot.set(config.pivot.x, config.pivot.y);
  return cap;
}

ShipPane.prototype._hardpointInputDown = function(sprite, pointer) {
  var game = this.game,
      // hardpoints = this.data.hardpoints,
      // data = hardpoints[sprite.id],
      position = sprite.worldTransform.apply(sprite.pivot),
      highlight;
  if(data != undefined) {
    sprite.alpha = 0.5;

    highlight = new engine.Sprite(game, sprite.texture);
    highlight.tint = 0x5599FF;
    highlight.blendMode = engine.BlendMode.ADD;

    this.drag = new engine.Sprite(game, sprite.texture);
    this.drag.id = sprite.id;
    this.drag.pivot.set(sprite.pivot.x, sprite.pivot.y);
    this.drag.position.set(position.x, position.y);
    this.drag.inputEnabled = true;
    this.drag.input.priorityID = 3;
    this.drag.rotation = global.Math.PI;
    this.drag.input.enableDrag();
    this.drag.input.startDrag(pointer);
    this.drag.addChild(highlight);

    game.gui.root.addChild(this.drag);
  }
};

ShipPane.prototype._hardpointInputUp = function(sprite, pointer) {
  var game = this.game,
      tween = game.tweens.create(this.drag.position),
      dragStartPoint = this.drag.input.dragStartPoint;
  
  // stop drag
  this.drag.input.stopDrag(pointer);
  
  if(this.drag.caught) {
    sprite.destroy();
    this.drag.destroy();
    delete this.hardpoints[sprite.id];
  } else {
    tween.to({ x: dragStartPoint.x, y: dragStartPoint.y }, 100, engine.Easing.Quadratic.Out, true);
    tween.on('complete', function() {
      sprite.alpha = 1.0;
      this.drag.destroy();
    }, this);
  }
};

ShipPane.prototype._hardpointInputOver = function(sprite, pointer) {
  var game = this.game,
      cap = this.caps[sprite.id],
      highlight = new engine.Sprite(game, sprite.texture);
      highlight.tint = 0x5599FF;
      highlight.blendMode = engine.BlendMode.ADD;

  cap.tween && cap.tween.stop();
  cap.tween = game.tweens.create(cap);
  cap.tween.to({ x: sprite.x + 5 }, 100, engine.Easing.Quadratic.InOut, true);

  sprite.addChild(highlight);
};

ShipPane.prototype._hardpointInputOut = function(sprite, pointer) {
  var cap = this.caps[sprite.id];
      
  cap.tween && cap.tween.stop();
  cap.tween.to({ x: sprite.x }, 100, engine.Easing.Default, true);
  
  this.timeout && clearTimeout(this.timeout);
  this.timeout = setTimeout(function() {
    sprite.removeChildren();
  }, 20);
};

module.exports = ShipPane;
