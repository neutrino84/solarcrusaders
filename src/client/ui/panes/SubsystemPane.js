
var engine = require('engine'),
    Layout = require('../Layout'),
    ContentPane = require('./ContentPane'),
    Class = engine.Class;

function SubsystemPane(game, settings) {
  ContentPane.call(this, game, 'subsystems',
    Class.mixin(settings, {
      padding: [1],
      border: [0],
      width: 96,
      height: 32,
      button: {
        label: {
          padding: [2]
        }
      }
    })
  );
};

SubsystemPane.prototype = Object.create(ContentPane.prototype);
SubsystemPane.prototype.constructor = SubsystemPane;

module.exports = SubsystemPane;
