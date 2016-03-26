var Point = require('../geometry/Point'),
    Rectangle = require('../geometry/Rectangle'),
    Device = require('../system/Device'),
    Math = require('../utils/Math'),
    Const = require('../const');

/*
 *   <dt>{@link ScaleManager.NO_SCALE}</dt>
 *       The Game display area will not be scaled - even if it is too large for the canvas/screen.
 *       This mode _ignores_ any applied scaling factor and displays the canvas at the Game size.
 *   <dt>{@link ScaleManager.EXACT_FIT}</dt>
 *       The Game display area will be _stretched_ to fill the entire size of the canvas's parent element and/or screen.
 *       Proportions are not mainted.
 *   <dt>{@link ScaleManager.SHOW_ALL}</dt>
 *       Show the entire game display area while _maintaining_ the original aspect ratio.
 *   <dt>{@link ScaleManager.RESIZE}</dt>
 *       The dimensions of the game display area are changed to match the size of the parent container.
 *       That is, this mode _changes the Game size_ to match the display size.
 *       Any manually set Game size (see {@link #setGameSize}) is ignored while in effect.
 *   <dt>{@link ScaleManager.USER_SCALE}</dt>
 *       The game Display is scaled according to the user-specified scale set by {@link ScaleManager#setUserScale setUserScale}.
 *       This scale can be adjusted in the {@link ScaleManager#setResizeCallback resize callback}
 *       for flexible custom-sizing needs.
 */

function ScaleManager(game, width, height) {
  this.game = game;

  this.dom = { //Dom;
    getScreenOrientation: function() {},
    getOffset: function() {},
    visualBounds: {
      width: global.Math.max(global.innerWidth, global.document.documentElement.clientWidth),
      height: global.Math.max(global.innerHeight, global.document.documentElement.clientHeight)
    }
  };
  
  this.dom['layoutBounds'] = this.dom['visualBounds'];

  this.width = 0;
  this.height = 0;

  this.event = null;
  // this.grid = null;

  this.minWidth = null;
  this.maxWidth = null;
  this.minHeight = null;
  this.maxHeight = null;

  this.sourceAspectRatio = 0;
  this.aspectRatio = 0;

  this.margin = {
    left: 0, top: 0,
    right: 0, bottom: 0,
    x: 0, y: 0
  };

  this.bounds = new Rectangle();
  this.offset = new Point();

  this.forceLandscape = false;
  this.forcePortrait = false;

  this.incorrectOrientation = false;

  this._pageAlignHorizontally = false;
  this._pageAlignVertically = false;

  // this.onOrientationChange = new Phaser.Signal();
  // this.enterIncorrectOrientation = new Phaser.Signal();
  // this.leaveIncorrectOrientation = new Phaser.Signal();

  this.screenOrientation = this.dom.getScreenOrientation();

  this.fullScreenTarget = null;

  this._createdFullScreenTarget = null;

  // this.onFullScreenInit = new Phaser.Signal();
  // this.onFullScreenChange = new Phaser.Signal();
  // this.onFullScreenError = new Phaser.Signal();

  this.scaleFactor = new Point(1, 1);
  this.scaleFactorInversed = new Point(1, 1);

  this.windowConstraints = {
    right: '',
    bottom: ''
  };

  this.compatibility = {
    supportsFullScreen: false,
    orientationFallback: null,
    noMargins: false,
    forceMinimumDocumentHeight: false,
    canExpandParent: true,
    clickTrampoline: ''
  };

  this._scaleMode = ScaleManager.RESIZE;
  this._fullScreenScaleMode = ScaleManager.RESIZE;

  this.trackParentInterval = 2000;
  this.parentIsWindow = false;
  this.parentNode = null;

  this.parentScaleFactor = new Point(1, 1);

  // this.onSizeChange = new Phaser.Signal();

  this.onResize = null;
  this.onResizeContext = null;

  this._pendingScaleMode = null;
  this._fullScreenRestore = null;

  this._gameSize = new Rectangle();

  this._userScaleFactor = new Point(1, 1);
  this._userScaleTrim = new Point(0, 0);

  this._booted = false;

  this._lastUpdate = 0;
  this._updateThrottle = 0;
  this._updateThrottleReset = 100;

  this._resolutionLow = 1024;
  this._resolutionMedium = 1280;
  this._resolutionMaximum = 1920;
  this._resolutionMode = 'auto';

  this._parentBounds = new Rectangle();
  this._tempBounds = new Rectangle();

  this._lastReportedCanvasSize = new Rectangle();
  this._lastReportedGameSize = new Rectangle();

  if(game.config) {
    this.parseConfig(game.config);
  }

  this.setupScale(width, height);

  // auto lower resolution
  this.game.on('fpsProblem', function() {
    this.resolutionMode = 'low';

    this.scaleMode = ScaleManager.EXACT_FIT;
    this.fullScreenScaleMode = ScaleManager.EXACT_FIT;

    this.refresh();
  }, this);
};

