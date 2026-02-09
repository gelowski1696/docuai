import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const SESSION_TIMEOUT_MINUTES = Number(process.env.SESSION_TIMEOUT_MINUTES || 480); // 8 hours

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AppSessionPayload extends JWTPayload {
  authId: string;
}

/**
 * Sign a JWT token with user payload
 */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Sign app-session token (used in PostgreSQL/Supabase mode) with shorter timeout.
 */
export function signAppSessionToken(payload: AppSessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${SESSION_TIMEOUT_MINUTES}m`,
  });
}

/**
 * Verify app-session token.
 */
export function verifyAppSessionToken(token: string): AppSessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AppSessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Cookie maxAge in seconds for app-session token.
 */
export function getSessionMaxAgeSeconds(): number {
  return Math.max(60, Math.floor(SESSION_TIMEOUT_MINUTES * 60));
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
