
var engine = require('engine'),
    Layout = require('./Layout'),
    StackLayout = require('./layouts/StackLayout');

function Panel(game, layout, constraint) {
  engine.Group.call(this, game);

  this.layout = layout || new StackLayout();
  this.constraint = constraint || Layout.NONE;
  
  this.psWidth = this.psHeight =
    this.cachedWidth = this.cachedHeight = -1;

  this.size = { width: 0, height: 0 };
  this.margin = { top: 0, left: 0, bottom: 0, right: 0 };
  this.padding = { top: 0, left: 0, bottom: 0, right: 0 };

  this.views = [];
  this.panels = [];

  this.isViewValid = false;
  this.isLayoutValid = false;
}

Panel.prototype = Object.create(engine.Group.prototype);
Panel.prototype.constructor = Panel;

Panel.prototype.addPanel = function(panel) {
  this.panels.push(panel);
  this.add(panel);
};

Panel.prototype.removePanel = function(panel, options) {
  this.panels.splice(this.panels.indexOf(panel), 1);
  this.remove(panel, options || false);
};

Panel.prototype.removeAll = function() {
  var panel,
      panels = this.panels.slice(0),
      len = panels.length;
  for(var i=0; i<len; i++) {
    panel = panels[i];
    this.removePanel(panel);
  }
};

Panel.prototype.addView = function(view) {
  this.views.push(view);
  this.add(view);
};

Panel.prototype.invalidate = function(valid, view) {
  this.isLayoutValid = valid || false;
  this.isViewValid =  view || false;
  this.cachedWidth = -1;
  this.cachedHeight = -1;
  
  for(var i=0; i<this.panels.length; i++) {
    this.panels[i].invalidate(valid, view);
  }

  !this.isLayoutValid && this.validate();
  !this.isViewValid && this.repaint();
};

Panel.prototype.validate = function() {
  if(this.isLayoutValid === false && this.visible === true) {

    this.layout.doLayout(this);

    for(var i=0; i<this.panels.length; i++) {
      if(!this.panels[i].isLayoutValid) {
        this.panels[i].validate();
      }
    }

    this.isLayoutValid = true;
  }
};

Panel.prototype.repaint = function() {
  this.paint(this);

  if(this.visible === true) {
    for(var i=0; i<this.panels.length; i++) {
      if(!this.panels[i].isViewValid) {
        this.panels[i].repaint();
      }
    }
  }
  
  this.isViewValid = true;
};

Panel.prototype.paint = function() {
  for(var i=0; i<this.views.length; i++) {
    this.views[i].paint();
  }
};

Panel.prototype.setMargin = function(top, left, bottom, right) {
  if(arguments.length == 1) {
    left = bottom = right = top;
  }

  if(arguments.length == 2) {
    bottom = top;
    right = left;
  }
  
  if(this.margin.top != top ||
      this.margin.left != left ||
      this.margin.bottom != bottom ||
      this.margin.right != right) {

    this.margin.top = top;
    this.margin.left = left;
    this.margin.bottom = bottom;
    this.margin.right = right;
  }

  return this;
};

Panel.prototype.setPadding = function(top, left, bottom, right) {
  if(arguments.length == 1) {
    left = bottom = right = top;
  }

  if(arguments.length == 2) {
    bottom = top;
    right = left;
  }
  
  if(this.padding.top != top ||
      this.padding.left != left ||
      this.padding.bottom != bottom ||
      this.padding.right != right) {

    this.padding.top = top;
    this.padding.left = left;
    this.padding.bottom = bottom;
    this.padding.right = right;
  }

  return this;
};

Panel.prototype.resize = function(width, height) {
  if(width != this.size.width || height != this.size.height) {
    this.size.width = width;
    this.size.height = height;
    
    this.isViewValid = false;
    this.isLayoutValid = false;
  }
  return this;
};

Panel.prototype.location = function(xx, yy) {
  if(xx != this.x || this.y != yy) {
    this.position.x = xx;
    this.position.y = yy;

    if(this.relocated != null) {
      this.relocated(xx, yy);
    }
  }
};

Panel.prototype.setPreferredSize = function(width, height) {
  if(width != this.psWidth || height != this.psHeight) {
    this.psWidth = width;
    this.psHeight = height;

    this.size.width = width;
    this.size.height = height;
  }
};

Panel.prototype.getPreferredSize = function() {
  if(this.cachedWidth < 0) {
    var ps = (this.psWidth < 0 || this.psHeight < 0) ? this.layout.calcPreferredSize(this) : { width: 0, height: 0 };

        ps.width = this.psWidth >= 0 ? this.psWidth + this.left + this.right : ps.width + this.left + this.right;
        ps.height = this.psHeight >= 0 ? this.psHeight + this.top + this.bottom : ps.height + this.top + this.bottom;
    
    this.cachedWidth = ps.width;
    this.cachedHeight = ps.height;

    return ps;
  }
  return {
    width: this.cachedWidth,
    height: this.cachedHeight
  };
};

Panel.prototype.destroy = function(options) {
  engine.Group.prototype.destroy.call(this, options);

  this.layout = this.margin =
    this.padding = undefined;
  
  this.views = [];
  this.panels = [];
};

Object.defineProperty(Panel.prototype, 'top', {
  get: function() {
    return this.padding.top + this.margin.top;
  }
});

Object.defineProperty(Panel.prototype, 'left', {
  get: function() {
    return this.padding.left + this.margin.left;
  }
});

Object.defineProperty(Panel.prototype, 'bottom', {
  get: function() {
    return this.padding.bottom + this.margin.bottom;
  }
});

Object.defineProperty(Panel.prototype, 'right', {
  get: function() {
    return this.padding.right + this.margin.right;
  }
});

module.exports = Panel;
