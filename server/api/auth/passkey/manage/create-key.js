import { generateRegistrationOptions } from "@simplewebauthn/server";
import { userActions } from "~/server/services/db/UserActions";
import { generateChallenge } from "~/server/utils/passkey-utils";
const { expectedRPID } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { email, name } = user;

  const existingCredential = await userActions.findPasskeyCredentialByUserId(user.id);
  if (existingCredential && existingCredential.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "User already has a passkey",
    });
  }

  const challenge = await generateChallenge();
  const userIdUnit8Array = new TextEncoder().encode(email);

  const options = {
    challenge,
    rpName: "Supersaas",
    rpID: expectedRPID,
    userId: userIdUnit8Array,
    userName: email,
    userDisplayName: name,
    timeout: 60000,
    attestationType: "none",
    authenticatorSelection: { residentKey: "discouraged" },
    supportedAlgorithmIDs: [-7, -257],
  };

  const registrationOptions = await generateRegistrationOptions(options);
  setCookie(event, "challenge", registrationOptions.challenge);
  return registrationOptions;
});
