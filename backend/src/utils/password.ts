import { randomBytes } from 'node:crypto';
import { argon2id, argon2Verify } from 'hash-wasm';

const ARGON2_OPTIONS = {
  iterations: 3,
  memorySize: 65_536,
  parallelism: 4,
  hashLength: 32,
  outputType: 'encoded' as const,
};

export const hashPassword = (password: string) =>
  argon2id({ password, salt: randomBytes(16), ...ARGON2_OPTIONS });

export const verifyPassword = (hash: string, password: string) =>
  argon2Verify({ hash, password });