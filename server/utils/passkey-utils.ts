import { getRandomValues } from "uncrypto";

export async function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function generateChallenge(): Promise<string> {
  const buffer = new Uint8Array(32);
  getRandomValues(buffer);
  return binaryToBase64url(buffer);
}

export async function binaryToBase64url(
  input: Uint8Array | string | ArrayBuffer | { [key: string]: number },
): Promise<string> {
  let base64: string;

  if (input instanceof Uint8Array) {
    base64 = Buffer.from(input).toString("base64");
  } else if (typeof input === "string") {
    base64 = input;
  } else if (input instanceof ArrayBuffer) {
    base64 = Buffer.from(new Uint8Array(input)).toString("base64");
  } else if (typeof input === "object") {
    const values = Object.values(input);
    if (values.every((value) => typeof value === "number")) {
      base64 = Buffer.from(new Uint8Array(values)).toString("base64");
    } else {
      throw new Error("Object must contain only number values");
    }
  } else {
    throw new Error(
      "Input must be Uint8Array, string, ArrayBuffer, or an object with number values",
    );
  }

  return clean(base64);
}
