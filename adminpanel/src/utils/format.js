/**
 * Standardize teacher employee ID display (pass-through clean backend ID e.g. T00016)
 */
export function formatEmployeeId(rawId) {
  if (!rawId) return '—';
  return String(rawId).trim();
}

/**
 * Standardize student ID / username display (pass-through clean backend ID e.g. S00001)
 */
export function formatStudentId(rawId) {
  if (!rawId) return '—';
  return String(rawId).trim();
}
