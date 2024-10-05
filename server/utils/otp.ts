/**
 * Checks if a OTP has expired.
 *
 * @param expiresAt - The otp expiresAt to check.
 * @returns True if the expiresAt has not expired, false otherwise.
 */
export function isWithinExpiryDate(expiresAt: number): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime < expiresAt;
}
