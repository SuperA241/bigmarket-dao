import { secp256k1 } from '@noble/curves/secp256k1';
import * as btc from '@scure/btc-signer';

// Your Bitcoin WIF private key
const wif = 'L19bUpcNHxbkyJ9inUvAu1MxCkxYgePQpG8uTPb1MS9LT6tqrmZ2';

// Decode WIF to get the raw private key
const privateKey = btc.WIF().decode(wif);

// Derive the compressed public key
const publicKey = secp256k1.getPublicKey(privateKey, true);

console.log('Public Key:', Buffer.from(publicKey).toString('hex'));
