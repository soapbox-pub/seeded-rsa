# seeded-rsa

Generate a deterministic RSA keypair from a seed (any string) and get back a [`CryptoKeyPair`](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKeyPair). The keypair will always be the same for the same input string.

It relies on [node-forge](https://github.com/digitalbazaar/forge) and is based roughly on [this StackOverflow post](https://stackoverflow.com/a/72047475).

## Usage

```ts
import { generateSeededRsa } from 'https://gitlab.com/soapbox-pub/seeded-rsa/-/raw/v1.0.0/mod.ts';

const keys = await generateSeededRsa('alex@gleasonator.com:benis911', { bits: 2048 });
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

### Options

These options may be passed to `generateSeededRsa()`:

- `bits`: Strength of the key, eg `2048`, `4096`, etc. The default is `4096` which is very secure but is SLOW. Using a smaller number like `1024` will be fast, but less secure. See here for advice on which bit size to use: https://stackoverflow.com/a/589850

## License

This is free and unencumbered software released into the public domain.
