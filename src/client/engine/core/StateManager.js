
var EventEmitter = require('eventemitter3');

function StateManager(game, state) {
  this.game = game;

  this.states = {};
  this.backgroundStates = {};
  this._current = '';

  this._pendingBackgroundStates = [];
  this._pendingState = state || null;
  this._clearWorld = false;
  this._clearCache = false;
  this._created = false;

  this._args = [];

  this.callbackContext = null;
  this.backgroundStateContext = null;

  EventEmitter.call(this);
};

StateManager.prototype = Object.create(EventEmitter.prototype);
StateManager.prototype.constructor = StateManager;

StateManager.prototype.boot = function() {
  //
  // todo: link pause/resume
  //

  if(this._pendingState !== null && typeof this._pendingState !== 'string') {
    this.add('default', this._pendingState, true);
  }
};

StateManager.prototype.add = function(key, state, autoStart, background) {
  autoStart = autoStart || false;
  background = background || false;

  if(background === false) {
    this.states[key] = state;
  } else {
    this.backgroundStates[key] = state;
  }

  if(autoStart) {
    if(background) {
      this._pendingBackgroundStates.push(key);
    } else if(this.game.isBooted) {
      this.start(key);
    } else { 
      this._pendingState = key;
    }
  }

  return state;
};

StateManager.prototype.remove = function(key) {
  if(this._current === key) {
    this.callbackContext = null;
  }
  delete this.states[key];
};

StateManager.prototype.checkState = function(key) {
  if(!this.states[key]) {
    console.warn('StateManager - No state found with the key: ' + key);
    return false;
  }
  return true;
};

StateManager.prototype.start = function(key, clearWorld, clearCache) {
  if(clearWorld === undefined) { clearWorld = true; }
  if(clearCache === undefined) { clearCache = false; }

  if(this.checkState(key)) {
    this._pendingState = key;
    this._clearWorld = clearWorld;
    this._clearCache = clearCache;

    if(arguments.length > 3) {
      this._args = Array.prototype.splice.call(arguments, 3);
    }
  }
};

StateManager.prototype.restart = function(clearWorld, clearCache) {
  if(clearWorld === undefined) { clearWorld = true; }
  if(clearCache === undefined) { clearCache = false; }

  this._pendingState = this._current;
  this._clearWorld = clearWorld;
  this._clearCache = clearCache;

  if(arguments.length > 2) {
    this._args = Array.prototype.slice.call(arguments, 2);
  }
};

StateManager.prototype.clearCurrentState = function() {
  if(this._current) {
    if(this.callbackContext.shutdown) {
      this.callbackContext.shutdown();
    }

    this.game.tweens.removeAll();
    this.game.camera.reset();
    this.game.input.reset(true);
    this.game.clock.removeAll();
    this.game.scale.reset(this._clearWorld);

    if(this.game.debug) {
      this.game.debug.reset();
    }

    if(this._clearWorld) {
      this.game.world.shutdown();

      if(this._clearCache === true) {
        this.game.cache.destroy();
      }
    }
  }
};

StateManager.prototype.clearBackgroundStates = function() {
  var backgroundStates = this.backgroundStates;
  for(var b in backgroundStates) {
    backgroundStates[b].shutdown();
  }
};

StateManager.prototype.setCurrentBackgroundState = function(key) {
  this.backgroundStateContext = this.backgroundStates[key];
  this.backgroundStateContext.game = this.game;
  this.backgroundStateContext.init();

  this.game._kickstart = true;
};

StateManager.prototype.setCurrentState = function(key) {
  // set key
  this._current = key;
  this._created = false;
  
  // set context
  this.callbackContext = this.states[key];

  // inject game instance
  this.states[key].game = this.game;

  // current and pendingState should equal each other
  if(this.callbackContext.init) {
    this.callbackContext.init(this._args);
  }

  // if not, was changed in init
  if(key === this._pendingState) {
    this._args = [];
  }

  this.game._kickstart = true;
};

StateManager.prototype.getBackgroundState = function(key) {
  return this.backgroundStates[key];
};

