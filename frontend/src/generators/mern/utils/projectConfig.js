/**
 * Shared default project settings — imported by both ArchitectureContext
 * (React state / persistence) and MERNGenerator (plain JS, no React
 * dependency), so the two never drift apart.
 *
 * `auth` is surfaced in the UI but not yet implemented by the generator —
 * Passport strategies are a later milestone — so it's pinned to its only
 * working value for now. `language` supports both 'javascript' and
 * 'typescript' (Phase 1 Step 6, dual-emit).
 */
export const DEFAULT_PROJECT_CONFIG = {
  language: 'javascript',
  validation: 'zod',
  auth: 'jwt',
  docs: 'swagger',
  apiVersioning: true,
};
