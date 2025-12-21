import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;

// Default key for development - in production, set ENCRYPTION_SECRET env var
const DEFAULT_DEV_SECRET = "track4u-dev-secret-change-in-prod";

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || DEFAULT_DEV_SECRET;
  
  if (!process.env.ENCRYPTION_SECRET) {
    console.warn("⚠️ Using default encryption key. Set ENCRYPTION_SECRET in production.");
  }
  
  // Use a fixed salt derived from the secret for consistent key derivation
  const salt = scryptSync(secret, "track4u-salt", SALT_LENGTH);
  return scryptSync(secret, salt, KEY_LENGTH);
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  
  const [ivHex, authTagHex, encryptedData] = ciphertext.split(":");
  
  if (!ivHex || !authTagHex || !encryptedData) {
    throw new Error("Invalid encrypted data format");
  }
  
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "****";
  return `sk-...${key.slice(-4)}`;
}

export function validateApiKeyFormat(key: string): boolean {
  // OpenAI keys start with "sk-" and vary in format:
  // - Legacy: sk-xxxxxxxx (51 chars)
  // - Project: sk-proj-xxxxxxxx (longer)
  // - Service: sk-svcacct-xxxxxxxx
  // Allow any key starting with sk- and at least 20 chars total
  if (!key || typeof key !== "string") return false;
  return key.startsWith("sk-") && key.length >= 20;
}

