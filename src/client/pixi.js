
// import polyfills first
import './polyfill';

// export lib
import * as extras from '../../node_modules/pixi.js/lib/extras';
import * as mesh from '../../node_modules/pixi.js/lib/mesh';
import * as particles from '../../node_modules/pixi.js/lib/particles';
import * as filters from '../../node_modules/pixi.js/lib/filters';

export * from '../../node_modules/pixi.js/lib/core';
export {
  extras,
  mesh,
  filters,
  particles
};
