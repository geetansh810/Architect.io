/**
 * BaseGenerator — abstract contract every stack generator (MERN, future
 * stacks) must implement. GeneratorRegistry only accepts instances of this
 * class (or subclasses), so codeGenerator.js can dispatch to any registered
 * generator without knowing its internals.
 */
export class BaseGenerator {
  constructor(id) {
    if (new.target === BaseGenerator) {
      throw new Error('BaseGenerator is abstract and cannot be instantiated directly');
    }
    this.id = id;
  }

  /**
   * @param {object} analysis - output of architectureAnalyzer.analyzeArchitecture()
   * @param {object} projectConfig - global project settings (language, validation, auth, docs...)
   * @param {object} customCodeMap - nodeId -> user-authored code injected into generated output
   * @returns {Array<{path: string, content: string, language: string}>}
   */
  generate(_analysis, _projectConfig = {}, _customCodeMap = {}) {
    throw new Error(`${this.constructor.name} must implement generate()`);
  }

  /** @returns {string[]} file paths produced for a given canvas node id */
  getFileForNode(_nodeId) {
    throw new Error(`${this.constructor.name} must implement getFileForNode()`);
  }

  /** @returns {string|null} the canvas node id that owns a given file path */
  getNodeForFile(_filePath) {
    throw new Error(`${this.constructor.name} must implement getNodeForFile()`);
  }
}

export default BaseGenerator;
