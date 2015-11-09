var Class = require('../../utils/Class'),
    Point = require('../../geometry/Point'),
    Rectangle = require('../../geometry/Rectangle'),
    AnimationManager = require('../../animation/AnimationManager'),
    Mixin = require('./Mixin'),
    Animation = require('./Animation'),
    LoadTexture = require('./LoadTexture'),
    AutoCull = require('./AutoCull'),
    InWorld = require('./InWorld'),
    Bounds = require('./Bounds'),
    InputEnabled = require('./InputEnabled'),
    FixedToCamera = require('./FixedToCamera'),
    Destroy = require('./Destroy'),
    Overlap = require('./Overlap');

function Core() {};

Core.modules = {
  Mixin: Mixin,
  Animation: Animation,
  LoadTexture: LoadTexture,
  AutoCull: AutoCull,
  InWorld: InWorld,
  Bounds: Bounds,
  InputEnabled: InputEnabled,
  FixedToCamera: FixedToCamera,
  Destroy: Destroy,
  Overlap: Overlap
};

Core.install = function(components) {
  Class.mixinPrototype(this, Core.prototype);

  this.components = {};

  var id, replace;
  for(var i=0; i<components.length; i++) {
    id = components[i];
    replace = id === 'Destroy' ? true : false;

    Class.mixinPrototype(this, Core.modules[id].prototype, replace);

    this.components[id] = true;
  }
};

Core.init = function(game, key, frame) {
  this.game = game;
  this.key = key;

  // this.world = new Point(x, y);
  // this.previousPosition = new Point(x, y);
  
  // this.events = new Events(this);

  if(this.components.Animation) {
    this.animations = new AnimationManager(this);
  }

  if(this.components.LoadTexture && key !== null) {
    this.loadTexture(key, frame);
  }

  if(this.components.FixedToCamera) {
    this.cameraOffset = new Point(this.x, this.y);
  }
};

Core.preUpdate = function() {
  if(this.pendingDestroy) {
    this.destroy();
    return;
  }

  // this.previousPosition.set(this.world.x, this.world.y);
  // this.previousRotation = this.rotation;

  if(!this.exists || !this.parent.exists) {
    this.renderOrderID = -1;
    return false;
  }

  // this.world.setTo(this.game.camera.x + this.worldTransform.tx, this.game.camera.y + this.worldTransform.ty);

  if(this.visible) {
    this.renderOrderID = this.game.stage.currentRenderOrderID++;
  }

  if(this.animations) {
    this.animations.update();
  }

  // Sprite children ought to be raw pixi.Sprite
  // for(var i = 0; i < this.children.length; i++) {
  //   this.children[i].preUpdate();
  // }

  return true;
};

Core.prototype = {
  game: null,
  name: '',

  components: {},

  z: 0,

  events: undefined,
  animations: undefined,

  key: '',
  world: null,
  debug: false,
  renderOrderID: 0,
  fresh: true,
  pendingDestroy: false,

  previousPosition: null,
  previousRotation: 0,

  _exists: true,

  exists: {
    get: function() {
      return this._exists;
    },

    set: function(value) {
      if(value) {
        this._exists = true;
        this.visible = true;
      } else {
        this._exists = false;
        this.visible = false;
      }
    }
  },

  update: function() {},

  postUpdate: function() {
    if(this.components.FixedToCamera) {
      FixedToCamera.postUpdate.call(this);
    }

    // Sprite children ought to be raw pixi.Sprite
    // for(var i=0; i<this.children.length; i++) {
    //   this.children[i].postUpdate();
    // }
  }
};

module.exports = Core;
