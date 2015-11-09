var pixi = require('pixi');

function Stage(game) {
  pixi.Container.call(this);

  this.game = game;
  this.exists = true;
  this.currentRenderOrderID = 0;
};

Stage.prototype = Object.create(pixi.Container.prototype);
Stage.prototype.constructor = Stage;

Stage.prototype.boot =
  function() {
    this.checkVisibility();
  };

Stage.prototype.preUpdate =
  function() {
    this.currentRenderOrderID = 0;

    for(var i = 0; i < this.children.length; i++) {
      this.children[i].preUpdate();
    }
  };

Stage.prototype.update =
  function() {
    var i = this.children.length;
    while(i--) {
      this.children[i].update();
    }
  };

Stage.prototype.postUpdate =
  function() {
    if(this.game.world.camera.target) {
      this.game.world.camera.target.postUpdate();
      this.game.world.camera.update();

      var i = this.children.length;
      while(i--) {
        if(this.children[i] !== this.game.world.camera.target) {
          this.children[i].postUpdate();
        }
      }
    } else {
      this.game.world.camera.update();

      var i = this.children.length;
      while(i--) {
        this.children[i].postUpdate();
      }
    }
  };

Stage.prototype.checkVisibility =
  function() {
    //.. check if the game is visible or
    //.. if it has lost focus
  };

Stage.prototype.destroy =
  function() {
    pixi.Container.prototype.destroy.call(this);
  }

module.exports = Stage;
