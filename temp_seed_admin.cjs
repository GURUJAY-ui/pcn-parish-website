const crypto = require("crypto");

const password = "YourStrongPassword123!";
const salt = "pcnadmin";
const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");

console.log(hash);
