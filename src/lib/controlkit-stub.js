/**
 * The real `controlkit` package throws during module evaluation when bundled
 * ("NumberInput_Internal is not defined"). Shery only ever instantiates it
 * behind `opts.debug`, which we never enable, so this chainable no-op stands
 * in for it and keeps the dependency out of the bundle entirely.
 */
const chainable = new Proxy(function () {}, {
  get: () => chainable,
  apply: () => chainable,
  construct: () => chainable,
});

export default class ControlKit {
  constructor() {
    return chainable;
  }
}
