import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import type { EncryptedData } from '../types.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.AI_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('AI_ENCRYPTION_KEY environment variable is required');
  }
  const keyBuffer = Buffer.from(key, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('AI_ENCRYPTION_KEY must be a 32-byte hex string (64 hex characters)');
  }
  return keyBuffer;
}

export function encrypt(text: string): EncryptedData {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encrypted: encrypted + authTag,
    iv: iv.toString('hex'),
  };
}

export function decrypt(encrypted: string, iv: string): string {
  const key = getKey();
  const ivBuffer = Buffer.from(iv, 'hex');

  // Split encrypted data and auth tag
  const authTag = Buffer.from(encrypted.slice(-AUTH_TAG_LENGTH * 2), 'hex');
  const encryptedText = encrypted.slice(0, -AUTH_TAG_LENGTH * 2);

  const decipher = createDecipheriv(ALGORITHM, key, ivBuffer, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
