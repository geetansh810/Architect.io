import { analyzeArchitecture } from './architectureAnalyzer.js';
import GeneratorRegistry from '../generators/index.js';

/**
 * codeSync — bridges the canvas graph and the generated file tree for the
 * Monaco split-pane editor.
 *
 * GeneratorRegistry holds a *singleton* MERNGenerator, and CodePreview.jsx
 * (the existing Preview modal) also calls .generate() on it. If that modal
 * and this editor panel are both live, whichever calls .generate() last
 * would silently overwrite the other's node<->file map on the shared
 * instance. So node/file ownership is snapshotted into plain Maps right
 * after generation instead of reading it lazily off the generator later.
 */
export function buildProjectFiles(nodes, edges, projectConfig = {}) {
  const analysis = analyzeArchitecture(nodes, edges);
  const generator = GeneratorRegistry.get('mern');
  const files = generator.generate(analysis, projectConfig);

  const nodeFileMap = new Map();
  nodes.forEach((node) => {
    const paths = generator.getFileForNode(node.id);
    if (paths.length) nodeFileMap.set(node.id, paths);
  });

  // Built from the generator's own reverse map rather than by inverting
  // nodeFileMap: several nodes legitimately point at one file (an entity and
  // the API exposing it both reach the routes file), and inverting would let
  // whichever node happened to come last in `nodes` steal ownership.
  const fileNodeMap = new Map();
  files.forEach(({ path }) => {
    const owner = generator.getNodeForFile(path);
    if (owner) fileNodeMap.set(path, owner);
  });

  return { files, nodeFileMap, fileNodeMap };
}

/** First file a node owns, i.e. the one to jump to when it's clicked. */
export function getPrimaryFileForNode(nodeFileMap, nodeId) {
  return nodeFileMap.get(nodeId)?.[0] || null;
}

/** The node that owns a given generated file path, if any. */
export function getNodeForFile(fileNodeMap, filePath) {
  return fileNodeMap.get(filePath) || null;
}

/**
 * Files assembled from a node's own `data.code` (Logic Hook entity files,
 * Custom middleware files) aren't directly editable in the read-only
 * Monaco viewer — this points users back to the node that actually owns
 * the code, which stays the single source of truth (see IMPLEMENTATION_PLAN.md's
 * "Code persistence: data.code on the node" decision).
 */
export function describeCodeSource(filePath) {
  if (/\.hooks\.(js|ts)$/.test(filePath)) {
    return 'Assembled from the Logic Hook nodes on this entity — select one on the canvas to edit its code.';
  }
  if (filePath.startsWith('src/middleware/custom/')) {
    return 'Written on a Custom Middleware node — select it on the canvas to edit its code.';
  }
  return null;
}
