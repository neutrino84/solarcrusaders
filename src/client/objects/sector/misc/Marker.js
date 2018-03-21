
var engine = require('engine'),
    Movement = require('../Movement'),
    MarkerSelector = require('./MarkerSelector');

function Marker(manager, data) {

  engine.Sprite.call(this, manager.game, 'texture-atlas','squad-shield_upright.png')
  // .call(this, manager.game, 'texture-atlas','squad-shield_upright.png');

  this.manager = manager;
  this.data = data;
  this.selector = new MarkerSelector(this);
  this.movement = new Movement(this);

  // timer events
  this.events = new engine.Timer(this.game, false);
};

Marker.prototype = Object.create(engine.Sprite.prototype);
Marker.prototype.constructor = Marker;

Marker.prototype.boot = function() {
  this.selector.create();
};

module.exports = Marker;
