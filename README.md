# seeded-rsa

Generate an RSA keypair from a seed (any string) and get back a [`CryptoKeyPair`](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKeyPair). The keypair will always be the same for the same input string.

It relies on [node-forge](https://github.com/digitalbazaar/forge) and is based roughly on [this StackOverflow post](https://stackoverflow.com/a/72047475).

## Usage

```ts
import { generateSeededRsa } from 'https://gitlab.com/soapbox-pub/seeded-rsa/-/raw/v1.0.0/mod.ts';

const keys = await generateSeededRsa('alex@gleasonator.com:benis911');
const message = new TextEncoder().encode('hello world!');

const signature = await window.crypto.subtle.sign(
  'RSASSA-PKCS1-v1_5',
  keys.privateKey,
  message,
);

const valid = await crypto.subtle.verify(
  'RSASSA-PKCS1-v1_5',
  keys.publicKey,
  signature,
  message,
);

assert(valid); // true
```

## License

This is free and unencumbered software released into the public domain.
