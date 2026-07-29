export function toKebabCase(str) {
  return str?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'service';
}

export function toCamelCase(str) {
  return str?.replace(/[-\s](.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toLowerCase()) || 'service';
}

export function toPascalCase(str) {
  return str?.replace(/[-\s](.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase()) || 'Service';
}
