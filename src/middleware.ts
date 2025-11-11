import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { users } from "./db/user.entity";
import { db } from "./db";
import { eq } from "drizzle-orm";

export type RequestWithUser = Request & {
  user: any;
};

export type AuthenticatedRequestHandler = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Type guard to check if request has user property (i.e., passed through auth middleware)
 */
export const isAuthenticatedRequest = (
  req: Request
): req is RequestWithUser => {
  return "user" in req && req.user !== undefined;
};

/**
 * Safely gets the user from an authenticated request
 * Throws an error if the request hasn't passed through auth middleware
 */
export const getAuthenticatedUser = (req: Request) => {
  if (!isAuthenticatedRequest(req)) {
    throw new Error(
      "Request has not been authenticated. Make sure authMiddleware is applied."
    );
  }
  return req.user;
};

/**
 * Sends a standardized unauthorized response
 */
const sendUnauthorizedResponse = (res: Response, message = "Unauthorized") => {
  return res.status(401).json({ message });
};

/**
 * Extracts and validates the Bearer token from the Authorization header
 */
const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;

  // Handle both "Bearer token" and direct token formats
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return token || null;
};

/**
 * Verifies JWT token and returns decoded payload
 */
const verifyToken = (token: string): jwt.JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return typeof decoded === "object" && decoded !== null ? decoded : null;
  } catch (error) {
    return null;
  }
};

/**
 * Fetches user from database by ID
 */
const fetchUserById = async (userId: string) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Return the actual user object or null
    const userData = user.length > 0 ? user[0] : null;
    return userData;
  } catch (error) {
    console.error("Database error while fetching user:", error);
    return null;
  }
};

/**
 * Authentication middleware that validates JWT tokens and attaches user to request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const requestId = Math.random().toString(36).substring(7);

  //Check if is content-type application/json
  if (req.headers["content-type"] !== "application/json") {
    sendUnauthorizedResponse(res, "Content-type must be application/json");
    return;
  }

  // Extract token from Authorization header
  const token = extractToken(req.headers.authorization);
  if (!token) {
    sendUnauthorizedResponse(res, "Missing authorization token");
    return;
  }

  // Verify JWT token
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    sendUnauthorizedResponse(res, "Invalid or expired token");
    return;
  }

  // Fetch user from database
  const user = await fetchUserById(decoded.id as string);

  if (!user) {
    sendUnauthorizedResponse(
      res,
      "User not found in database for authentication"
    );
    return;
  }

  // Ensure we have a valid user object before proceeding
  if (!user.id) {
    sendUnauthorizedResponse(res, "Invalid user data from database");
    return;
  }

  // Attach user to request and continue
  (req as RequestWithUser).user = user;
  next();
};
