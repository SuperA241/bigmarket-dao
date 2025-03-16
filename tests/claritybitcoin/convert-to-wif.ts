import { concatBytes } from '@noble/hashes/utils';
import { base58check } from '@scure/base';
import { hex } from '@scure/base';

// Stacks private key (remove last byte "01" if it exists)
const stacksPrivKeyHex = '36eab9c1c3f1694c696ee00c24f5add52d6edd48ffa494eb04e5bb1dfc5d9e70';

// Convert hex private key to Uint8Array
const privKeyBytes = hex.decode(stacksPrivKeyHex);

// Ensure the key is 32 bytes (remove extra bytes if needed)
if (privKeyBytes.length !== 32) {
	throw new Error('Invalid private key length. It must be 32 bytes.');
}

// Bitcoin WIF Regtest prefix (0xEF for regtest/testnet)
const versionByte = 0xef;

// Append WIF compression flag (0x01 for compressed keys)
const compressedKey = concatBytes(privKeyBytes, hex.decode('01'));

// Encode to WIF format using Base58Check
const wifKey = base58check(compressedKey);

console.log('Bitcoin Regtest WIF Private Key:', wifKey);
