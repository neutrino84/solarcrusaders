
var Class = {

  isPlainObject: function(obj) {
    if(typeof(obj) !== 'object' || obj.nodeType || obj === obj.window) {
      return false;
    }

    // Support: Firefox <20
    // The try/catch suppresses exceptions thrown when attempting to access
    // the "constructor" property of certain host objects, ie. |window.location|
    // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
    try {
      if(obj.constructor && !({}).hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
        return false;
      }
    } catch (e) {
      return false;
    }

    // If the function hasn't returned already, we're confident that
    // |obj| is a plain object, created by {} or constructed with new Object
    return true;
  },

  extend: function() {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if(typeof target === 'boolean') {
      deep = target;
      target = arguments[1] || {};
      // skip the boolean and the target
      i = 2;
    }

    // extend if only one argument is passed
    if(length === i) {
      target = this;
      --i;
    }

    for(; i<length; i++) {
      // Only deal with non-null/undefined values
      if((options = arguments[i]) != null) {
        // Extend the base object
        for(name in options) {
          src = target[name];
          copy = options[name];

          // Prevent never-ending loop
          if(target === copy) {
            continue;
          }

          // Recurse if we're merging plain objects or arrays
          if(deep && copy && (Class.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
            if(copyIsArray) {
              copyIsArray = false;
              clone = src && Array.isArray(src) ? src : [];
            } else {
              clone = src && Class.isPlainObject(src) ? src : {};
            }

            // Never move original objects, clone them
            target[name] = Class.extend(deep, clone, copy);

          // Don't bring in undefined values
          } else if(copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }

    // Return the modified object
    return target;
  },

  mixinPrototype: function(target, mixin, replace) {
    if(replace === undefined) { replace = false; }

    var mixinKeys = Object.keys(mixin);
    for(var i = 0; i < mixinKeys.length; i++) {
      var key = mixinKeys[i];
      var value = mixin[key];

      if(!replace && (key in target)) {
        //  Not overwriting existing property
        continue;
      } else {
        if(value &&
          (typeof value.get === 'function' || typeof value.set === 'function')) {
          //  Special case for classes like Phaser.Point which has a 'set' function!
          if(typeof value.clone === 'function') {
            target[key] = value.clone();
          } else {
            Object.defineProperty(target, key, value);
          }
        } else {
          target[key] = value;
        }
      }
    }
  },

  mixin: function(from, to) {
    if(!from || typeof (from) !== 'object') { return to; }
    if(Array.isArray(from)) { return from; }

    for(var key in from) {
      var o = from[key];
      if(o.childNodes || o.cloneNode) {
        continue;
      }

      var type = typeof (from[key]);
      if(!from[key] || type !== 'object') {
        to[key] = from[key];
      } else {
        //  Clone sub-object
        if(typeof (to[key]) === type) {
          to[key] = Class.mixin(from[key], to[key]);
        } else {
          to[key] = Class.mixin(from[key], new o.constructor());
        }
      }
    }

    return to;
  }

};

module.exports = Class;
