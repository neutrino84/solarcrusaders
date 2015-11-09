
var Layout = require('../Layout');

function FlowLayout(ax, ay, direction, gap) {
  this.ax = ax || Layout.LEFT;
  this.ay = ay || Layout.TOP;
  this.direction = direction || Layout.HORIZONTAL;
  this.gap = gap || 0;
  this.stretchLast = false;
};

FlowLayout.prototype.calcPreferredSize = function(target) {
  var add, child, pref,
      dim = { width: 0, height: 0 }, cc = 0;

  for(var i=0; i<target.panels.length; i++) {
    child = target.panels[i];
    if(child.visible === true) {
      pref = child.getPreferredSize();
      if(this.direction == Layout.HORIZONTAL) {
        dim.width += pref.width;
        dim.height = pref.height > dim.height ? pref.height : dim.height;
      } else {
        dim.width = pref.width > dim.width ? pref.width : dim.width;
        dim.height += pref.height;
      }
      cc++;
    }
  }

  add = this.gap * (cc > 0 ? cc - 1 : 0);

  if(this.direction == Layout.HORIZONTAL) {
    dim.width += add;
  } else {
    dim.height += add;
  }
  return dim;
};

FlowLayout.prototype.doLayout = function(target) {
  var a, d, ctr,
      psSize = this.calcPreferredSize(target),
      t = target.top,
      l = target.left,
      lastOne = null,
      ew = target.size.width - l - target.right,
      eh = target.size.height - t - target.bottom,
      px = ((this.ax == Layout.RIGHT) ? ew - psSize.width : ((this.ax == Layout.CENTER) ? ~~((ew - psSize.width) / 2) : 0)) + l,
      py = ((this.ay == Layout.BOTTOM) ? eh - psSize.height : ((this.ay == Layout.CENTER) ? ~~((eh - psSize.height) / 2) : 0)) + t;

  for(var i=0; i<target.panels.length; i++) {
    a = target.panels[i];

    if(a.visible === true) {

        d = a.getPreferredSize();
        ctr = a.constraint;

        if(this.direction == Layout.HORIZONTAL) {
          if(ctr === Layout.STRETCH) {
            d.height = target.size.height - t - target.bottom;
          }
          
          a.setLocation(px, ~~((psSize.height - d.height) / 2) + py);
          px += (d.width + this.gap);
        } else {
          if(ctr === Layout.STRETCH) {
            d.width = target.size.width - l - target.right;
            a.setLocation(l, py);
          } else {
            if(ctr === Layout.LEFT) {
              a.setLocation(l, py);
            } else {
              a.setLocation(px + ~~((psSize.width - d.width) / 2), py);
            }
          }
          py += d.height + this.gap;
        }

        a.setSize(d.width, d.height);
        lastOne = a;
    }
  }

  if(lastOne !== null && this.stretchLast === true) {
    if(this.direction == Layout.HORIZONTAL) {
      lastOne.setSize(target.size.width - lastOne.x - target.right, lastOne.height);
    } else {
      lastOne.setSize(lastOne.width, target.size.height - lastOne.y - target.bottom);
    }
  }
};

module.exports = FlowLayout;
