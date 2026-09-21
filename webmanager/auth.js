import { randomUUID } from "node:crypto";
import { webConfig } from "./config.js";

const sessionStore = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

const loginAttempts = new Map();

export function getClientIp(req) {
  return req.socket.remoteAddress || "unknown";
}

export function isRateLimited(ip) {
  const entry = loginAttempts.get(ip);
  if (!entry || !entry.lockedUntil) return false;

  if (Date.now() >= entry.lockedUntil) {
    loginAttempts.delete(ip);
    return false;
  }

  return true;
}

export function getLockoutRemainingMs(ip) {
  const entry = loginAttempts.get(ip);
  if (!entry || !entry.lockedUntil) return 0;
  return Math.max(0, entry.lockedUntil - Date.now());
}

export function recordFailedLogin(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now - entry.firstAttempt > LOGIN_ATTEMPT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now, lockedUntil: null });
    return;
  }

  entry.count += 1;
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    entry.lockedUntil = now + LOGIN_LOCKOUT_MS;
  }

  loginAttempts.set(ip, entry);
}

export function clearLoginAttempts(ip) {
  loginAttempts.delete(ip);
}

export function getSessionId(req) {
  const cookieHeader = req.headers.cookie || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("sessionId="));

  return cookie ? decodeURIComponent(cookie.slice("sessionId=".length)) : null;
}

export function getCurrentUser(req) {
  const sessionId = getSessionId(req);
  return sessionId ? sessionStore.get(sessionId) || null : null;
}

export function requireAuth(req, res) {
  const user = getCurrentUser(req);
  if (!user) {
    res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({ success: false, message: "Authentication required." }),
    );
    return null;
  }

  return user;
}

export function createSession(username) {
  const sessionId = randomUUID();
  sessionStore.set(sessionId, username);
  return sessionId;
}

export function destroySession(req) {
  const sessionId = getSessionId(req);
  if (sessionId) {
    sessionStore.delete(sessionId);
  }
}

export function validateLogin(username, password) {
  const user = (webConfig.users || []).find(
    (entry) => entry.username === username && entry.password === password,
  );

  return user ? user.username : null;
}
