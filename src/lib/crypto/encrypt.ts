import 'server-only'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

function getKey(): Buffer {
  const hex = process.env.CREDENTIALS_ENCRYPTION_KEY
  if (!hex) throw new Error('CREDENTIALS_ENCRYPTION_KEY no está configurada')
  const key = Buffer.from(hex, 'hex')
  if (key.length !== 32) throw new Error('CREDENTIALS_ENCRYPTION_KEY debe ser 32 bytes (64 hex chars)')
  return key
}

export function encryptText(plain: string): string {
  const key = getKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // formato: iv(16) + tag(16) + encrypted — todo en base64
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decryptText(encoded: string): string {
  const key = getKey()
  const buf = Buffer.from(encoded, 'base64')
  const iv = buf.subarray(0, 16)
  const tag = buf.subarray(16, 32)
  const encrypted = buf.subarray(32)
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted) + decipher.final('utf8')
}
