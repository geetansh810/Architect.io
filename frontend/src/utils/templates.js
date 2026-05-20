import { ARCHITECTURE_TEMPLATES } from '../constants/templates';

export const templates = ARCHITECTURE_TEMPLATES.map((t) => ({
  name: t.name,
  slug: t.id,
  desc: t.description,
  architecture: {
    nodes: t.nodes,
    edges: t.edges,
    documentation: t.documentation || `# ${t.name}\n\n${t.description}`
  }
}));

export default templates;
