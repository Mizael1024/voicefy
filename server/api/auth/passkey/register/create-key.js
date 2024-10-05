import { generateRegistrationOptions } from "@simplewebauthn/server";
import { userActions } from "~/server/services/db/UserActions";
import { generateChallenge } from "~/server/utils/passkey-utils";
import { passkeyVerificationSchema } from "~/server/validations/users";
const { expectedRPID } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { email, name } = await readValidatedBody(event, (body) =>
    passkeyVerificationSchema.parse(body),
  );
  const user = await userActions.findUserByEmail(email);
  if (user) {
    throw createError({
      statusCode: 400,
      statusMessage: "User exists",
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
  return registrationOptions;
});
