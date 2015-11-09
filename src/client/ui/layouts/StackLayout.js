
var Layout = require('../Layout');

function StackLayout() {};

StackLayout.prototype.calcPreferredSize = function(target) {
  var child, ps,
      maxWidth = 0,
      maxHeight = 0;
  for(var i=0; i<target.panels.length; i++) {
    child = target.panels[i];
    if(child.visible === true){
      ps = child.getPreferredSize();
      if(ps.width > maxWidth) {
        maxWidth = ps.width;
      }
      if(ps.height > maxHeight) {
        maxHeight = ps.height;
      }
    }
  }
  return { width: maxWidth, height: maxHeight };
};

StackLayout.prototype.doLayout = function(target) {
  var child, ps,
      top = target.top,
      hh = target.size.height - target.bottom - top,
      left = target.left,
      ww = target.size.width - target.right - left;

  for(var i=0; i<target.panels.length; i++){
    child = target.panels[i];

    if(child.visible === true) {
      constraint = child.constraint;

      if(constraint == Layout.USE_PS_SIZE) {
        ps = child.getPreferredSize();
        child.setSize(ps.width, ps.height);
        child.setLocation(left + ~~((ww - ps.width )/2), top + ~~((hh - ps.height)/2));
      } else {
        child.setSize(ww, hh);
        child.setLocation(left, top);
      }
    }
  }
};

module.exports = StackLayout;
