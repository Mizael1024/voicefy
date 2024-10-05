import { eq, and, desc } from "drizzle-orm";

class AuthActions {
  async findEmailVerificationCodeByUserId(userId) {
    try {
      const [existingCode] = await useDB()
        .select()
        .from(tables.emailVerificationCodes)
        .where(eq(tables.emailVerificationCodes.userId, userId));
      return existingCode || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async deleteEmailVerificationCode(id) {
    try {
      const record = await useDB()
        .delete(tables.emailVerificationCodes)
        .where(eq(tables.emailVerificationCodes.id, id))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to delete email verification code: ${error}`);
    }
  }

  async findPasswordResetToken(code) {
    try {
      const [existingToken] = await useDB()
        .select()
        .from(tables.passwordResetTokens)
        .where(eq(tables.passwordResetTokens.code, code));
      return existingToken || null;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find password reset token");
    }
  }

  async deletePasswordResetToken(id) {
    try {
      const record = await useDB()
        .delete(tables.passwordResetTokens)
        .where(eq(tables.passwordResetTokens.id, id))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to delete password reset token: ${error}`);
    }
  }

  async findOneTimePassword(code, type, identifier) {
    try {
      const [storedOtp] = await useDB()
        .select()
        .from(tables.oneTimePasswords)
        .where(
          and(
            eq(tables.oneTimePasswords.code, code),
            eq(tables.oneTimePasswords.type, type),
            eq(tables.oneTimePasswords.identifier, identifier),
          ),
        );
      return storedOtp || null;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to find one time password: ${error}`);
    }
  }

  async findOneTimePasswordByUserId(userId) {
    try {
      const [storedOtp] = await useDB()
        .select()
        .from(tables.oneTimePasswords)
        .where(eq(tables.oneTimePasswords.userId, userId));
      return storedOtp || null;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to find one time password: ${error}`);
    }
  }

  async deleteOneTimePassword(id) {
    try {
      const record = await useDB()
        .delete(tables.oneTimePasswords)
        .where(eq(tables.oneTimePasswords.id, id))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to delete one time password: ${error}`);
    }
  }

  async findEmailVerificationCode(code) {
    try {
      const [existingCode] = await useDB()
        .select()
        .from(tables.emailVerificationCodes)
        .where(eq(tables.emailVerificationCodes.code, code));
      return existingCode || null;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find verification code");
    }
  }

  async linkOAuthAccount(userId, providerId, providerUserId) {
    try {
      const record = await useDB()
        .insert(tables.oauthAccounts)
        .values({
          userId,
          providerId,
          providerUserId,
        })
        .onConflictDoNothing()
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to link OAuth account");
    }
  }

  async findLatestOneTimePasswordByEmail(email, type) {
    try {
      const [latestOtp] = await useDB()
        .select()
        .from(tables.oneTimePasswords)
        .where(
          and(
            eq(tables.oneTimePasswords.identifier, email),
            eq(tables.oneTimePasswords.type, type),
          ),
        )
        .orderBy(desc(tables.oneTimePasswords.expiresAt))
        .limit(1);
      return latestOtp || null;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to find latest one time password: ${error}`);
    }
  }
}

export const authActions = new AuthActions();
