import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { userActions } from "~/server/services/db/UserActions";
import { emailVerificationSchema } from "~/server/validations/users";
const { expectedRPID } = useRuntimeConfig();

async function generateAuthenticationOptionsStep(usersCredentials) {
  const loginOptionsParameters = {
    timeout: 60000,
    allowCredentials: await Promise.all(
      usersCredentials.map(async (userCredential) => ({
        id: userCredential.externalID,
        type: "public-key",
      })),
    ),
    userVerification: "required",
    rpID: expectedRPID,
  };
  const authenticationOptionsJSON = await generateAuthenticationOptions(loginOptionsParameters);
  return authenticationOptionsJSON;
}

export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(event, (body) => emailVerificationSchema.parse(body));
  const user = await userActions.findUserByEmail(email);
  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "User not found",
    });
  }
  const usersCredentials = await userActions.findPasskeyCredentialByUserId(user.id);
  if (!usersCredentials) {
    throw createError({
      statusCode: 400,
      statusMessage: "User has not registered with passkey",
    });
  }
  const authenticationOptionsJSON = await generateAuthenticationOptionsStep(usersCredentials);
  setCookie(event, "challenge", authenticationOptionsJSON.challenge);
  return authenticationOptionsJSON;
});
