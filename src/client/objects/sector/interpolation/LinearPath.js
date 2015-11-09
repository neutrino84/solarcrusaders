
var engine = require('engine');

function LinearPath(movement, start, end, easing) {
  if(start === undefined) { start = 0; }
  if(end === undefined) { end = 1; }
  if(easing === undefined) { easing = engine.Easing.Default; }

  this.duration = movement.linearLength * movement.linearSpeed * (end - start);

  if(easing !== engine.Easing.Default) {
    this.duration *= 2;
  }
  
  this.start = 0 + (movement.linearLength * start);
  this.end = movement.linearLength - (movement.linearLength * (1 - end));

  this.easing = easing;
};

LinearPath.prototype.constructor = LinearPath;

LinearPath.prototype.interpolate = function(movement, distance) {
  return engine.Line.pointAtDistance(movement.tangentPoint, movement.destination, distance);
};

module.exports = LinearPath;
