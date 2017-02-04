var Class = require('../../utils/Class'),
    AnimationManager = require('../../animation/AnimationManager'),
    Mixin = require('./Mixin'),
    Animation = require('./Animation'),
    LoadTexture = require('./LoadTexture'),
    InputEnabled = require('./InputEnabled'),
    Destroy = require('./Destroy');

function Core() {};

Core.modules = {
  Mixin: Mixin,
  Animation: Animation,
  LoadTexture: LoadTexture,
  InputEnabled: InputEnabled,
  Destroy: Destroy
};

Core.install = function(components) {
  Class.mixinPrototype(this, Core.prototype);

  this.components = {};

  var id;
  for(var i=0; i<components.length; i++) {
    id = components[i];

    Class.mixinPrototype(this, Core.modules[id].prototype, true);

    this.components[id] = true;
  }
};

Core.init = function(game, key, frame, animations) {
  this.game = game;
  this.key = key || null;

  // activate animations
  if(this.components.Animation && animations) {
    this.animations = new AnimationManager(this);
  }

  // load texture
  if(this.components.LoadTexture && key != undefined) {
    this.loadTexture(key, frame, animations);
  }
};

Core.update = function() {
  if(this.visible) {
    this.renderOrderID = this.game.stage.currentRenderOrderID++;
  } else {
    this.renderOrderID = -1;
  }
  if(this.animations) {
    this.animations.update();
  }
};

Core.prototype = {
  game: null,
  key: null,
  animations: null,
  components: {},
  renderOrderID: 0,

  update: function() {},
};

Object.defineProperty(Core.prototype, 'exists', {
  get: function() {
    return this.visible;
  },

  set: function(value) {
    this.visible = value;
  }
});

module.exports = Core;
