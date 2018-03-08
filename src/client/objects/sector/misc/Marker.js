
var engine = require('engine'),
    MarkerSelector = require('./MarkerSelector');

function Marker(manager, data) {

  engine.Sprite.call(this, manager.game, 'texture-atlas','squad-shield_upright.png')
  // .call(this, manager.game, 'texture-atlas','squad-shield_upright.png');

  this.manager = manager;
  this.data = data;
  // layer chassis
  // this.chassis = new engine.Sprite.call(this, manager.game, 'texture-atlas','squad-shield_upright.png');

  this.selector = new MarkerSelector(this);

  // timer events
  this.events = new engine.Timer(this.game, false);
};

Marker.prototype = Object.create(engine.Sprite.prototype);
Marker.prototype.constructor = Marker;

Marker.prototype.boot = function() {
  this.selector.create();
};

module.exports = Marker;
