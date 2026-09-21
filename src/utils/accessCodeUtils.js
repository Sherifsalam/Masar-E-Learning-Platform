const crypto = require("crypto");

// I, L, O, U and 0, 1 are left out: they are the characters people misread
// when copying a code off a printed receipt.
const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
const GROUP = 4;
const GROUPS = 2;

/**
 * Builds a code like "7K3Q-M9DP".
 *
 * crypto.randomInt is unbiased across the alphabet, unlike Math.random scaled
 * by length — worth it here because these codes are sold.
 */
function generateCode() {
  const chars = [];
  for (let i = 0; i < GROUP * GROUPS; i += 1) {
    chars.push(ALPHABET[crypto.randomInt(ALPHABET.length)]);
  }
  const groups = [];
  for (let i = 0; i < GROUPS; i += 1) {
    groups.push(chars.slice(i * GROUP, (i + 1) * GROUP).join(""));
  }
  return groups.join("-");
}

/**
 * Accepts whatever the student typed and returns the canonical form.
 * Lowercase, missing dash and stray spaces all normalise to the stored value.
 */
function normalizeCode(input) {
  const cleaned = String(input || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (cleaned.length !== GROUP * GROUPS) return cleaned;

  const groups = [];
  for (let i = 0; i < GROUPS; i += 1) {
    groups.push(cleaned.slice(i * GROUP, (i + 1) * GROUP));
  }
  return groups.join("-");
}

module.exports = { generateCode, normalizeCode };
