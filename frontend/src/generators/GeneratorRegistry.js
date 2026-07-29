import { BaseGenerator } from './BaseGenerator';

/**
 * GeneratorRegistry — singleton lookup table of stack generators (mern,
 * and future stacks). Generators self-register (see generators/index.js)
 * so callers just do GeneratorRegistry.get('mern').
 */
class GeneratorRegistry {
  constructor() {
    this._generators = new Map();
  }

  register(generator) {
    if (!(generator instanceof BaseGenerator)) {
      throw new Error('GeneratorRegistry.register() expects a BaseGenerator instance');
    }
    if (!generator.id) {
      throw new Error('Generator must have an id before it can be registered');
    }
    this._generators.set(generator.id, generator);
    return generator;
  }

  get(id) {
    const generator = this._generators.get(id);
    if (!generator) {
      throw new Error(`No generator registered for id "${id}"`);
    }
    return generator;
  }

  has(id) {
    return this._generators.has(id);
  }

  list() {
    return Array.from(this._generators.keys());
  }
}

export default new GeneratorRegistry();
