
var engine = require('engine');

function Room(tilemap, id, data) {
  this.tilemap = tilemap;
  this.game = tilemap.game;
  this.id = id || -1;
  this.data = data || {};
  
  // this.contain = new engine.Rectangle(x, y, width, height);
  // this.intersect = new engine.Rectangle(x + 1, y + 1, width - 1, height -1);
  
  // this.cache = {
  //   crew: {count:0},
  //   doors: {},
  //   systems: {}
  // }

  this.targetGraphics = this._drawRoom(data, 0xff0000);
  this.selectGraphics = this._drawRoom(data, 0x6699cc);

  this.selectGraphics.on('inputOver', this._inputOver, this);
  this.selectGraphics.on('inputOut', this._inputOut, this);
  this.selectGraphics.on('inputDown', this._inputDown, this);

  this.tilemap.add(this.selectGraphics);
  this.tilemap.add(this.targetGraphics);
};

Room.prototype = Object.create(engine.Sprite.prototype);
Room.prototype.constructor = Room;

Room.prototype.target = function(renderable) {
  this.targetTween && this.targetTween.stop();

  this.targetGraphics.alpha = 1.0;
  this.targetGraphics.renderable = renderable;

  if(renderable) {
    this.targetTween = this.game.tweens.create(this.targetGraphics);
    this.targetTween.to({ alpha: 0.0 }, 250, engine.Easing.Default, true, 0, -1, true);
  }
};

Room.prototype._drawRoom = function(data, color) {
  var graphics = new engine.Graphics(this.game);
      graphics.lineStyle(2, color, 1.0);
      graphics.beginFill(color, 0.2);
      graphics.drawRect(data.x, data.y, data.width, data.height);
      graphics.endFill();
      graphics.renderable = false;
  return graphics;
};

Room.prototype._inputOver = function() {
  this.selectGraphics.renderable = true;
};

Room.prototype._inputOut = function() {
  this.selectGraphics.renderable = false;
};

Room.prototype._inputDown = function(displayObject, pointer) {
  if(pointer.button === engine.Mouse.RIGHT_BUTTON) {
    this.emit('targeted', this);
  } else if(pointer.button === engine.Mouse.LEFT_BUTTON) {
    this.emit('targeted', this);
    // this.emit('selected', this);
  }
};

// Room.prototype.generateLighting = function() {
//   var tilemap = this.tilemap,
//       shadow = new engine.BitmapData(tilemap.game, null, this.contain.width, this.contain.height),
//       light = new engine.BitmapData(tilemap.game, null, this.contain.width, this.contain.height);

//   shadow.ctx.fillStyle = this._getGradient(shadow, '#ccc', '#000');
//   shadow.ctx.fillRect(0, 0, this.contain.width, this.contain.height);
//   shadow.dirty = true;

//   light.ctx.fillStyle = this._getGradient(light, '#ff0000', '#000');
//   light.ctx.fillRect(0, 0, this.contain.width, this.contain.height);
//   light.dirty = true;

//   this.shadow = new engine.Image(tilemap.game, this.contain.x, this.contain.y, shadow);
//   this.shadow.blendMode = engine.blendModes.MULTIPLY;
//   this.shadow.alpha = 1;

//   this.light = new engine.Image(tilemap.game, this.contain.x, this.contain.y, light);
//   this.light.blendMode = engine.blendModes.ADD;
//   this.light.alpha = 0.0;

//   this.tween2 = tilemap.game.add.tween(this.light);
//   this.tween2.to({alpha: 0.6}, 2000, engine.Easing.Quadratic.InOut);
//   this.tween2.repeat(-1, 0);
//   this.tween2.yoyo(true, 0);
//   this.tween2.delay(Math.random() * 500)
//   this.tween2.start();

//   tilemap.group.add(this.shadow);
//   tilemap.group.add(this.light);
// };

// Room.prototype.add = function(crew) {
//   var cache = this.cache.crew;
  
//   cache.count++;
//   cache[crew.uuid] = crew;
  
//   if(cache.count == 0)
//     this._animateLight(1, 0.4);
//   else this._animateLight(0.15, 0.65);
// };

// Room.prototype.remove = function(crew) {
//   var cache = this.cache.crew;
  
//   cache.count--;
//   cache[crew.uuid] = undefined;
  
//   if(cache.count == 0)
//     this._animateLight(1, 0.4);
//   else this._animateLight(0.15, 0.65);
// };

// Room.prototype.intersects = function(sprite) {
//   var rectangle = this.intersect;
//   return !(
//     rectangle.right < sprite.position.x ||
//     rectangle.bottom < sprite.position.y ||
//     rectangle.x > sprite.right ||
//     rectangle.y > sprite.bottom);
// };

// Room.prototype.contains = function(sprite) {
//   var rectangle = this.contain;
//   return (
//     sprite.position.x >= rectangle.x &&
//     sprite.position.y >= rectangle.y &&
//     (sprite.right - sprite.pivot.x) <= rectangle.right &&
//     (sprite.bottom - sprite.pivot.y) <= rectangle.bottom);
// };

// Room.prototype.containsPoint = function(x, y) {
//   return (
//     x >= this.contain.x &&
//     x < this.contain.right &&
//     y >= this.contain.y &&
//     y < this.contain.bottom);
// };

// Room.prototype._animateLight = function(opacity1, opacity2) {
//   // this.tween1 && this.tween1.stop();
//   // this.tween2 && this.tween2.stop();

//   // this.tween1 = this.tilemap.game.add.tween(this.shadow);
//   // this.tween2 = this.tilemap.game.add.tween(this.light);

//   // this.tween1.to({ alpha: opacity1 }, 1000, engine.Easing.Quadratic.InOut);
//   // this.tween2.to({ alpha: opacity2 }, 1000, engine.Easing.Linear.None);
  
//   // this.tween1.start();
//   // this.tween2.start();
// };

// Room.prototype._getGradient = function(bitmapData, color1, color2) {
//   var grd = bitmapData.ctx.createRadialGradient(
//         this.contain.width / 2, this.contain.height / 2, 0,
//         this.contain.width / 2, this.contain.height / 2, Math.max(64, this.contain.width));
  
//   grd.addColorStop(0, color1);
//   grd.addColorStop(1, color2);

//   return grd
// };

Object.defineProperty(Room.prototype, 'inputEnabled', {
  set: function(value) {
    this.selectGraphics.inputEnabled = value;
    this.selectGraphics.input.priorityID = 3;
    this.targetTween && this.targetTween.stop();
  }
});

module.exports = Room;
