/**
 * Graph traversal helpers shared by the emitters and the generator's
 * node<->file map.
 *
 * Logic Hook nodes are *not* wired straight to an entity — connectionRules
 * only allows `entity -> api -> logic` (and the reverse `logic -> entity`
 * "Mutates entity" edge). Anything that needs "which hooks belong to this
 * entity" has to walk that two-hop path, so it lives here once instead of
 * being re-derived (and previously mis-derived) per emitter.
 */

/** Logic nodes that fire on a given entity's lifecycle, in canvas order. */
export function logicNodesForEntity(entity, analysis) {
  const apiIds = analysis.entityApiMap?.[entity.id] || [];
  const viaApi = new Set(apiIds.flatMap((apiId) => analysis.apiLogicMap?.[apiId] || []));

  // A `logic -> entity` edge ("Mutates entity") is the other legal way to
  // say a hook belongs to this entity.
  (analysis.incoming?.[entity.id] || []).forEach((sourceId) => {
    if ((analysis.logicNodes || []).some((n) => n.id === sourceId)) viaApi.add(sourceId);
  });

  return (analysis.logicNodes || []).filter((n) => viaApi.has(n.id));
}

/** Reverse of entityApiMap: apiNodeId -> [entityNode]. */
export function entitiesForApi(apiId, analysis) {
  return (analysis.entities || []).filter((e) =>
    (analysis.entityApiMap?.[e.id] || []).includes(apiId)
  );
}

/** Entities whose lifecycle a given logic node participates in. */
export function entitiesForLogicNode(logicId, analysis) {
  return (analysis.entities || []).filter((e) =>
    logicNodesForEntity(e, analysis).some((n) => n.id === logicId)
  );
}

/** Re-indents a user-authored code block to `spaces`, preserving relative depth. */
export function indentBlock(code, spaces = 4) {
  const lines = code.replace(/\t/g, '  ').split('\n');
  const meaningful = lines.filter((l) => l.trim());
  if (!meaningful.length) return '';
  const base = Math.min(...meaningful.map((l) => l.match(/^ */)[0].length));
  const pad = ' '.repeat(spaces);
  return lines
    .map((l) => (l.trim() ? pad + l.slice(base) : ''))
    .join('\n')
    .replace(/\s+$/, '');
}
