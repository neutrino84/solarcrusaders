var Const = require('../const'),
    Easing = require('./Easing'),
    Tween = require('./Tween');

function TweenManager(game) {
  this.game = game;
  this.frameBased = false;

  this._tweens = [];
  this._add = [];

  this.easeMap = {
    'Linear': Easing.Linear.None,
    'Quad': Easing.Quadratic.Out,
    'Quad.easeIn': Easing.Quadratic.In,
    'Quad.easeOut': Easing.Quadratic.Out,
    'Quad.easeInOut': Easing.Quadratic.InOut
  };

  // this.game.onPause.add(this._pauseAll, this);
  // this.game.onResume.add(this._resumeAll, this);
};

TweenManager.prototype = {
  getAll: function() {
    return this._tweens;
  },

  removeAll: function() {
    for(var i = 0; i < this._tweens.length; i++) {
      this._tweens[i].pendingDelete = true;
    }
    this._add = [];
  },
  
  removeFrom: function(obj, children) {
    if(children === undefined) { children = true; }

    var i;
    var len;
    if(Array.isArray(obj)) {
      for(i = 0, len = obj.length; i < len; i++) {
        this.removeFrom(obj[i]);
      }
    } else if(obj.type === Const.GROUP && children) {
      for(var i = 0, len = obj.children.length; i < len; i++) {
        this.removeFrom(obj.children[i]);
      }
    } else {
      for(i = 0, len = this._tweens.length; i < len; i++) {
        if(obj === this._tweens[i].target) {
          this.remove(this._tweens[i]);
        }
      }
      for(i = 0, len = this._add.length; i < len; i++) {
        if(obj === this._add[i].target) {
          this.remove(this._add[i]);
        }
      }
    }
  },

  add: function(tween) {
    tween._manager = this;
    tween.pendingDelete = false;

    if(this._add.indexOf(tween) === -1 &&
        this._tweens.indexOf(tween) === -1) {
      this._add.push(tween);
    }
  },

  create: function(object) {
    return new Tween(object, this.game, this);
  },

  remove: function(tween) {
    var i = this._tweens.indexOf(tween);
    if(i !== -1) {
      this._tweens[i].pendingDelete = true;
    } else {
      i = this._add.indexOf(tween);
      if(i !== -1) {
        this._add[i].pendingDelete = true;
      }
    }
  },

  update: function() {
    var addTweens = this._add.length;
    var numTweens = this._tweens.length;
    if(numTweens === 0 && addTweens === 0) {
      return false;
    }

    var i = 0;
    while (i < numTweens) {
      if(this._tweens[i].update(this.game.clock.time)) {
        i++;
      } else {
        this._tweens.splice(i, 1);
        numTweens--;
      }
    }

    // If there are any new tweens to be added, do so now - otherwise they can be spliced out of the array before ever running
    if(addTweens > 0) {
      this._tweens = this._tweens.concat(this._add);
      this._add.length = 0;
    }

    return true;
  },

  isTweening: function(object) {
    return this._tweens.some(function(tween) {
      return tween.target === object;
    });
  },

  _pauseAll: function() {
    for(var i = this._tweens.length - 1; i >= 0; i--) {
      this._tweens[i]._pause();
    }
  },

  _resumeAll: function() {
    for(var i = this._tweens.length - 1; i >= 0; i--) {
      this._tweens[i]._resume();
    }
  },

  pauseAll: function() {
    for(var i = this._tweens.length - 1; i >= 0; i--) {
      this._tweens[i].pause();
    }
  },

  resumeAll: function() {
    for(var i = this._tweens.length - 1; i >= 0; i--) {
      this._tweens[i].resume(true);
    }
  }
};

TweenManager.prototype.constructor = TweenManager;

module.exports = TweenManager;
