
var Layout = require('../Layout');

function BorderLayout(hgap, vgap) {
  this.hgap = hgap || 0;
  this.vgap = vgap || 0;
};

BorderLayout.prototype.calcPreferredSize = function(target) {
  var center, west, east, north, south, d, child, constraint,
      dim = { width: 0, height: 0 };
  
  for(var i = 0; i < target.panels.length; i++) {
    child = target.panels[i];
    if(child.visible === true){
      constraint = child.constraint;
      switch(constraint) {
         case Layout.CENTER: center = child; break;
         case Layout.TOP: north = child; break;
         case Layout.BOTTOM: south  = child; break;
         case Layout.LEFT: west = child; break;
         case Layout.RIGHT: east = child; break;
         default: throw new Error('Invalid constraints: ' + constraint);
      }
    }
  }

  if(east != undefined) {
    d = east.getPreferredSize();
    dim.width += d.width + this.hgap;
    dim.height = d.height > dim.height ? d.height : dim.height;
  }

  if(west != undefined) {
    d = west.getPreferredSize();
    dim.width += d.width + this.hgap;
    dim.height = d.height > dim.height ? d.height : dim.height;
  }

  if(center != undefined) {
    d = center.getPreferredSize();
    dim.width += d.width;
    dim.height = d.height > dim.height ? d.height : dim.height;
  }

  if(north != undefined) {
    d = north.getPreferredSize();
    dim.width = d.width > dim.width ? d.width : dim.width;
    dim.height += d.height + this.vgap;
  }

  if(south != undefined) {
    d = south.getPreferredSize();
    dim.width = d.width > dim.width ? d.width : dim.width;
    dim.height += d.height + this.vgap;
  }

  return dim;
};

BorderLayout.prototype.doLayout = function(target) {
  var top = target.top,
      bottom = target.size.height - target.bottom,
      left = target.left,
      right = target.size.width - target.right,
      center, west, east, child, constraint, d;

  for(var i=0; i<target.panels.length; i++) {
    child = target.panels[i];
    if(child.visible === true) {
      constraint = child.constraint;
      switch(constraint) {
        case Layout.CENTER: center = child; break;
        case Layout.TOP :
          var ps = child.getPreferredSize();
          child.location(left, top);
          child.resize(right - left, ps.height);
          top += ps.height + this.vgap;
          break;
        case Layout.BOTTOM:
          var ps = child.getPreferredSize();
          child.location(left, bottom - ps.height);
          child.resize(right - left, ps.height);
          bottom -= ps.height + this.vgap;
          break;
        case Layout.LEFT: west = child; break;
        case Layout.RIGHT: east = child; break;
        default: throw new Error("Invalid constraints: " + constraint);
      }
    }
  }

  if(east != undefined) {
    d = east.getPreferredSize();
    east.location(right - d.width, top);
    east.resize(d.width, bottom - top);
    right -= d.width + this.hgap;
  }

  if(west != undefined) {
    d = west.getPreferredSize();
    west.location(left, top);
    west.resize(d.width, bottom - top);
    left += d.width + this.hgap;
  }

  if(center != undefined) {
    center.location(left, top);
    center.resize(right - left, bottom - top);
  }
};

module.exports = BorderLayout;