ScaleManager.EXACT_FIT = 0;
ScaleManager.NO_SCALE = 1;
ScaleManager.SHOW_ALL = 2;
ScaleManager.RESIZE = 3;
ScaleManager.USER_SCALE = 4;

ScaleManager.prototype = {

  boot: function() {
    // Configure device-dependent compatibility
    var compat = this.compatibility;
        compat.supportsFullScreen = Device.fullscreen;

    if(Device.desktop) {
      compat.orientationFallback = 'screen';
      compat.clickTrampoline = 'when-not-mouse';
    } else {
      compat.orientationFallback = '';
      compat.clickTrampoline = '';
    }

    // Configure event listeners
    var self = this;
    this._orientationChange = function(event) {
      return self.orientationChange(event);
    };
    this._windowResize = function(event) {
      return self.windowResize(event);
    };

    // This does not appear to be on the standards track
    global.addEventListener('orientationchange', this._orientationChange, false);
    global.addEventListener('resize', this._windowResize, false);

    if(compat.supportsFullScreen) {
      this._fullScreenChange = function(event) {
        return self.fullScreenChange(event);
      };

      this._fullScreenError = function(event) {
        return self.fullScreenError(event);
      };

      global.document.addEventListener('webkitfullscreenchange', this._fullScreenChange, false);
      global.document.addEventListener('mozfullscreenchange', this._fullScreenChange, false);
      global.document.addEventListener('MSFullscreenChange', this._fullScreenChange, false);
      global.document.addEventListener('fullscreenchange', this._fullScreenChange, false);

      global.document.addEventListener('webkitfullscreenerror', this._fullScreenError, false);
      global.document.addEventListener('mozfullscreenerror', this._fullScreenError, false);
      global.document.addEventListener('MSFullscreenError', this._fullScreenError, false);
      global.document.addEventListener('fullscreenerror', this._fullScreenError, false);
    }

    // this.game.onResume.add(this._gameResumed, this);

    // Initialize core bounds
    this.dom.getOffset(this.game.canvas, this.offset);
    this.bounds.setTo(this.offset.x, this.offset.y, this.width, this.height);
    this.setGameSize(this.game.width, this.game.height);

    // Don't use updateOrientationState so events are not fired
    this.screenOrientation = this.dom.getScreenOrientation(this.compatibility.orientationFallback);

    // this.grid = new Phaser.FlexGrid(this, this.width, this.height);

    this._booted = true;

    if(this._pendingScaleMode) {
      this.scaleMode = this._pendingScaleMode;
      this._pendingScaleMode = null;
    }
  },

  parseConfig: function(config) {
    if(config['scaleMode']) {
      if(this._booted) {
        this.scaleMode = config['scaleMode'];
      } else {
        this._pendingScaleMode = config['scaleMode'];
      }
    }

    if(config['fullScreenScaleMode']) {
      this.fullScreenScaleMode = config['fullScreenScaleMode'];
    }

    if(config['fullScreenTarget']) {
      this.fullScreenTarget = config['fullScreenTarget'];
    }
  },

  setupScale: function(width, height) {
    var target,
        rect = new Rectangle();

    if(this.game.parent !== '') {
      if(typeof this.game.parent === 'string') {
        // hopefully an element ID
        target = global.document.getElementById(this.game.parent);
      } else if(this.game.parent && this.game.parent.nodeType === 1) {
        // quick test for a HTMLelement
        target = this.game.parent;
      }
    }

    // Fallback, covers an invalid ID and a non HTMLelement object
    if(!target) {
      // Use the full window
      this.parentNode = null;
      this.parentIsWindow = true;

      rect.width = this.dom.visualBounds.width;
      rect.height = this.dom.visualBounds.height;

      this.offset.set(0, 0);
    } else {
      this.parentNode = target;
      this.parentIsWindow = false;

      this.getParentBounds(this._parentBounds);

      rect.width = this._parentBounds.width;
      rect.height = this._parentBounds.height;

      this.offset.set(this._parentBounds.x, this._parentBounds.y);
    }

    var newWidth = 0;
    var newHeight = 0;
    if(typeof width === 'number') {
      newWidth = width;
    } else {
      // Percentage based
      this.parentScaleFactor.x = parseInt(width, 10) / 100;
      newWidth = rect.width * this.parentScaleFactor.x;
    }

    if(typeof height === 'number') {
      newHeight = height;
    } else {
      // Percentage based
      this.parentScaleFactor.y = parseInt(height, 10) / 100;
      newHeight = rect.height * this.parentScaleFactor.y;
    }

    this._gameSize.setTo(0, 0, newWidth, newHeight);
    this.updateDimensions(newWidth, newHeight, false);
  },

  _gameResumed: function() {
    this.queueUpdate(true);
  },

  setGameSize: function(width, height, silent) {
    this._gameSize.setTo(0, 0, width, height);
    // if(this.currentScaleMode !== ScaleManager.RESIZE) {
      this.updateDimensions(width, height, true);
    // }
    if(!silent) {
      this.queueUpdate(true);
    }
  },

  setUserScale: function(hScale, vScale, hTrim, vTrim) {
    this._userScaleFactor.setTo(hScale, vScale);
    this._userScaleTrim.setTo(hTrim | 0, vTrim | 0);
    this.queueUpdate(true);
  },

  setResizeCallback: function(callback, context) {
    this.onResize = callback;
    this.onResizeContext = context;
  },

  signalSizeChange: function() {
    var width, height;
    if(!Rectangle.sameDimensions(this, this._lastReportedCanvasSize) ||
        !Rectangle.sameDimensions(this.game, this._lastReportedGameSize)) {
      
      width = this.width;
      height = this.height;

      this._lastReportedCanvasSize.setTo(0, 0, width, height);
      this._lastReportedGameSize.setTo(0, 0, this.game.width, this.game.height);

      // this.grid.onResize(width, height);
      // this.onSizeChange.dispatch(this, width, height);

      this.game.state.resize(this.game.width, this.game.height);
    }
  },

  setMinMax: function(minWidth, minHeight, maxWidth, maxHeight) {
    this.minWidth = minWidth;
    this.minHeight = minHeight;

    if(typeof maxWidth !== 'undefined') {
      this.maxWidth = maxWidth;
    }

    if(typeof maxHeight !== 'undefined') {
      this.maxHeight = maxHeight;
    }
  },

  preUpdate: function() {
    if(this.game.clock.time < (this._lastUpdate + this._updateThrottle)) {
      return;
    }

    var prevThrottle = this._updateThrottle;

    this._updateThrottleReset = prevThrottle >= 400 ? 0 : 100;
    this.dom.getOffset(this.game.canvas, this.offset);

    var prevWidth = this._parentBounds.width;
    var prevHeight = this._parentBounds.height;
    var bounds = this.getParentBounds(this._parentBounds);
    var boundsChanged = bounds.width !== prevWidth || bounds.height !== prevHeight;

    // Always invalidate on a newly detected orientation change
    var orientationChanged = this.updateOrientationState();
    if(boundsChanged || orientationChanged) {
      if(this.onResize) {
        this.onResize.call(this.onResizeContext, this, bounds);
      }

      this.updateLayout();
      this.signalSizeChange();
    }

    // Next throttle, eg. 25, 50, 100, 200..
    var throttle = this._updateThrottle * 2;

    // Don't let an update be too eager about resetting the throttle.
    if(this._updateThrottle < prevThrottle) {
      throttle = global.Math.min(prevThrottle, this._updateThrottleReset);
    }

    this._updateThrottle = Math.clamp(throttle, 25, this.trackParentInterval);
    this._lastUpdate = this.game.clock.time;
  },

  pauseUpdate: function() {
    this.preUpdate();

    // Updates at slowest.
    this._updateThrottle = this.trackParentInterval;
  },

  updateDimensions: function(width, height, resize) {
    this.width = width * this.parentScaleFactor.x;
    this.height = height * this.parentScaleFactor.y;

    this.game.width = this.width;
    this.game.height = this.height;

    this.sourceAspectRatio = this.width / this.height;
    this.updateScalingAndBounds();

    if(resize) {
      //  Resize the renderer (which in turn resizes the Display canvas!)
      this.game.renderer.resize(this.width, this.height);

      //  The Camera can never be smaller than the Game size
      this.game.camera.setSize(this.width, this.height);

      //  This should only happen if the world is smaller than the new canvas size
      this.game.world.resize(this.width, this.height);
    }
  },

  updateScalingAndBounds: function() {
    this.scaleFactor.x = this.game.width / this.width;
    this.scaleFactor.y = this.game.height / this.height;

    this.scaleFactorInversed.x = this.width / this.game.width;
    this.scaleFactorInversed.y = this.height / this.game.height;

    this.aspectRatio = this.width / this.height;

    // This can be invoked in boot pre-canvas
    if(this.game.canvas) {
      this.dom.getOffset(this.game.canvas, this.offset);
    }

    this.bounds.setTo(this.offset.x, this.offset.y, this.width, this.height);

    // Can be invoked in boot pre-input
    if(this.game.input && this.game.input.scale) {
      this.game.input.scale.setTo(this.scaleFactor.x, this.scaleFactor.y);
    }
  },

  forceOrientation: function(forceLandscape, forcePortrait) {
    if(forcePortrait === undefined) { forcePortrait = false; }

    this.forceLandscape = forceLandscape;
    this.forcePortrait = forcePortrait;

    this.queueUpdate(true);
  },

  classifyOrientation: function(orientation) {
    if(orientation === 'portrait-primary' || orientation === 'portrait-secondary') {
      return 'portrait';
    } else if(orientation === 'landscape-primary' || orientation === 'landscape-secondary') {
      return 'landscape';
    } else {
      return null;
    }
  },

  updateOrientationState: function() {
    var previousOrientation = this.screenOrientation;
    var previouslyIncorrect = this.incorrectOrientation;
    
    this.screenOrientation = this.dom.getScreenOrientation(this.compatibility.orientationFallback);
    this.incorrectOrientation = (this.forceLandscape && !this.isLandscape) || (this.forcePortrait && !this.isPortrait);

    var changed = previousOrientation !== this.screenOrientation;
    var correctnessChanged = previouslyIncorrect !== this.incorrectOrientation;

    if(correctnessChanged) {
      if(this.incorrectOrientation) {
        // this.enterIncorrectOrientation.dispatch();
      } else {
        // this.leaveIncorrectOrientation.dispatch();
      }
    }

    if(changed || correctnessChanged) {
      // this.onOrientationChange.dispatch(this, previousOrientation, previouslyIncorrect);
    }

    return changed || correctnessChanged;
  },

  orientationChange: function(event) {
    this.event = event;
    this.queueUpdate(true);
  },

  windowResize: function(event) {
    this.event = event;
    this.queueUpdate(true);
  },

  refresh: function() {
    this.queueUpdate(true);
  },

  updateLayout: function() {
    var bounds,
        scaleMode = this.currentScaleMode;

    if(scaleMode === ScaleManager.RESIZE) {
      this.reflowGame();
      return;
    }

    if(this.compatibility.forceMinimumDocumentHeight) {
      // (This came from older code, by why is it here?)
      // Set minimum height of content to new window height
      global.document.documentElement.style.minHeight = global.innerHeight + 'px';
    }
    
    if(this.incorrectOrientation) {
      this.setMaximum();
    } else {
      if(scaleMode === ScaleManager.EXACT_FIT) {
        this.setExactFit();
      } else if(scaleMode === ScaleManager.SHOW_ALL) {
        if(!this.isFullScreen && this.boundingParent && this.compatibility.canExpandParent) {
          // try to expand parent out, but choosing maximizing dimensions.                    
          // then select minimize dimensions which should then honor parent
          // maximum bound applications.
          this.setShowAll(true);
          this.resetCanvas();
          this.setShowAll();
        } else {
          this.setShowAll();
        }
      } else if(scaleMode === ScaleManager.NO_SCALE) {
        this.width = this.game.width;
        this.height = this.game.height;
      } else if(scaleMode === ScaleManager.USER_SCALE) {
        this.width = (this.game.width * this._userScaleFactor.x) - this._userScaleTrim.x;
        this.height = (this.game.height * this._userScaleFactor.y) - this._userScaleTrim.y;
      }
    }

    if(!this.compatibility.canExpandParent && (
        scaleMode === ScaleManager.SHOW_ALL ||
        scaleMode === ScaleManager.USER_SCALE)) {
      bounds = this.getParentBounds(this._tempBounds);
      this.width = global.Math.min(this.width, bounds.width);
      this.height = global.Math.min(this.height, bounds.height);
    }

    // Always truncate / force to integer
    this.width = this.width | 0;
    this.height = this.height | 0;

    this.reflowCanvas();
  },

  getParentBounds: function(target) {
    var bounds = target || new Rectangle(),
        parentNode = this.boundingParent,
        visualBounds = this.dom.visualBounds,
        layoutBounds = this.dom.layoutBounds;

    if(!parentNode) {
      bounds.setTo(0, 0, visualBounds.width, visualBounds.height);
    } else {
      // Ref. http://msdn.microsoft.com/en-us/library/hh781509(v=vs.85).aspx for getBoundingClientRect
      var clientRect = parentNode.getBoundingClientRect();
      var parentRect = parentNode.offsetParent ?
            parentNode.offsetParent.getBoundingClientRect() :
            parentNode.getBoundingClientRect();


      bounds.setTo(clientRect.left - parentRect.left, clientRect.top - parentRect.top, clientRect.width, clientRect.height);

      var wc = this.windowConstraints;
      if(wc.right) {
        var windowBounds = wc.right === 'layout' ? layoutBounds : visualBounds;
        bounds.right = global.Math.min(bounds.right, windowBounds.width);
      }
      if(wc.bottom) {
        var windowBounds = wc.bottom === 'layout' ? layoutBounds : visualBounds;
        bounds.bottom = global.Math.min(bounds.bottom, windowBounds.height);
      }
    }

    bounds.setTo(
      global.Math.round(bounds.x), global.Math.round(bounds.y),
      global.Math.round(bounds.width), global.Math.round(bounds.height));

    return bounds;
  },

  alignCanvas: function(horizontal, vertical) {
    var parentBounds = this.getParentBounds(this._tempBounds),
        canvas = this.game.canvas,
        margin = this.margin;

    if(horizontal) {
      margin.left = margin.right = 0;

      var canvasBounds = canvas.getBoundingClientRect();

      if(this.width < parentBounds.width && !this.incorrectOrientation) {
        var currentEdge = canvasBounds.left - parentBounds.x;
        var targetEdge = (parentBounds.width / 2) - (this.width / 2);

        targetEdge = global.Math.max(targetEdge, 0);

        var offset = targetEdge - currentEdge;

        margin.left = global.Math.round(offset);
      }

      canvas.style.marginLeft = margin.left + 'px';

      if(margin.left !== 0) {
        margin.right = -(parentBounds.width - canvasBounds.width - margin.left);
        canvas.style.marginRight = margin.right + 'px';
      }
    }

    if(vertical) {
      margin.top = margin.bottom = 0;

      var canvasBounds = canvas.getBoundingClientRect();
      
      if(this.height < parentBounds.height && !this.incorrectOrientation) {
        var currentEdge = canvasBounds.top - parentBounds.y;
        var targetEdge = (parentBounds.height / 2) - (this.height / 2);

        targetEdge = global.Math.max(targetEdge, 0);
        
        var offset = targetEdge - currentEdge;
        margin.top = global.Math.round(offset);
      }

      canvas.style.marginTop = margin.top + 'px';

      if(margin.top !== 0) {
        margin.bottom = -(parentBounds.height - canvasBounds.height - margin.top);
        canvas.style.marginBottom = margin.bottom + 'px';
      }
    }

    // Silly backwards compatibility..
    margin.x = margin.left;
    margin.y = margin.top;
  },

  reflowGame: function() {
    var bounds = this.getParentBounds(this._tempBounds),
        width = bounds.width,
        height = bounds.height,
        w, h,
        resolutionMaximum = this._resolutionMaximum;
    if(width < resolutionMaximum) {
      this.resetCanvas('', '');
      this.updateDimensions(width, height, true);
    } else {
      this.setExactFit();
      this.reflowCanvas();
    }
  },

  reflowCanvas: function() {
    if(!this.incorrectOrientation) {
      this.width = Math.clamp(this.width, this.minWidth || 0, this.maxWidth || this.width);
      this.height = Math.clamp(this.height, this.minHeight || 0, this.maxHeight || this.height);
    }

    this.resetCanvas();

    if(!this.compatibility.noMargins) {
      if(this.isFullScreen && this._createdFullScreenTarget) {
        this.alignCanvas(true, true);
      } else {
        this.alignCanvas(this.pageAlignHorizontally, this.pageAlignVertically);
      }
    }

    this.updateScalingAndBounds();
  },

  resetCanvas: function(cssWidth, cssHeight) {
    if(cssWidth === undefined) { cssWidth = this.width + 'px'; }
    if(cssHeight === undefined) { cssHeight = this.height + 'px'; }

    var canvas = this.game.canvas;
    if(!this.compatibility.noMargins) {
      canvas.style.marginLeft = '';
      canvas.style.marginTop = '';
      canvas.style.marginRight = '';
      canvas.style.marginBottom = '';
    }

    canvas.style.width = cssWidth;
    canvas.style.height = cssHeight;
  },

  queueUpdate: function(force) {
    if(force) {
      this._parentBounds.width = 0;
      this._parentBounds.height = 0;
    }
    this._updateThrottle = this._updateThrottleReset;
  },

  reset: function(clearWorld) {
    if(clearWorld) {
        // this.grid.reset();
    }
  },

  setMaximum: function() {
    this.width = this.dom.visualBounds.width;
    this.height = this.dom.visualBounds.height;
  },

  setShowAll: function(expanding) {
    var bounds = this.getParentBounds(this._tempBounds),
        width = bounds.width,
        height = bounds.height,
        multiplier;

    if(expanding) {
      multiplier = global.Math.max((height / this.game.height), (width / this.game.width));
    } else {
      multiplier = global.Math.min((height / this.game.height), (width / this.game.width));
    }

    this.width = global.Math.round(this.game.width * multiplier);
    this.height = global.Math.round(this.game.height * multiplier);
  },

  setExactFit: function() {
    var bounds = this.getParentBounds(this._tempBounds),
        w = bounds.width,
        h = bounds.height,
        width = this.resolution,
        height = this.resolution * (h / w);

    this.setGameSize(width, height, true);

    this.width = w;
    this.height = h;

    if(this.isFullScreen) {
      // Max/min not honored fullscreen
      return;
    }

    if(this.maxWidth) {
      this.width = global.Math.min(this.width, this.maxWidth);
    }

    if(this.maxHeight) {
      this.height = global.Math.min(this.height, this.maxHeight);
    }
  },

  createFullScreenTarget: function() {
    var fsTarget = global.document.createElement('div');
        fsTarget.style.margin = '0';
        fsTarget.style.padding = '0';
        fsTarget.style.background = '#000';
    return fsTarget;
  },

  startFullScreen: function(antialias, allowTrampoline) {
    if(this.isFullScreen) {
      return false;
    }

    if(!this.compatibility.supportsFullScreen) {
      // Error is called in timeout to emulate the real fullscreenerror event better
      var self = this;
      setTimeout(function() {
        self.fullScreenError();
      }, 10);
      return;
    }

    if(this.compatibility.clickTrampoline === 'when-not-mouse') {
      var input = this.game.input;
      if(input.activePointer && input.activePointer !== input.mousePointer && (
          allowTrampoline || allowTrampoline !== false)) {
        input.activePointer.addClickTrampoline('startFullScreen', this.startFullScreen, this, [antialias, false]);
        return;
      }
    }

    if(typeof antialias !== 'undefined' && this.game.renderType === Const.CANVAS) {
      this.game.stage.smoothed = antialias;
    }

    var fsTarget = this.fullScreenTarget;
    if(!fsTarget) {
      this.cleanupCreatedTarget();
      this._createdFullScreenTarget = this.createFullScreenTarget();
      fsTarget = this._createdFullScreenTarget;
    }

    var initData = {
      targetElement: fsTarget
    };

    // this.onFullScreenInit.dispatch(this, initData);

    if(this._createdFullScreenTarget) {
      // Move the Display canvas inside of the target and add the target to the DOM
      // (The target has to be added for the Fullscreen API to work.)
      var canvas = this.game.canvas;
      var parent = canvas.parentNode;
      parent.insertBefore(fsTarget, canvas);
      fsTarget.appendChild(canvas);
    }

    if(Device.fullscreenKeyboard) {
      fsTarget[Device.requestFullscreen](Element.ALLOW_KEYBOARD_INPUT);
    } else {
      fsTarget[Device.requestFullscreen]();
    }

    return true;
  },

  stopFullScreen: function() {
    if(!this.isFullScreen || !this.compatibility.supportsFullScreen) {
      return false;
    }

    global.document[Device.cancelFullscreen]();

    return true;
  },

  cleanupCreatedTarget: function() {
    var fsTarget = this._createdFullScreenTarget;

    if(fsTarget && fsTarget.parentNode) {
      // Make sure to cleanup synthetic target for sure;
      // swap the canvas back to the parent.
      var parent = fsTarget.parentNode;
      parent.insertBefore(this.game.canvas, fsTarget);
      parent.removeChild(fsTarget);
    }

    this._createdFullScreenTarget = null;
  },

  prepScreenMode: function(enteringFullscreen) {
    var createdTarget = !!this._createdFullScreenTarget;
    var fsTarget = this._createdFullScreenTarget || this.fullScreenTarget;

    if(enteringFullscreen) {
      if(createdTarget || this.fullScreenScaleMode === ScaleManager.EXACT_FIT) {
        // Resize target, as long as it's not the canvas
        if(fsTarget !== this.game.canvas) {
          this._fullScreenRestore = {
              targetWidth: fsTarget.style.width,
              targetHeight: fsTarget.style.height
          };

          fsTarget.style.width = '100%';
          fsTarget.style.height = '100%';
        }
      }
    } else {
      // Have restore information
      if(this._fullScreenRestore) {
        fsTarget.style.width = this._fullScreenRestore.targetWidth;
        fsTarget.style.height = this._fullScreenRestore.targetHeight;

        this._fullScreenRestore = null;
      }

      // Always reset to game size
      this.updateDimensions(this._gameSize.width, this._gameSize.height, true);
      this.resetCanvas();
    }
  },

  fullScreenChange: function(event) {
    this.event = event;

    if(this.isFullScreen) {
      this.prepScreenMode(true);

      this.updateLayout();
      this.queueUpdate(true);
    } else {
      this.prepScreenMode(false);

      this.cleanupCreatedTarget();

      this.updateLayout();
      this.queueUpdate(true);
    }

    // this.onFullScreenChange.dispatch(this, this.width, this.height);
  },

  fullScreenError: function(event) {
    this.event = event;
    this.cleanupCreatedTarget();

    console.warn('ScaleManager: requestFullscreen failed or device does not support the Fullscreen API');

    // this.onFullScreenError.dispatch(this);
  },

  scaleSprite: function(sprite, width, height, letterBox) {
    if(width === undefined) { width = this.width; }
    if(height === undefined) { height = this.height; }
    if(letterBox === undefined) { letterBox = false; }

    if(!sprite || !sprite['scale']) {
        return sprite;
    }

    sprite.scale.x = 1;
    sprite.scale.y = 1;

    if((sprite.width <= 0) || (sprite.height <= 0) || (width <= 0) || (height <= 0)) {
      return sprite;
    }

    var scaleX1 = width;
    var scaleY1 = (sprite.height * width) / sprite.width;

    var scaleX2 = (sprite.width * height) / sprite.height;
    var scaleY2 = height;

    var scaleOnWidth = (scaleX2 > width);

    if(scaleOnWidth) {
      scaleOnWidth = letterBox;
    } else {
      scaleOnWidth = !letterBox;
    }

    if(scaleOnWidth) {
      sprite.width = global.Math.floor(scaleX1);
      sprite.height = global.Math.floor(scaleY1);
    } else {
      sprite.width = global.Math.floor(scaleX2);
      sprite.height = global.Math.floor(scaleY2);
    }

    //  Enable at some point?
    // sprite.x = global.Math.floor((width - sprite.width) / 2);
    // sprite.y = global.Math.floor((height - sprite.height) / 2);

    return sprite;
  },

  destroy: function() {
    this.game.onResume.remove(this._gameResumed, this);

    global.removeEventListener('orientationchange', this._orientationChange, false);
    global.removeEventListener('resize', this._windowResize, false);

    if(this.compatibility.supportsFullScreen) {
      global.document.removeEventListener('webkitfullscreenchange', this._fullScreenChange, false);
      global.document.removeEventListener('mozfullscreenchange', this._fullScreenChange, false);
      global.document.removeEventListener('MSFullscreenChange', this._fullScreenChange, false);
      global.document.removeEventListener('fullscreenchange', this._fullScreenChange, false);

      global.document.removeEventListener('webkitfullscreenerror', this._fullScreenError, false);
      global.document.removeEventListener('mozfullscreenerror', this._fullScreenError, false);
      global.document.removeEventListener('MSFullscreenError', this._fullScreenError, false);
      global.document.removeEventListener('fullscreenerror', this._fullScreenError, false);
    }
  }
};

