import { verifyRegistrationResponse } from "@simplewebauthn/server";

export default defineEventHandler(async (event) => {
  const { expectedOrigin, expectedRPID } = useRuntimeConfig();
  const { credential, challenge } = await readBody(event);
  if (!credential) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing credential",
    });
  }

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: challenge,
    requireUserVerification: true,
    expectedOrigin,
    expectedRPID,
  });

  return verification;
});
