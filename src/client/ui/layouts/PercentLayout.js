
var Layout = require('../Layout');

function PercentLayout(dir, gap, stretch) {
  this.direction = dir || Layout.HORIZONTAL;
  this.gap = gap || 0;
  this.stretch = stretch || true;
};

PercentLayout.prototype.calcPreferredSize = function(target) {
  var d, max = 0,
      length = target.panels.length,
      width = this.gap * (length === 0 ? 0 : length-1);

  for(var i=0; i<length; i++) {
    d = target.panels[i].getPreferredSize();
    if(this.direction == Layout.HORIZONTAL) {
      if(d.height > max) {
        max = d.height;
      }
      width += d.width;
    } else {
      if(d.width > max) {
        max = d.width;
      }
      width += d.height;
    }
  }
  return this.direction == Layout.HORIZONTAL ? { width: width, height: max } : { width: max, height: width };
};

PercentLayout.prototype.doLayout = function(target) {
  var child, constraint, useps,
      right = target.right,
      top = target.top,
      bottom = target.bottom,
      left = target.left,
      length = target.panels.length,
      rs = -this.gap * (length === 0 ? 0 : length - 1),
      loc, ns, yy, hh, ph, xx, ww, pw;

  if(this.direction == Layout.HORIZONTAL) {
    rs += target.size.width-left-right;
    loc = left;
  } else {
    rs += target.size.height-top-bottom;
    loc = top;
  }

  for(var i=0; i<length; i++) {
    child = target.panels[i];
    constraint = child.constraint;
    useps = (constraint == Layout.USE_PS_SIZE);

    if(this.direction == Layout.HORIZONTAL) {
      ns = ((length - 1) == i) ? target.size.width - right - loc : (
        useps ? child.getPreferredSize().width : ~~((rs * constraint) / 100)
      );
      
      yy = top;
      hh = target.size.height - top - bottom;
      
      if(this.stretch === false) {
        ph = hh;
        hh = child.getPreferredSize().height;
        yy = top + ~~((ph - hh) / 2);
      }

      child.reposition(loc, yy);
      child.resize(ns, hh);
    } else {
      ns = ((length - 1) == i) ? target.size.height - bottom - loc : (
        useps ? child.getPreferredSize().height : ~~((rs * constraint) / 100)
      );
      
      xx = left;
      ww = target.size.width - left - right;
      
      if(this.stretch === false) {
        pw = ww;
        ww = child.getPreferredSize().width;
        xx = left + ~~((pw - ww)/2);
      }

      child.reposition(xx, loc);
      child.resize(ww, ns);
    }

    loc += (ns + this.gap);
  }
};

module.exports = PercentLayout;
