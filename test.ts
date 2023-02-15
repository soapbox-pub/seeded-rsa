import { assert } from 'https://deno.land/std@0.177.0/testing/asserts.ts';

import { generateSeededRsa } from './mod.ts';

Deno.test('generateSeededRsa', async () => {
  const keys = await generateSeededRsa('alex@gleasonator.com:benis911');
  const message = new TextEncoder().encode('hello world!');
  const algorithm = 'RSASSA-PKCS1-v1_5';

  const signature = await window.crypto.subtle.sign(
    algorithm,
    keys.privateKey,
    message,
  );

  const valid = await crypto.subtle.verify(
    algorithm,
    keys.publicKey,
    signature,
    message,
  );

  assert(valid);
});
