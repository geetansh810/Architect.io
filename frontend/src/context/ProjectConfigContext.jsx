import { useArchitecture } from './ArchitectureContext';

/**
 * useProjectConfig — dedicated hook for project-level generation settings
 * (validation library, docs, API versioning, ...).
 *
 * There's no separate Provider here on purpose: the settings live inside
 * ArchitectureContext's own state so they ride its existing, already-
 * tested autosave effect (the same one nodes/edges/documentation use) and
 * land in the same `architecture_json` document on save — a second
 * competing save path would risk losing whichever context wrote last.
 */
export function useProjectConfig() {
  const { projectConfig, updateProjectConfig } = useArchitecture();
  return { config: projectConfig, updateConfig: updateProjectConfig };
}
