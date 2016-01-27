
var Layout = require('../Layout');

function ListLayout(columns, hgap, vgap) {
  this.columns = columns || 3;
  this.hgap = hgap || 0;
  this.vgap = vgap || 0;
};

ListLayout.prototype.calcPreferredSize = function(target) {
  var child, pref,
      panels = target.panels,
      len = panels.length,
      dim = { width: 0, height: 0 },
      mx = 0, my = 0,
      gx = this.hgap,
      gy = this.vgap,
      cols = this.columns;
  for(var i=0; i<len; i++) {
    child = panels[i];

    if(child.visible === true) {
      pref = child.getPreferredSize();
      
      if(cols > 0) {
        if(pref.height + gy > my) {
          my = pref.height + gy;
        }
        mx += pref.width + (cols > 1 ? gx : 0);
        cols--;
      } else {
        if(dim.width < mx) {
          dim.width = mx;
        }
        dim.height += my;
        cols = this.columns;
        mx = 0;
      }
    }
  }

  dim.height += my - gy;

  return dim;
};

ListLayout.prototype.doLayout = function(target) {
  var a, d, nextx, nexty,
      gap = this.gap,
      panels = target.panels,
      len = panels.length,
      t = target.top,
      l = target.left,
      ew = target.size.width - l - target.right,
      eh = target.size.height - t - target.bottom,
      px = l, py = t,
      gx = this.hgap,
      gy = this.vgap;
  for(var i=0; i<len; i++) {
    a = panels[i];

    if(a.visible === true) {
      d = a.getPreferredSize();

      if(px + d.width > ew + gy) {
        px = l;
        py += d.height + gy;
      }

      a.setLocation(px, py);
      a.setSize(d.width, d.height);

      px += d.width + gx;
    }
  }
};

module.exports = ListLayout;
