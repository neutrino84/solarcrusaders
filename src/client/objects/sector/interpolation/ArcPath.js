
var engine = require('engine');

function ArcPath(movement, start, end, easing) {
  if(start === undefined) { start = 0; }
  if(end === undefined) { end = 1; }
  if(easing === undefined) { easing = engine.Easing.Default; }

  this.duration = movement.arcLength * movement.linearSpeed * (end - start);

  if(easing !== engine.Easing.Default) {
    this.duration *= 2;
  }

  this.start = this.getStartAngle(movement, start);
  this.end = this.getEndAngle(movement, end);

  this.easing = easing;
};

ArcPath.prototype.constructor = ArcPath;

ArcPath.prototype.interpolate = function(movement, angle) {
  return movement.oribital.circumferencePoint(angle);
};

ArcPath.prototype.getStartAngle = function(movement, start) {
  var startAngle;
  if(movement.anticlockwise && movement.startAngle <= movement.endAngle) {
    startAngle = (movement.arcLength * start) / movement.oribital.radius;
    return movement.startAngle + global.Math.PI * 2 - startAngle;
  } else {
    startAngle = (movement.arcLength * start) / movement.oribital.radius * (movement.anticlockwise ? -1 : 1);
  	return movement.startAngle + startAngle;
  }
};

ArcPath.prototype.getEndAngle = function(movement, end) {
  var endAngle;
  if(!movement.anticlockwise && movement.endAngle <= movement.startAngle) {
    endAngle = (movement.arcLength * (1 - end)) / movement.oribital.radius;
    return movement.endAngle + global.Math.PI * 2 - endAngle;
  } else {
    endAngle = (movement.arcLength * (1 - end)) / movement.oribital.radius * (movement.anticlockwise ? -1 : 1);
    return movement.endAngle - endAngle;
  }
};

module.exports = ArcPath;
