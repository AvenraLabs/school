/**
 * Formats any date input into strict DD/MM/YY format (e.g., 24/07/26).
 */
export function formatDate(input) {
  if (!input) return "";
  
  // If input is YYYY-MM-DD string, parse directly to avoid timezone shift
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [yyyy, mm, dd] = input.split("-");
    return `${dd}/${mm}/${yyyy.slice(-2)}`;
  }

  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
}