ScaleManager.prototype.constructor = ScaleManager;

Object.defineProperty(ScaleManager.prototype, 'boundingParent', {
  get: function() {
    if(this.parentIsWindow || (this.isFullScreen &&
        !this._createdFullScreenTarget)) {
      return null;
    }
    return (this.game.canvas && this.game.canvas.parentNode) || null;
  }
});

Object.defineProperty(ScaleManager.prototype, 'scaleMode', {
  get: function() {
    return this._scaleMode;
  },

  set: function(value) {
    if(value !== this._scaleMode) {
      if(!this.isFullScreen) {
        this.updateDimensions(this._gameSize.width, this._gameSize.height, true);
        this.queueUpdate(true);
      }
      this._scaleMode = value;
    }
    return this._scaleMode;
  }
});

Object.defineProperty(ScaleManager.prototype, 'resolutionMode', {
  get: function() {
    return this._resolutionMode;
  },

  set: function(value) {
    this._resolutionMode = value;
  }
});

Object.defineProperty(ScaleManager.prototype, 'resolution', {
  get: function() {
    switch(this._resolutionMode) {
      case 'max':
        return this._resolutionMaximum;
      case 'medium':
        return this._resolutionMedium;
      case 'low':
        return this._resolutionLow;
      default:
        return this._resolutionMaximum;
    }
  },
});

