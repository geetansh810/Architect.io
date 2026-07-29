import { toPascalCase } from '../utils/naming.js';
import { isTS } from '../utils/lang.js';
import { logicNodesForEntity, indentBlock } from '../utils/graph.js';

const HOOK_NAMES = ['beforeCreate', 'afterCreate', 'beforeUpdate', 'afterUpdate', 'beforeDelete', 'afterDelete'];

/**
 * HookEmitter — src/modules/{entity}/{entity}.hooks.js
 * Lifecycle hooks the service layer calls around create/update/delete.
 * Default bodies are pass-throughs; code typed into a LogicNode's
 * `data.code` on the canvas is injected verbatim into the matching hook.
 */
export function emitHookFile(entity, analysis, language = 'javascript') {
  const ts = isTS(language);
  const pascalName = toPascalCase(entity.data?.name || entity.id);
  const logicNodes = logicNodesForEntity(entity, analysis);

  const hookBodies = HOOK_NAMES.map((hookName) => {
    const param = hookName.startsWith('before') ? 'payload' : 'entity';
    // Several Logic Hooks can share one lifecycle slot; they're emitted in
    // canvas order into the same body rather than silently dropping all but
    // the first, with a header naming which node each block came from.
    const authored = logicNodes
      .filter((n) => toHookKey(n.data?.hook) === hookName && n.data?.code?.trim())
      .map((n) => `    // ── ${n.data?.name || 'Logic Hook'} ──\n${indentBlock(n.data.code, 4)}`);

    const body = authored.length ? authored.join('\n\n') : `    return ${param};`;
    return `  async ${hookName}(${param}${ts ? ': any' : ''})${ts ? ': Promise<any>' : ''} {
${body}
  }`;
  }).join(',\n\n');

  return `${ts ? '/**\n * Hook bodies can be edited freely on the canvas (LogicNode), so params\n * and return values are intentionally typed `any` here rather than the\n * entity\'s strict interface — arbitrary user code can\'t be guaranteed to\n * satisfy it, and the service layer treats whatever comes back as opaque.\n */\n' : ''}/**
 * Lifecycle hooks for ${pascalName}. Called by ${pascalName}Service around
 * repository writes. Edit the bodies below (or write the equivalent Logic
 * Node on the canvas) to add validation, side effects, or data shaping.
 */
export const ${pascalName}Hooks = {
${hookBodies},
};

export default ${pascalName}Hooks;
`;
}

function toHookKey(hook) {
  if (!hook) return null;
  return hook.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
