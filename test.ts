import { assert, assertEquals } from 'https://deno.land/std@0.177.0/testing/asserts.ts';

import { generateSeededRsa } from './mod.ts';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

Deno.test('generateSeededRsa', async () => {
  const keys = await generateSeededRsa('alex@gleasonator.com:benis911', { bits: 1024 });
  const message = new TextEncoder().encode('hello world!');
  const algorithm = 'RSASSA-PKCS1-v1_5';

  const buffer = await crypto.subtle.exportKey('pkcs8', keys.privateKey);
  const base64 = arrayBufferToBase64(buffer);
  const expected =
    'MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAJraNV+pwdgRhmDr8Hqd5NGFBhWiUR4ywukD1e6DGVDF4M5TEZaKTxXCoPbffgjCHARR6KuTWe9vzXPmjwU1GObwPnj+KfjFWbXmKNM5m9cdZw8a3ZlHsz1kE3/TcomIcrlqjcMz4GUkXH0+cBntCp06vyJridOCByHFtWryqdGhAgMBAAECgYEAg0MO1T1vvHj2gLffDAFFkjkBdFs4CbIbuCtxL5HfZrGlox+VHBe3fAmUKlA+ZKwt1Zec87ufE7Cg5mr8tvxQUzZ+Iov9G4076MPb4KUcD+UkWldM/AFsY7QlKvFOSy2VLADtxgmuOCGa76cXAVXEAsVuWfpFnZgRgjyVzftMyzECQQDfDdH4vtuPN+2UuRAXkJ3zXu7fD1lEjRyyjMNPf7HOkK5TBZvPWboULo8FfaJHIITq+oZsKikPcFfIY2k0gieVAkEAsbmHq8IOBEAkMp0nyR2sr79BCCfDXhS5/N8FJdtnMIUQujBeGphmx47sSp8HdSdB3c0/dQl70F/35DlMsLWO3QJBAIS++dZa59otQ8R9+ti7ZXVAa1LvFIZaoNiWM2ptqYkwy753GQpm8Pov10hCQ8Cm1tPtcvCOis84YdXNbAAm8Z0CQAPsi8FQFI0leWcgrysym4h52Y67igW+wWiC6BMw5/NbTMY/oSRHLyXC0xbGshx1FHA4Qulrny83nzqLxVS1fYUCQQDOPVRqGGYkSGB/b982UWalmRHsrvEsFkgrdDkXGLWhvtGTwZzkDEcd+EZ/7drab1utf5CVv9Jo699v4j6ljs3f';

  assertEquals(base64, expected);

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
