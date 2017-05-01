
var pixi = require('pixi'),
    engine = require('engine'),
    ShockwaveFilter = require('./filters/ShockwaveFilter');

function Shockwave(manager) {
  engine.Sprite.call(this, manager.game, 'texture-atlas', 'asteroid-x01.png');

  this.manager = manager;
  this.game = manager.game;

  this.elapsed = 0;
  this.length = 0;
  this.duration = 0;
  this.started = 0;

  this.data = null;
  this.isRunning = false;

  // render texture
  this.texture = pixi.RenderTexture.create();//data.width, data.height, pixi.SCALE_MODES.LINEAR, 1.0);

  // matrix
  this.mat = new pixi.Matrix();

  // filter
  this.filter = new ShockwaveFilter(this);
  this.filters = [this.filter];
};

Shockwave.prototype = Object.create(engine.Sprite.prototype);
Shockwave.prototype.constructor = Shockwave;

Shockwave.prototype.start = function(data) {
  this.data = data;
  this.elapsed = 0;
  this.duration = this.data.duration;
  this.started = this.game.clock.time;
  this.isRunning = true;

  // resize texture
  this.texture.resize(data.width, data.height);

  // center
  this.pivot.set(data.width/2, data.height/2);
};

Shockwave.prototype.update = function() {
  var game = this.game,
      data = this.data,
      filter = this.filter,
      position = this.position,
      scale = this.scale,
      time = game.clock.time,
      zoom = game.world.scale.x;

  if(this.isRunning === true) {
    this.elapsed = time - this.started;
    this.percent = this.elapsed / this.duration;
    this.alpha = 1 - this.percent;

    // compute update
    scale.set(zoom, zoom);  
    game.world.front.toLocal({ x: data.object.width/2,  y: data.object.height/2  }, data.object, this.position);

    if(this.elapsed > this.duration) {
      this.isRunning = false;
      this.manager.remove(this);
    }
  }

  engine.Sprite.prototype.update.call(this);
};

Shockwave.prototype.preRender = function() {
  if(this.isRunning === true) {
    this.transform.worldTransform.copy(this.mat);
    this.game.renderer.render(this.game.world.main, this.texture, false, this.mat.invert());
  }
};

module.exports = Shockwave;
