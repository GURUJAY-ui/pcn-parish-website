import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/lib/tokens";
import { logger } from "@/lib/logger";

export interface AuthRequest extends Request {
  adminId?: number;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Unauthorized access attempt", {
      ip: req.ip,
      path: req.path,
      userAgent: req.headers["user-agent"],
    });
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const { adminId } = verifyAccessToken(token);
    req.adminId = adminId;
    next();
  } catch (err: any) {
    logger.warn("Invalid token used", {
      ip: req.ip,
      path: req.path,
      error: err.message,
    });
    res.status(401).json({ error: "Invalid or expired token" });
  }
}