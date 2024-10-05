import { seal, unseal, defaults as sealDefaults } from "iron-webcrypto";
import uncrypto from "uncrypto";

/**
 * Generates a random salt.
 *
 * @returns {string} A random salt.
 */
function generateSalt(): string {
  const array = new Uint8Array(16);
  uncrypto.getRandomValues(array);
  return Array.from(array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hashes a password using the seal method from iron-webcrypto.
 *
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} The hashed password in a sealed format.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();

  // Seal the password with the salt
  const sealedPassword = await seal(uncrypto, password, salt, sealDefaults);

  return `$iron:${salt}:${sealedPassword}`;
}

/**
 * Verifies a password against a stored hash using the unseal method from iron-webcrypto.
 *
 * @param {string} storedHash - The stored hashed password.
 * @param {string} passwordAttempt - The password attempt to verify.
 * @returns {Promise<boolean>} True if the password is correct, false otherwise.
 */
export async function verifyPassword(
  storedHash: string,
  passwordAttempt: string,
): Promise<boolean> {
  const parts = storedHash.split(":");
  const salt = parts[1];
  const sealedContent = parts[2];

  try {
    // Unseal the stored hash with the password attempt
    const unsealedPassword = await unseal(uncrypto, sealedContent, salt, sealDefaults);

    // If the unsealing is successful and matches the password attempt, the password is correct
    return unsealedPassword === passwordAttempt;
  } catch (err) {
    // If unsealing fails, the password attempt is incorrect
    return false;
  }
}
