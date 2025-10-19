import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import "dotenv/config"; // loads .env automatically

// 1️⃣ Get password from environment
const password = process.env.ENCRYPTION_PASSWORD;

if (!password) {
  console.error("❌ ENCRYPTION_PASSWORD not found in environment variables");
  process.exit(1);
}

// 2️⃣ Paths
const encryptedFile = path.resolve("firebaseServiceAccount.json.encrypted");
const decryptedFile = path.resolve("firebaseServiceAccount.json");

// 3️⃣ Check if encrypted file exists
if (!fs.existsSync(encryptedFile)) {
  console.error(`❌ Encrypted file not found at: ${encryptedFile}`);
  process.exit(1);
}

try {
  console.log("🔐 Decrypting file using ENCRYPTION_PASSWORD from environment...");

  execSync(
    `openssl aes-256-cbc -d -pbkdf2 -in "${encryptedFile}" -out "${decryptedFile}" -k "${password}"`,
    { stdio: "inherit" },
  );

  console.log(`✅ File decrypted successfully to: ${decryptedFile}`);
} catch (err) {
  console.error("❌ Decryption failed:", err);
  process.exit(1);
}
