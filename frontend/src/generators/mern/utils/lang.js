/**
 * Shared helpers for the JS/TypeScript dual-emit. Every emitter that
 * branches on `language` uses these so the extension/import-suffix
 * decision (and the JS-only trailing `.js` in relative imports, required
 * by real Node ESM but dropped in the TS output, which is run through
 * tsx/tsc's bundler-style module resolution) lives in exactly one place.
 */
export function isTS(language) {
  return language === 'typescript';
}

export function fileExt(language) {
  return isTS(language) ? 'ts' : 'js';
}

/** Turns a relative import specifier without extension (e.g. './user.model') into the right one for `language`. */
export function imp(language, path) {
  return isTS(language) ? path : `${path}.js`;
}
