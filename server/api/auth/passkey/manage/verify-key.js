import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { userActions } from "~/server/services/db/UserActions";
import { binaryToBase64url } from "~/server/utils/passkey-utils";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { credential } = await readBody(event);
  const challenge = getCookie(event, "challenge");

  if (!credential) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing credential",
    });
  }

  const { expectedOrigin, expectedRPID } = useRuntimeConfig();

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: challenge,
    requireUserVerification: true,
    expectedOrigin,
    expectedRPID,
  });

  if (verification.verified) {
    const { credentialID, credentialPublicKey } = verification.registrationInfo;
    const credentialIDBase64URL = await binaryToBase64url(credentialID);
    const credentialPublicKeyBuffer = Buffer.from(Object.values(credentialPublicKey));

    const credentialPayload = {
      userId: user.id,
      name: user.name,
      externalID: credentialIDBase64URL,
      publicKey: credentialPublicKeyBuffer,
    };

    await userActions.createPasskeyCredential(credentialPayload);
  }

  return verification;
});
