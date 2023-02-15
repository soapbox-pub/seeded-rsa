// @deno-types="npm:@types/node-forge@^1.3.1"
import forge from 'npm:node-forge@^1.3.1';

/** Get SHA-256 hex digest from a string. */
function getDigest(message: string) {
  const md = forge.md.sha256.create();
  md.update(message);
  return md.digest().toHex();
}

/**
 * Convert a string into an ArrayBuffer.
 * <https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String>
 */
function str2ab(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

interface GenerateSeededRsaOptions {
  bits?: number;
}

/** Generate a deterministic RSA keypair from a seed. */
async function generateSeededRsa(seed: string, opts: GenerateSeededRsaOptions = {}): Promise<CryptoKeyPair> {
  // Seed the PRNG with a SHA-256 digest from the string.
  const prng = forge.random.createInstance();
  prng.seedFileSync = () => getDigest(seed);

  const keys = forge.pki.rsa.generateKeyPair({ ...opts, prng });

  const rsaPublicKey = forge.pki.publicKeyToAsn1(keys.publicKey);
  const publicKeyData = str2ab(forge.asn1.toDer(rsaPublicKey).getBytes());

  const rsaPrivateKey = forge.pki.privateKeyToAsn1(keys.privateKey);
  const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey);
  const privateKeyData = str2ab(forge.asn1.toDer(privateKeyInfo).getBytes());

  const algorithm = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-256',
  };

  const publicKey = await crypto.subtle.importKey(
    'spki',
    publicKeyData,
    algorithm,
    true,
    ['verify'],
  );

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyData,
    algorithm,
    true,
    ['sign'],
  );

  return {
    publicKey,
    privateKey,
  };
}

export { generateSeededRsa };
