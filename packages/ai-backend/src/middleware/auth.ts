import type { Request, Response, NextFunction } from 'express';

/**
 * API key authentication middleware.
 * Checks the X-API-Key header against the API_KEY environment variable.
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.header('X-API-Key');
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    console.error('API_KEY environment variable is not set');
    res.status(500).json({ error: 'Server misconfigured' });
    return;
  }

  if (!apiKey) {
    res.status(401).json({ error: 'Missing X-API-Key header' });
    return;
  }

  // Constant-time comparison to prevent timing attacks
  if (apiKey.length !== expectedKey.length || !timingSafeEqual(apiKey, expectedKey)) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  next();
}

/**
 * Simple constant-time string comparison.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
