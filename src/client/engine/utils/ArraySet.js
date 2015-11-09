
function ArraySet(list) {
  this.position = 0;
  this.list = list || [];
};

ArraySet.prototype = {

  add: function(item) {
    if(!this.exists(item)) {
      this.list.push(item);
    }
    return item;
  },

  getIndex: function(item) {
    return this.list.indexOf(item);
  },

  getByKey: function(property, value) {
    var i = this.list.length;
    while(i--) {
      if(this.list[i][property] === value) {
        return this.list[i];
      }
    }
    return null;
  },

  exists: function(item) {
    return (this.list.indexOf(item) > -1);
  },

  reset: function() {
    this.list.length = 0;
  },

  remove: function(item) {
      var idx = this.list.indexOf(item);
      if(idx > -1) {
        this.list.splice(idx, 1);
        return item;
      }
  },

  setAll: function(key, value) {
    var i = this.list.length;
    while(i--) {
      if(this.list[i]) {
        this.list[i][key] = value;
      }
    }
  },

  callAll: function(key) {
    var args = Array.prototype.slice.call(arguments, 1);
    var i = this.list.length;
    while(i--) {
      if(this.list[i] && this.list[i][key]) {
        this.list[i][key].apply(this.list[i], args);
      }
    }
  },

  removeAll: function(destroy) {
    if(destroy === undefined) { destroy = false; }

    var i = this.list.length;

    while(i--) {
      if(this.list[i]) {
        var item = this.remove(this.list[i]);

        if(destroy) {
            item.destroy();
        }
      }
    }

    this.position = 0;
    this.list = [];
  }
};


Object.defineProperty(ArraySet.prototype, 'total', {
  get: function() {
    return this.list.length;
  }
});

Object.defineProperty(ArraySet.prototype, 'first', {
  get: function() {
    this.position = 0;
    if(this.list.length > 0) {
      return this.list[0];
    } else {
      return null;
    }
  }
});


Object.defineProperty(ArraySet.prototype, 'next', {
  get: function() {
    if(this.position < this.list.length) {
      this.position++;
      return this.list[this.position];
    } else {
      return null;
    }
  }
});

ArraySet.prototype.constructor = ArraySet;

module.exports = ArraySet;
