import { userActions } from "~/server/services/db/UserActions";
import { sanitizeUser } from "~/server/utils/auth";
import { passkeyVerificationSchema } from "~/server/validations/users";
import { binaryToBase64url } from "~/server/utils/passkey-utils";

export default defineEventHandler(async (event) => {
  const { email, name, verification } = await readValidatedBody(event, (body) =>
    passkeyVerificationSchema.parse(body),
  );
  const { credentialID, credentialPublicKey } = verification.registrationInfo ?? {};
  if (credentialID == null || credentialPublicKey == null) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing passkey verification credentials",
    });
  }
  const user = await userActions.findUserByEmail(email);
  if (user) {
    throw createError({
      statusCode: 400,
      statusMessage: "User exists",
    });
  }
  const userRecord = await userActions.createUserWithPasskey({ email, name });

  // Convert the credentialPublicKey object to a Buffer
  const credentialPublicKeyBuffer = Buffer.from(Object.values(credentialPublicKey));

  // Use the binaryToBase64url function for credentialID
  const credentialIDBase64URL = await binaryToBase64url(credentialID);

  const credentialPayload = {
    userId: userRecord.id,
    name: userRecord.name,
    externalID: credentialIDBase64URL,
    publicKey: credentialPublicKeyBuffer,
  };

  if (userRecord.banned) {
    throw createError({
      statusCode: 403,
      statusMessage: "You account has been banned",
    });
  }

  await userActions.createPasskeyCredential(credentialPayload);
  const transformedUser = sanitizeUser(userRecord);
  await setUserSession(event, { user: transformedUser });
  return userRecord;
});
