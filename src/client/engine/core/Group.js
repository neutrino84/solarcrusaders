var pixi = require('pixi'),
    CONST = require('../const'),
    ArraySet = require('../utils/ArraySet');

function Group(game, parent) {
  if(typeof parent === undefined) { parent = game.world; }

  pixi.Container.call(this);
  
  this.game = game;
  
  this.z = 0;
  this.type = CONST.GROUP;
  this.cursor = null;
  this.pendingDestroy = false;
  this.exists = true;

  if(parent) {
    this.z = parent.children.length;
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

Group.prototype.add =
  function(child, silent) {
    if(silent === undefined) { silent = false; }

    if(child.parent !== this) {
      this.addChild(child);
      child.z = this.children.length;

      if(!silent && child.onAddedToGroup) {
        child.onAddedToGroup(this);
      }

      if(this.cursor === null) {
        this.cursor = child;
      }
    }

    return child;
  };

Group.prototype.getFirstExists =
  function(exists) {
    if(typeof exists !== 'boolean') {
      exists = true;
    }
    return this.iterate('exists', exists, Group.RETURN_CHILD);
  };

Group.prototype.iterate =
  function(key, value, returnType, callback, callbackContext, args) {
    if(returnType === Group.RETURN_TOTAL && this.children.length === 0) {
      return 0;
    }

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

Group.prototype.filter = function(predicate, checkExists) {
  var child, index = -1,
      length = this.children.length,
      results = [];
  while(++index<length) {
    child = this.children[index];

    if(!checkExists || (checkExists && child.exists)) {
      if(predicate(child, index, this.children)) {
        results.push(child);
      }
    }
  }
  return new ArraySet(results);
};

Group.prototype.forEach = function(callback, callbackContext, checkExists) {
  if(checkExists === undefined) { checkExists = false; }
  if(arguments.length <= 3) {
    for(var i=0; i<this.children.length; i++) {
      if(!checkExists || (checkExists && this.children[i].exists)) {
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
      if(!checkExists || (checkExists && this.children[i].exists)) {
        args[0] = this.children[i];
        callback.apply(callbackContext, args);
      }
    }
  }
};

Group.prototype.remove = function (child, destroy, silent) {
  if(destroy === undefined) { destroy = false; }
  if(silent === undefined) { silent = false; }

  if(this.children.length === 0 || this.children.indexOf(child) === -1) {
    return false;
  }

  // if(!silent && child.events && !child.destroyPhase) {
  //   child.events.onRemovedFromGroup$dispatch(child, this);
  // }

  var removed = this.removeChild(child);
  // this.removeFromHash(child);

  // this.updateZ();

  // if(this.cursor === child) {
  //   this.next();
  // }

  if(destroy && removed) {
    removed.destroy(true);
  }

  return true;
};

Group.prototype.removeAll = function(destroy, silent) {
  if(destroy === undefined) { destroy = false; }
  if(silent === undefined) { silent = false; }

  if(this.children.length === 0) {
    return;
  }

  var removed;
  do {
    if(!silent && this.children[0] && this.children[0].onRemovedFromGroup) {
      this.children[0].onRemovedFromGroup(this);
    }

    removed = this.removeChild(this.children[0]);
    // this.removeFromHash(removed);

    if(destroy && removed) {
      removed.destroy(true);
    }
  } while(this.children.length > 0);

  this.cursor = null;
};

Group.prototype.preUpdate =
  function() {
    if(this.pendingDestroy) {
      this.destroy();
      return false;
    }

    if(!this.exists || !this.parent.exists) {
      this.renderOrderID = -1;
      return false;
    }

    var i = this.children.length;
    while (i--) {
      this.children[i].preUpdate();
    }

    return true;
  };

Group.prototype.update =
  function() {
    var i = this.children.length;
    while (i--) {
      this.children[i].update();
    }
  };

Group.prototype.postUpdate =
  function() {
    var i = this.children.length;
    while (i--) {
      this.children[i].postUpdate();
    }
  };

Group.prototype.destroy =
  function(destroyChildren, soft) {
    if(this.game === null || this.ignoreDestroy) { return; }
    if(destroyChildren === undefined) { destroyChildren = true; }
    if(soft === undefined) { soft = false; }

    this.onDestroy && this.onDestroy(destroyChildren, soft);
    
    this.removeAll(destroyChildren);

    this.cursor = null;
    this.filters = null;
    this.pendingDestroy = false;

    if(!soft) {
      if(this.parent) {
        this.parent.removeChild(this);
      }
      this.game = null;
      this.exists = false;
      pixi.Container.prototype.destroy(this);
    }  
};

module.exports = Group;
