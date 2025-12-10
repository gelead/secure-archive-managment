import crypto from 'crypto';

const ALGO = 'aes-256-cbc';

export const encrypt = (text, key) => {
  const hash = crypto.createHash('sha256').update(String(key)).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, hash, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (encryptedText, key) => {
  const hash = crypto.createHash('sha256').update(String(key)).digest();
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv(ALGO, hash, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
};

export default { encrypt, decrypt };

