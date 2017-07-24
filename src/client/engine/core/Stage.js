var pixi = require('pixi');

function Stage(game) {
  pixi.Container.call(this);

  this.game = game;
  this.disableVisibilityChange = false;
  this.currentRenderOrderID = 0;

  this.parent = new pixi.Container();

  this._onChange = null;
  this._hiddenVar = null;
};

Stage.prototype = Object.create(pixi.Container.prototype);
Stage.prototype.constructor = Stage;

Stage.prototype.boot = function() {
  this.checkVisibility();
};

Stage.prototype.update = function() {
  this.currentRenderOrderID = 0;
  var i = this.children.length;
  while(i--) {
    this.children[i].update();
  }
  this.game.world.camera.update();
};

Stage.prototype.checkVisibility = function() {
  if(global.document.webkitHidden !== undefined) {
    this._hiddenVar = 'webkitvisibilitychange';
  } else if(global.document.mozHidden !== undefined) {
    this._hiddenVar = 'mozvisibilitychange';
  } else if(global.document.msHidden !== undefined) {
    this._hiddenVar = 'msvisibilitychange';
  } else if(global.document.hidden !== undefined) {
    this._hiddenVar = 'visibilitychange';
  } else {
    this._hiddenVar = null;
  }

  var self = this;
      this._onChange = function(event) {
        return self.visibilityChange(event);
      };

  if(this._hiddenVar) {
    global.document.addEventListener(this._hiddenVar, this._onChange, false);
  }

  global.onblur = this._onChange;
  global.onfocus = this._onChange;
  global.onpagehide = this._onChange;
  global.onpageshow = this._onChange;
};

Stage.prototype.visibilityChange = function(event) {
  if(event.type === 'pagehide' || event.type === 'blur' ||
      event.type === 'pageshow' || event.type === 'focus') {
    if(event.type === 'pagehide' || event.type === 'blur') {
      this.game.focusLoss(event);
    } else if(event.type === 'pageshow' || event.type === 'focus') {
      this.game.focusGain(event);
    }
    return;
  }

  if(this.disableVisibilityChange) { return; }
  if(document.hidden || document.mozHidden || document.msHidden ||
      document.webkitHidden || event.type === 'pause') {
    this.game.gamePaused(event);
  } else {
    this.game.gameResumed(event);
  }
};

module.exports = Stage;
