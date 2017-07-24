var Rectangle = require('../geometry/Rectangle'),
    Group = require('./Group'),
    Camera = require('./Camera'),
    Point = require('../geometry/Point');

function World(game) {
  Group.call(this, game, null);
};

World.prototype = Object.create(Group.prototype);
World.prototype.constructor = World;

World.prototype.boot = function() {
  // main game containers
  this.static = new Group(this.game, this.game.stage);
  this.main = new Group(this.game, this.game.stage);
  this.front = new Group(this.game, this.game.stage);
  this.ui = new Group(this.game, this.game.stage);

  // create prallax
  this.background = new Group(this.game);
  this.foreground = new Group(this.game);
  this.main.add(this.background);
  this.main.add(this.foreground);
  
  // create camera
  this.camera = new Camera(this.game, 0, 0, this.game.width, this.game.height);
  this.game.camera = this.camera;

  // add world to stage
  this.game.stage.addChild(this);
};

World.prototype.size = function(x, y, width, height) {
  this._bounds.addFrame(this.transform, x, y, width, height);
};

World.prototype.resize = function(width, height) {
  //..
};

World.prototype.shutdown = function() {
  //..
};

module.exports = World;
