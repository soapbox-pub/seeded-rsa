// @deno-types="npm:@types/node-forge@^1.3.1"
import forge from 'npm:node-forge@^1.3.1';

/**
 * Get SHA-256 hex digest from a string.
 * <https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string>
 */
async function getDigest(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
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
  prng.seedFile = async (_needed, cb) => cb(null, await getDigest(seed));
  
  const keys = await new Promise<forge.pki.rsa.KeyPair>((resolve, reject) => {
    forge.pki.rsa.generateKeyPair({ ...opts, prng }, function(err, keypair) {
      if (err) {
        reject(err);
      } else {
        resolve(keypair);
      }
    });
  });

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