StateManager.prototype.preUpdate = function() {
  // block when loading a background state
  if(this.backgroundStateContext) { return; }

  if(this._pendingBackgroundStates.length > 0) {
    this.setCurrentBackgroundState(this._pendingBackgroundStates.pop());

    if(this.backgroundStateContext.preload) {
      this.backgroundStateContext.preload();

      if(this.game.load.totalQueuedFiles() === 0 && this.game.load.totalQueuedPacks() === 0) {
        this.backgroundLoadComplete();
      } else {
        this.game.load.start();
      }
    } else {
      this.backgroundLoadComplete();
    }
  } else if(this._pendingState && this.game.isBooted) {
    var previousStateKey = this._current;

    // get rid of old
    // state if we have one
    this.clearCurrentState();
    this.setCurrentState(this._pendingState);

    this.emit('stateChange', this._current, previousStateKey);

    if(this._current !== this._pendingState) {
      return;
    } else {
      this._pendingState = null;
    }
    
    if(this.callbackContext.preload) {
      this.game.load.reset(true);
      this.callbackContext.preload();

      if(this.game.load.totalQueuedFiles() === 0 && this.game.load.totalQueuedPacks() === 0) {
        this.loadComplete();
      } else {
        this.game.load.start();
      }
    } else {
      this.loadComplete();
    }
  }
};

StateManager.prototype.loadComplete = function() {
  if(this._created === false) {
    this._created = true;

    if(this.callbackContext.create) {
      this.callbackContext.create();
    }
  }
};

StateManager.prototype.backgroundLoadComplete = function() {
  this.backgroundStateContext.create();
  this.backgroundStateContext = null;
};

StateManager.prototype.pause = function() {
  if(this._created && this.callbackContext.paused) {
    this.callbackContext.paused();
  }
};

StateManager.prototype.resume = function() {
  if(this._created && this.callbackContext.resumed) {
    this.callbackContext.resumed();
  }
};

StateManager.prototype.update = function() {
  if(this.backgroundStateContext) {
    if(this.backgroundStateContext.loadUpdate && !this.game.load.hasLoaded) {
      this.backgroundStateContext.loadUpdate();
    } else if(this.game.load.hasLoaded)  {
      this.backgroundLoadComplete();
    }
  }

  if(this._created) {
    if(this.callbackContext.update) {
      this.callbackContext.update();
    }
  } else if(this.callbackContext) {
    if(this.callbackContext.loadUpdate && !this.game.load.hasLoaded) {
      this.callbackContext.loadUpdate();
    } else if(this.game.load.hasLoaded)  {
      this.loadComplete();
    }
  }
};

StateManager.prototype.pauseUpdate = function() {
  if(this._created) {
    if(this.callbackContext.pauseUpdate) {
      this.callbackContext.pauseUpdate();
    }
  } else {
    if(this.callbackContext.loadUpdate) {
      this.callbackContext.loadUpdate();
    }
  }
};

StateManager.prototype.preRender = function(elapsedTime) {
  if(this._created && this.callbackContext.preRender) {
    this.callbackContext.preRender(elapsedTime);
  }
};

StateManager.prototype.resize = function(width, height) {
  // resize current state
  if(this._created && this.callbackContext.resize) {
    this.callbackContext.resize(width, height);
  }

  // resize background states
  for(var b in this.backgroundStates) {
    this.backgroundStates[b].resize(width, height);
  }
};

StateManager.prototype.render = function() {
  if(this._created) {
    if(this.callbackContext.render) {
      this.callbackContext.render();
    }
  } else {
    if(this.callbackContext.loadRender) {
      this.callbackContext.loadRender();
    }
  }
};

StateManager.prototype.destroy = function() {
  this.clearCurrentState();
  this.clearBackgroundStates();

  this.callbackContext = null;

  this.game = null;
  this.states = {};
  this.backgroundStates = {};

  this._current = '';
  this._pendingState = null;
}

Object.defineProperty(StateManager.prototype, 'current', {
  get: function() {
    return this.states[this._current];
  }
});

Object.defineProperty(StateManager.prototype, 'hasPendingState', {
  get: function() {
    return this._pendingState !== null || this._pendingBackgroundStates.length > 0;
  }
});

Object.defineProperty(StateManager.prototype, 'pendingLength', {
  get: function() {
    return this._pendingBackgroundStates.length + (this._pendingState !== null ? 1 : 0);
  }
});

module.exports = StateManager;
