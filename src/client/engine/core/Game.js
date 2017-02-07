var pixi = require('pixi'),
    EventEmitter = require('eventemitter3'),
    Device = require('../system/Device'),
    Canvas = require('../system/Canvas'),
    ReqAnimFrame = require('../system/RequestAnimationFrame'),
    Clock = require('../time/Clock'),
    Loader = require('../load/Loader'),
    Cache = require('../load/Cache'),
    Input = require('../controls/Input'),
    Stage = require('./Stage'),
    World = require('./World'),
    RandomGenerator = require('../utils/RandomGenerator'),
    StateManager = require('./StateManager'),
    State = require('./State'),
    ScaleManager = require('./ScaleManager'),
    TweenManager = require('../tween/TweenManager'),
    ParticleManager = require('../particles/ParticleManager'),
    SoundManager = require('../sound/SoundManager'),
    NetManager = require('../net/NetManager');

function Game(config) {
  if(!config) { config = {}; }

  this.config = config;

  this.width = config['width'] || 800;
  this.height = config['height'] || 600;
  this.enableDebug = config['enableDebug'] || true;
  this.parent = config['parent'] || '';
  this.canvasID = config['canvasID'] || null;

  this.transparent = config['transparent'] || false;
  this.autoResize = config['autoResize'] || false;
  this.antialias = config['antialias'] || false;
  this.forceFXAA = config['forceFXAA'] || false;
  this.resolution = config['resolution'] || 1;

  this.clearBeforeRender = config['clearBeforeRender'] || false;
  this.preserveDrawingBuffer = config['preserveDrawingBuffer'] || false;

  this.isBooted = false;
  this.currentUpdateID = 0;

  this._paused = false;
  this._codePaused = false;

  this.rnd = new RandomGenerator([(global.Date.now() * global.Math.random()).toString()]);
  this.states = new StateManager(this);

  Device.whenReady(this.boot, this);

  EventEmitter.call(this);
};

Game.prototype = Object.create(EventEmitter.prototype);
Game.prototype.constructor = Game;

Game.prototype.boot = function() {
  if(this.isBooted) { return; }

  this.isBooted = true;

  this.scale = new ScaleManager(this, this.width, this.height);
  this.stage = new Stage(this);

  this.setupRenderer();

  this.world = new World(this);
  this.cache = new Cache(this);
  this.load = new Loader(this);
  this.clock = new Clock(this);
  this.tweens = new TweenManager(this);
  this.input = new Input(this);
  this.sound = new SoundManager(this);
  this.particles = new ParticleManager(this);
  this.net = new NetManager(this);

  this.clock.boot();
  this.stage.boot();
  this.world.boot();
  this.scale.boot();
  this.input.boot();
  this.sound.boot();
  this.states.boot();
  this.net.boot();

  this.raf = new ReqAnimFrame(this, false);

  this._kickstart = true;

  this.raf.start();
};

Game.prototype.setupRenderer = function() {
  this.canvas = Canvas.create(this.width, this.height, this.canvasID);

  if(Device.webGL === true) {
    this.renderer = new pixi.WebGLRenderer(this.width, this.height, {
      'view': this.canvas,
      'transparent': this.transparent,
      'autoResize': this.autoResize,
      'resolution': this.resolution,
      'antialias': this.antialias,
      'clearBeforeRender': this.clearBeforeRender,
      'preserveDrawingBuffer': this.preserveDrawingBuffer
    });
  } else {
    // WebGL must be supported
    throw new Error('WebGL support required');
  }

  // update canvas
  Canvas.addToDOM(this.canvas, this.parent, false);
  Canvas.setUserSelect(this.canvas, 'none');
  Canvas.setTouchAction(this.canvas, 'none');
  Canvas.setContextMenu(this.canvas, false);
  Canvas.setSmoothingEnabled(this.canvas, false);
};

Game.prototype.update = function(time) {
  this.clock.update(time);

  this.updateLogic();
  this.updateRender();
};

Game.prototype.updateLogic = function() {
  if(!this._paused) {
    // preUpdate
    this.scale.preUpdate();
    this.states.preUpdate();

    // update
    this.states.update();
    this.stage.update();
    this.tweens.update();
    this.input.update();
    this.sound.update();
    this.particles.update();
  } else {
    // pauseUpdate
    this.scale.pauseUpdate();
    this.states.pauseUpdate();
  }
};

Game.prototype.updateRender = function() {
  // update transform
  this.stage.updateTransform();

  // pre-render
  this.states.preRender();

  // render scene graph
  this.renderer.render(this.stage, null, false, null, true);
};

Game.prototype.destroy = function() {
  this.raf.stop();

  this.states.destroy();
  this.scale.destroy();
  this.stage.destroy();
  this.input.destroy();
  this.sound.destroy();
  
  this.state = null;
  this.cache = null;
  this.input = null;
  this.load = null;
  this.sound = null;
  this.stage = null;
  this.clock = null;
  this.world = null;
  this.isBooted = false;

  this.renderer.destroy(false);
};

Game.prototype.gamePaused = function(event) {
  if(!this._paused) {
    this._paused = true;
    this.clock.gamePaused();
    this.sound.setMute();
    this.emit('game/pause', event);
  }
};

Game.prototype.gameResumed = function(event) {
  if(this._paused && !this._codePaused) {
    this._paused = false;
    this.clock.gameResumed();
    this.input.reset();
    this.sound.unsetMute();
    this.emit('game/resume', event);
  }
};

Game.prototype.focusLoss = function(event) {
  this.emit('game/blur', event);
  if(!this.stage.disableVisibilityChange) {
    this.gamePaused(event);
  }
};

Game.prototype.focusGain = function(event) {
  this.emit('game/focus', event);
  if(!this.stage.disableVisibilityChange) {
    this.gameResumed(event);
  }
};

Object.defineProperty(Game.prototype, 'state', {
  get: function() {
    return this.states.states[this._current];
  }
});

Object.defineProperty(Game.prototype, 'paused', {
  get: function() {
    return this._paused;
  },

  set: function(value) {
    if(value === true) {
      if(this._paused === false) {
        this._paused = true;
        this.sound.setMute();
        this.clock.gamePaused();
        this.emit('pause', event);
      }
      this._codePaused = true;
    } else {
      if(this._paused) {
        this._paused = false;
        this.input.reset();
        this.sound.unsetMute();
        this.clock.gameResumed();
        this.emit('resume', event);
      }
      this._codePaused = false;
    }
  }
});

module.exports = Game;
