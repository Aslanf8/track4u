import { SignJWT, importPKCS8 } from "jose";
import * as dotenv from "dotenv";

dotenv.config();

async function generateAppleSecret() {
  const teamId = process.env.APPLE_TEAM_ID;
  const clientId = process.env.APPLE_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY;

  if (!teamId || !clientId || !keyId || !privateKey) {
    console.error("Missing Apple OAuth configuration:");
    console.error("APPLE_TEAM_ID:", !!teamId);
    console.error("APPLE_ID:", !!clientId);
    console.error("APPLE_KEY_ID:", !!keyId);
    console.error("APPLE_PRIVATE_KEY:", !!privateKey);
    process.exit(1);
  }

  try {
    const formattedKey = privateKey.replace(/\\n/g, "\n");
    const key = await importPKCS8(formattedKey, "ES256");

    const expiresIn = 180 * 24 * 60 * 60; // 180 days
    const expiryTime = Math.floor(Date.now() / 1000) + expiresIn;

    const secret = await new SignJWT({})
      .setAudience("https://appleid.apple.com")
      .setIssuer(teamId)
      .setIssuedAt()
      .setExpirationTime(expiryTime)
      .setSubject(clientId)
      .setProtectedHeader({ alg: "ES256", kid: keyId })
      .sign(key);

    console.log("\n✅ Apple Client Secret generated successfully!\n");
    console.log("Add this to your .env file:\n");
    console.log(`APPLE_SECRET=${secret}`);
    console.log("\n⚠️  This secret expires in 180 days. Regenerate before:", new Date(expiryTime * 1000).toISOString());
  } catch (error) {
    console.error("Failed to generate Apple secret:", error);
    process.exit(1);
  }
}

generateAppleSecret();

