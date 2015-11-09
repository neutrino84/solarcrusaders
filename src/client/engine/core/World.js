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
  this._width = game.width;
  this._height = game.height;

  // this.game.state.onStateChange.add(this.stateChange, this);
};

World.prototype = Object.create(Group.prototype);
World.prototype.constructor = World;

World.prototype.boot = function() {
  this.background = new Group(this.game, null);
  this.foreground = new Group(this.game, null);
  
  this.camera = new Camera(this.game, 0, 0, this.game.width, this.game.height);
  this.camera.displayObject = this;

  this.game.camera = this.camera;
  
  this.game.stage.addChild(this.background);
  this.game.stage.addChild(this.foreground);
  this.game.stage.addChild(this);
};

World.prototype.setBounds = function(x, y, width, height) {
  this._definedSize = true;

  this._width = width;
  this._height = height;

  this.bounds.setTo(x, y, width, height);

  // this.pivot.x = -x;
  // this.pivot.y = -y;

  if(this.camera.bounds) {
    this.camera.bounds.setTo(x, y,
      global.Math.max(width, this.game.width),
      global.Math.max(height, this.game.height));
  }
};

World.prototype.postUpdate = function() {
  var background = this.background,
      foreground = this.foreground,
      view = this.camera.view;

  background.x = this.x;
  background.y = this.y;
  background.pivot.x = (this.pivot.x + 128 - 2048) / 6;
  background.pivot.y = (this.pivot.y + 128 - 2048) / 6;
  background.scale.x = this.scale.x / 1.5 + (1/3);
  background.scale.y = this.scale.y / 1.5 + (1/3);

  Group.prototype.postUpdate.call(this);
}

// World.prototype.update = function() {
//   // var background = this.background,
//   //     foreground = this.foreground,
//   //     view = this.camera.view;

//   // background.scale.x = this.scale.x / 2 + 0.5;
//   // background.scale.y = this.scale.y / 2 + 0.5;
//   // background.pivot.x = this.pivot.x;
//   // background.pivot.y = this.pivot.y;

//   // foreground.scale.x = this.scale.x / 2 + 0.5;
//   // foreground.scale.y = this.scale.y / 2 + 0.5;
//   // foreground.pivot.x = -view.x / 4 + (this._width / 2.6);
//   // foreground.pivot.y = -view.y / 4 + (this._height / 2.6);

//   Group.prototype.update.call(this);
// };

World.prototype.resize = function(width, height) {
  if(this._definedSize) {
    if(width < this._width) {
      width = this._width;
    }
    if(height < this._height) {
      height = this._height;
    }
  }

  // offset = new Point(global.Math.round(game.width / 2), global.Math.round(game.height / 2));

  // this.bounds.width = width;
  // this.bounds.height = height;

  // this.position.copy(offset);
  // this.background.position.copy(offset);
  // this.foreground.position.copy(offset);
};

World.prototype.stateChange = function() {
  this.x = 0;
  this.y = 0;
  this.camera.reset();
};

World.prototype.shutdown = function() {
  this.destroy(true, true);
};

module.exports = World;
