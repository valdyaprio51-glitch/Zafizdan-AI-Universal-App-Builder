import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export class SecurityEncryption {
  private secretKey: Buffer;

  constructor(secretHex?: string) {
    const rawSecret = secretHex || process.env.ENCRYPTION_SECRET || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    // Ensure exactly 32 bytes using sha256 hash if necessary
    this.secretKey = crypto.createHash('sha256').update(rawSecret).digest();
  }

  encrypt(plainText: string): { encrypted: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.secretKey, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag,
    };
  }

  decrypt(encryptedHex: string, ivHex: string, authTagHex: string): string {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, this.secretKey, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  maskSecret(secret: string): string {
    if (!secret || secret.length <= 4) return '****';
    return `${secret.substring(0, 3)}...${secret.substring(secret.length - 3)}`;
  }
}

export const securityEncryption = new SecurityEncryption();

