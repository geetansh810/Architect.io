/**
 * Name-based heuristics for entity fields, shared by ModelEmitter,
 * ValidationEmitter, and ServerEmitter (dependency selection) so a field
 * named "email" or "password" gets consistent treatment everywhere.
 */
export function isEmailField(field) {
  return /email/i.test(field.name);
}

export function isPasswordField(field) {
  return /password/i.test(field.name);
}

export function hasPasswordField(fields = []) {
  return fields.some(isPasswordField);
}
