import GeneratorRegistry from './GeneratorRegistry.js';
import { MERNGenerator } from './mern/MERNGenerator.js';

if (!GeneratorRegistry.has('mern')) {
  GeneratorRegistry.register(new MERNGenerator());
}

export { GeneratorRegistry };
export default GeneratorRegistry;