Object.defineProperty(ScaleManager.prototype, 'fullScreenScaleMode', {
  get: function() {
    return this._fullScreenScaleMode;
  },

  set: function(value) {
    if(value !== this._fullScreenScaleMode) {
      // If in fullscreen then need a wee bit more work
      if(this.isFullScreen) {
        this.prepScreenMode(false);
        this._fullScreenScaleMode = value;
        this.prepScreenMode(true);

        this.queueUpdate(true);
      } else {
        this._fullScreenScaleMode = value;
      }
    }
    return this._fullScreenScaleMode;
  }
});

Object.defineProperty(ScaleManager.prototype, 'currentScaleMode', {
  get: function() {
    return this.isFullScreen ? this._fullScreenScaleMode : this._scaleMode;
  }
});


Object.defineProperty(ScaleManager.prototype, 'pageAlignHorizontally', {
  get: function() {
    return this._pageAlignHorizontally;
  },

  set: function(value) {
    if(value !== this._pageAlignHorizontally) {
      this._pageAlignHorizontally = value;
      this.queueUpdate(true);
    }
  }
});

Object.defineProperty(ScaleManager.prototype, 'pageAlignVertically', {
  get: function() {
    return this._pageAlignVertically;
  },

  set: function(value) {
    if(value !== this._pageAlignVertically) {
      this._pageAlignVertically = value;
      this.queueUpdate(true);
    }
  }
});

Object.defineProperty(ScaleManager.prototype, 'isFullScreen', {
  get: function() {
    return !!(global.document['fullscreenElement'] ||
      global.document['webkitFullscreenElement'] ||
      global.document['mozFullScreenElement'] ||
      global.document['msFullscreenElement']);
  }
});

Object.defineProperty(ScaleManager.prototype, 'isPortrait', {
  get: function() {
    return this.classifyOrientation(this.screenOrientation) === 'portrait';
  }
});

Object.defineProperty(ScaleManager.prototype, 'isLandscape', {
  get: function() {
    return this.classifyOrientation(this.screenOrientation) === 'landscape';
  }
});

Object.defineProperty(ScaleManager.prototype, 'isGamePortrait', {
  get: function() {
    return (this.height > this.width);
  }
});

Object.defineProperty(ScaleManager.prototype, 'isGameLandscape', {
  get: function() {
    return (this.width > this.height);
  }
});

module.exports = ScaleManager;
