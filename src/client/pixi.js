
// import polyfills first
import './polyfill';

// export lib
import * as extras from '../libs/pixi.js/src/extras';
import * as mesh from '../libs/pixi.js/src/mesh';
import * as particles from '../libs/pixi.js/src/particles';
import * as extract from '../libs/pixi.js/src/extract';
import * as prepare from '../libs/pixi.js/src/prepare';

export * from '../libs/pixi.js/src/core';
export {
  extras,
  extract,
  mesh,
  particles,
  prepare
};
