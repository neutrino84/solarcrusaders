
import mesh from '../libs/pixi.js/src/mesh';
import particles from '../libs/pixi.js/src/particles';
import extract from '../libs/pixi.js/src/extract';
import prepare from '../libs/pixi.js/src/prepare';
import core from '../libs/pixi.js/src/core';

// run the polyfills
require('./polyfill');

// sc pixi shims
core.TRANSFORM_MODE.DEFAULT = 1;

// add core plugins
module.exports = Object.assign(core, {
  extract,
  mesh,
  particles,
  prepare
});
