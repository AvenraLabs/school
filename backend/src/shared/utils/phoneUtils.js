/**
 * Sanitizes a phone number to only contain the last 10 digits.
 * Useful for standardizing Indian mobile number storage.
 */
export const cleanTo10Digits = (phone) => {
  if (!phone || typeof phone !== "string") return phone;
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 ? cleaned.slice(-10) : cleaned;
};
