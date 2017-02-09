var pixi = require('pixi'),
    CONST = require('../const'),
    ArraySet = require('../utils/ArraySet');

function Group(game, parent) {
  if(typeof parent === undefined) { parent = game.world; }

  pixi.Container.call(this);
  
  this.game = game;
  this.type = CONST.GROUP;

  if(parent) {
    parent.addChild(this);
  }
};

Group.RETURN_NONE = 0;
Group.RETURN_TOTAL = 1;
Group.RETURN_CHILD = 2;
Group.SORT_ASCENDING = -1;
Group.SORT_DESCENDING = 1;

Group.prototype = Object.create(pixi.Container.prototype);
Group.prototype.constructor = Group;

Group.prototype.add = function(child) {
  if(child.parent !== this) {
    this.addChild(child);
  }
  return child;
};

Group.prototype.addAt = function(child, index) {
  if(child.parent !== this) {
    this.addChildAt(child, index);
  }
  return child;
};

Group.prototype.getFirstVisible = function(value) {
  if(typeof value !== 'boolean') {
    value = true;
  }
  return this.iterate('visible', value, Group.RETURN_CHILD);
};

Group.prototype.iterate = function(key, value, returnType, callback, callbackContext, args) {
  if(returnType === Group.RETURN_TOTAL && this.children.length === 0) { return 0; }

  var total = 0;
  for(var i = 0; i < this.children.length; i++) {
    if(this.children[i][key] === value) {
      total++;

      if(callback) {
        if(args) {
          args[0] = this.children[i];
          callback.apply(callbackContext, args);
        } else {
          callback.call(callbackContext, this.children[i]);
        }
      }

      if(returnType === Group.RETURN_CHILD) {
        return this.children[i];
      }
    }
  }

  if(returnType === Group.RETURN_TOTAL) {
    return total;
  }

  // RETURN_CHILD or RETURN_NONE
  return null;
};

Group.prototype.filter = function(predicate, checkVisible) {
  var child, index = -1,
      length = this.children.length,
      results = [];
  while(++index<length) {
    child = this.children[index];

    if(!checkVisible || (checkVisible && child.visible)) {
      if(predicate(child, index, this.children)) {
        results.push(child);
      }
    }
  }
  return new ArraySet(results);
};

Group.prototype.forEach = function(callback, callbackContext, checkVisible) {
  if(checkVisible === undefined) { checkVisible = false; }
  if(arguments.length <= 3) {
    for(var i=0; i<this.children.length; i++) {
      if(!checkVisible || (checkVisible && this.children[i].visible)) {
        callback.call(callbackContext, this.children[i]);
      }
    }
  } else {
    // assigning to arguments properties causes Extreme Deoptimization in Chrome, FF, and IE.
    // using an array and pushing each element (not a slice!) is _significantly_ faster.
    var args = [null];
    for(var i=3; i<arguments.length; i++) {
      args.push(arguments[i]);
    }
    for(var i=0; i<this.children.length; i++) {
      if(!checkVisible || (checkVisible && this.children[i].visible)) {
        args[0] = this.children[i];
        callback.apply(callbackContext, args);
      }
    }
  }
};

Group.prototype.swap = function(child1, child2) {
  this.swapChildren(child1, child2);
};

Group.prototype.remove = function(child, destroy) {
  var destroy = destroy || false
      removed = this.removeChild(child);
  if(destroy && removed) {
    removed.destroy(destroy);
  }
  return true;
};

Group.prototype.removeAll = function(destroy) {
  var removed,
      destroy = destroy || false,
      children = this.children;
  do {
    this.remove(children[0], destroy);
  } while(children.length > 0);
};

Group.prototype.update = function() {
  var i = this.children.length;
  while (i--) {
    this.children[i].update();
  }
};

Group.prototype.destroy = function() {
  if(this.game === null) { return; }

  this.removeAll();

  if(this.parent) {
    this.parent.removeChild(this);
  }

  this.game = null;
};

module.exports = Group;
