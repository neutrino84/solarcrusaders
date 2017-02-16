
// import polyfills first
import './polyfill';

// export lib
import * as extras from '../libs/pixi.js/src/extras';
import * as mesh from '../libs/pixi.js/src/mesh';
import * as particles from '../libs/pixi.js/src/particles';
import * as filters from '../libs/pixi.js/src/filters';

export * from '../libs/pixi.js/src/core';
export {
  extras,
  mesh,
  filters,
  particles
};
