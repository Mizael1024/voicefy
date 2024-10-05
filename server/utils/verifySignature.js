function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a[i] ^ b[i];
  }
  return mismatch === 0;
}

function hexToUint8Array(hexString) {
  return new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

export async function verifySignature(requestRawBody, receivedHexSignature, secret) {
  const receivedSignature = hexToUint8Array(receivedHexSignature);
  const encoder = new TextEncoder();
  const encodedSecret = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    encodedSecret,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign", "verify"],
  );
  const signatureArrayBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(requestRawBody),
  );

  const calculatedSignature = new Uint8Array(signatureArrayBuffer);

  return timingSafeEqual(calculatedSignature, receivedSignature);
}
