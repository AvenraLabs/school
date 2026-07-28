/**
 * Formats any date input into strict DD/MM/YYYY format (e.g., 24/07/2026).
 */
export function formatDate(input) {
  if (!input) return "";

  // If input is YYYY-MM-DD string, parse directly to avoid timezone shift
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [yyyy, mm, dd] = input.split("-");
    return `${dd}/${mm}/${yyyy}`;
  }

  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formats date and time into DD/MM/YYYY, hh:mm AM/PM format (e.g., 24/07/2026, 10:30 AM).
 */
export function formatDateTime(input) {
  if (!input) return "";
  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input);

  const datePart = formatDate(d);
  const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return `${datePart}, ${timePart}`;
}

