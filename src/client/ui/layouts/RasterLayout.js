
var Layout = require('../Layout');

function RasterLayout(flag) {
  this.flag = flag ? flag : Layout.USE_PS_SIZE;
};

RasterLayout.prototype.calcPreferredSize = function(target) {
  var child, ps, px, py,
      m = { width: 0, height: 0 },
      usePsSize = (this.flag & Layout.USE_PS_SIZE) > 0;

  for(var i = 0;i < target.panels.length; i++ ) {
    child = target.panels[i];
    if(child.visible === true) {
      ps = usePsSize ? child.getPreferredSize() : { width: child.width, height: child.height };
      px = child.x + ps.width;
      py = child.y + ps.height;

      if(px > m.width) {
        m.width = px;
      }
      if(py > m.height) {
        m.height = py;
      }
    }
  }
  return m;
};

RasterLayout.prototype.doLayout = function(target) {
  var child, ps, ww, hh, x, y,
      r = target.size.width - target.right,
      b = target.size.height - target.bottom,
      usePsSize = (this.flag & Layout.USE_PS_SIZE) > 0;

  for(var i=0; i<target.panels.length; i++) {
    child = target.panels[i];
    ww = 0;
    hh = 0;

    if(child.visible === true) {
      if(usePsSize) {
        ps = child.getPreferredSize();
        ww = ps.width;
        hh = ps.height;
      } else{
        ww = child.width;
        hh = child.height;
      }

      if(child.constraint) {
        if((child.constraint & Layout.HORIZONTAL) > 0) {
          ww = r - child.x;
        }
        if((child.constraint & Layout.VERTICAL) > 0) {
          hh = b - child.y;
        }
      }

      child.resize(ww, hh);

      if(child.constraint) {
        x = child.x;
        y = child.y;

        if(child.constraint == Layout.CENTER) {
          x = (target.size.width - ww)/2;
          y = (target.size.height - hh)/2;
        } else {
          if((child.constraint & Layout.TOP) > 0) {
            y = 0;
          } else if((child.constraint & Layout.BOTTOM) > 0) {
            y = target.size.height - hh;
          }

          if((child.constraint & Layout.LEFT) > 0) {
            x = 0;
          } else if((child.constraint & Layout.RIGHT) > 0) {
            x = target.size.width - ww;
          }
        }

        child.reposition(x, y);
      }
    }
  }
};

module.exports = RasterLayout;
