import jwt from "jsonwebtoken";

// In-memory blacklist (replace with Redis in production for multi-instance)
const blacklistedTokens = new Set<string>();

export function generateTokens(adminId: number) {
  const accessToken = jwt.sign(
    { adminId, type: "access" },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" } // short-lived access token
  );

  const refreshToken = jwt.sign(
    { adminId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

export function blacklistToken(token: string) {
  blacklistedTokens.add(token);
  // Auto-clean expired tokens every hour
  setTimeout(() => blacklistedTokens.delete(token), 7 * 24 * 60 * 60 * 1000);
}

export function isBlacklisted(token: string): boolean {
  return blacklistedTokens.has(token);
}

export function verifyAccessToken(token: string): { adminId: number } {
  if (isBlacklisted(token)) throw new Error("Token revoked");
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  if (decoded.type !== "access") throw new Error("Invalid token type");
  return { adminId: decoded.adminId };
}

export function verifyRefreshToken(token: string): { adminId: number } {
  if (isBlacklisted(token)) throw new Error("Token revoked");
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
  if (decoded.type !== "refresh") throw new Error("Invalid token type");
  return { adminId: decoded.adminId };
}