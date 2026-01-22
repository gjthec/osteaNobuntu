import * as crypto from 'crypto';

/**
 * Função para criptografar dados
 * @param text Valor que será criptografado
 * @param key Chave que irá criptografar e descriptografar
 * @returns 
 */
export function encrypt(text: string, key: Buffer): string {
  // Vetor de inicialização, para garantir que cada criptografia seja única
  const iv: Buffer = crypto.randomBytes(16); // Gerar um novo IV para cada operação

  // Cria um objeto Cipher (Objeto usado para criptografar) usando o algoritmo AES-256-CBC
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  // Criptografa o texto passado para a função
  let encrypted: Buffer = cipher.update(text, 'utf8'); // Converte o texto de UTF-8 para dados criptografados
  encrypted = Buffer.concat([encrypted, cipher.final()]); // Concatena o resultado final da criptografia

  // Converte o buffer criptografado para uma string hexadecimal
  return encrypted.toString('hex') + ':' + iv.toString('hex');
}

// Função para descriptografar dados
export function decrypt(encryptedText: string, key: Buffer, iv: Buffer): string {
  // Cria um buffer a partir da string hexadecimal criptografada
  const encryptedTextBuffer = Buffer.from(encryptedText, 'hex');

  // Cria um objeto Decipher usando o mesmo algoritmo, chave e IV
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  // Descriptografa o texto criptografado
  let decrypted = decipher.update(encryptedTextBuffer); // Converte o buffer criptografado de volta para dados descriptografados
  decrypted = Buffer.concat([decrypted, decipher.final()]); // Concatena o resultado final da descriptografia

  // Converte o buffer descriptografado de volta para uma string
  return decrypted.toString('utf8');
}

export function encryptDatabasePassword(password: string): string {
  try {
    // Verificar se o password é válido
    if (!password) {
      throw new Error("Password to encrypt database password is required and cannot be undefined or empty");
    }

    const encryptionKey = process.env.SECURITY_ENCRYPTION_KEY_TENANT_PASSWORD;

    if (encryptionKey == undefined) {
      throw new Error("SECURITY_ENCRYPTION_KEY_TENANT_PASSWORD is not defined on enviroment variables!");
    }

    const key = crypto
    .createHash("sha256")
    .update(encryptionKey, "utf8")
    .digest("base64")
    .substr(0, 32); // Cria uma chave de 256 bits a partir da chave secreta

    return encrypt(password, Buffer.from(key));
  } catch (error) {
    throw new Error("Encrypt database password error. Detail: " + error)
  }
}

export function decryptDatabasePassword(password: string): string {

  try {
    // Verificar se o password é válido
    if (!password) {
      throw new Error("Password to decrypt database password is required and cannot be undefined or empty");
    }

    const encryptionKey = process.env.SECURITY_ENCRYPTION_KEY_TENANT_PASSWORD;

    if (encryptionKey == undefined) {
      throw new Error("SECURITY_ENCRYPTION_KEY_TENANT_PASSWORD is not defined on enviroment variables!");
    }

    const key = crypto
    .createHash("sha256")
    .update(encryptionKey, "utf8")
    .digest("base64")
    .substr(0, 32); // Cria uma chave de 256 bits a partir da chave secreta

    const [encryptedText, ivHex] = password.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    return decrypt(encryptedText, Buffer.from(key), iv);
  } catch (error) {
    throw new Error("Decrypt database password error. Detail: " + error);
  }
}