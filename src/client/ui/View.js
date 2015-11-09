
function View() {
  this.gap = 0;
};

View.prototype.constructor = View;
View.prototype.paint = function() {};

Object.defineProperty(View.prototype, 'top', {
  get: function() {
    return this.gap;
  }
});

Object.defineProperty(View.prototype, 'left', {
  get: function() {
    return this.gap;
  }
});

Object.defineProperty(View.prototype, 'bottom', {
  get: function() {
    return this.gap;
  }
});

Object.defineProperty(View.prototype, 'right', {
  get: function() {
    return this.gap;
  }
});
    
module.exports = View;
