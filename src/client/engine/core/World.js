var Rectangle = require('../geometry/Rectangle'),
    Group = require('./Group'),
    Camera = require('./Camera'),
    Point = require('../geometry/Point');

function World(game) {
  Group.call(this, game, null);

  this.game = game;
  this.camera = null;
  
  this.bounds = new Rectangle(0, 0, game.width, game.height);

  this._definedSize = false;

  this.game.on('state/change', this.stateChange, this);
};

World.prototype = Object.create(Group.prototype);
World.prototype.constructor = World;

World.prototype.boot = function() {
  this.static = new Group(this.game, this.game.stage);
  this.background = new Group(this.game, this.game.stage);
  this.foreground = new Group(this.game, this.game.stage);
  this.front = new Group(this.game, this.game.stage);
  this.ui = new Group(this.game, this.game.stage);
  
  // create camera
  this.camera = new Camera(this.game, 0, 0, this.game.width, this.game.height);
  this.game.camera = this.camera;

  // add world to stage
  this.game.stage.addChild(this);
};

World.prototype.setBounds = function(x, y, width, height) {
  this._definedSize = true;

  this._width = width;
  this._height = height;

  this.bounds.setTo(x, y, width, height);

  if(this.camera.bounds) {
    this.camera.bounds.setTo(x, y,
      global.Math.max(width, this.game.width),
      global.Math.max(height, this.game.height));
  }
};

World.prototype.update = function() {
  var background = this.background,
      foreground = this.foreground,
      view = this.camera.view;

  background.x = this.x;
  background.y = this.y;
  background.pivot.x = this.pivot.x / 6;
  background.pivot.y = this.pivot.y / 6;
  background.scale.x = this.scale.x / 3 + 0.5;
  background.scale.y = this.scale.y / 3 + 0.5;

  foreground.x = this.x;
  foreground.y = this.y;
  foreground.pivot.x = this.pivot.x / 4;
  foreground.pivot.y = this.pivot.y / 4;
  foreground.scale.x = this.scale.x / 2 + 0.5;
  foreground.scale.y = this.scale.y / 2 + 0.5;

  Group.prototype.update.call(this);
};

World.prototype.resize = function(width, height) {};

World.prototype.stateChange = function() {
  this.camera.reset();
};

World.prototype.shutdown = function() {
  //..
};

module.exports = World;
