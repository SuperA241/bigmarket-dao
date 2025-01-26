import { hashSha256Sync } from "@stacks/encryption";
import { MerkleTree } from "merkletreejs";
import { Cl, ClarityValue, ListCV } from "@stacks/transactions";
import { c32addressDecode } from "c32check"; // Decode principal to version + hash160
import { sha256 } from "@noble/hashes/sha256";
import { hexToBytes, bytesToHex, concatBytes } from "@stacks/common";

export function generateMerkleTreeUsingStandardPrincipal(
  addresses: Array<string>
) {
  const leaves = addresses.map((address) => {
    const [version, hash160] = c32addressDecode(address);
    const hashBytes = hexToBytes(hash160);
    // console.log(
    //   "generateMerkleTreeUsingStandardPrincipal ===> " +
    //     address +
    //     " ===> " +
    //     bytesToHex(sha256(hashBytes))
    // );
    return sha256(hashBytes);
  });
  const tree = new MerkleTree(leaves, sha256);
  const root = tree.getRoot().toString("hex");
  return { tree, root };
}

export function generateMerkleProof(tree: MerkleTree, address: string) {
  const root = tree.getRoot().toString("hex");
  const [version, hash160] = c32addressDecode(address);
  const hashBytes = hexToBytes(hash160);
  // const clarityHash = sha256(hashBytes);
  // console.log(bytesToHex(clarityHash));
  // console.log("generateMerkleProof ===> " + hash160);

  // Hash the resulting buffer with SHA-256
  const leaf = bytesToHex(sha256(hashBytes));
  const proof = tree.getProof(leaf);
  const valid = tree.verify(proof, leaf, root);
  // console.log("Merkle version:" + version);
  // console.log("Merkle hash160:" + hash160);
  // console.log("Merkle address:" + address);
  // console.log("Merkle root:" + root);
  // console.log("Merkle leaf:" + leaf);
  // console.log("Is valid proof:", valid);
  // console.log("Leaves (Tree):", tree.getLeaves().map(bytesToHex));

  return { proof, valid, leaf };
}

export function proofToClarityValue(
  proof: Array<{ data: Uint8Array; position: string }>
): ListCV<ClarityValue> {
  const clarityProof = proof.map((p: { data: any; position: string }) => {
    const hashBuffer = p.data; // Extract the hash
    if (hashBuffer.length !== 32) {
      throw new Error("Hash length must be 32 bytes for Clarity proof.");
    }
    // console.log(
    //   "proofToClarityValue ===> " +
    //     hashBuffer.toString("hex") +
    //     " " +
    //     p.position
    // );
    return Cl.tuple({
      hash: Cl.bufferFromHex(hashBuffer.toString("hex")),
      position: Cl.bool(p.position === "left"),
    });
  });
  const proofList = Cl.list(clarityProof);
  return proofList;
}

export function text2Hex(message: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return bytesToHex(hashSha256Sync(data));
}

export function contractId2Key(contractId: string): string {
  const address = contractId.split(".")[0];
  const name = contractId.split(".")[1];
  const encoder = new TextEncoder();
  //const nameHex = bytesToHex(encoder.encode(name));
  const nameHex = bytesToHex(encodeToConsensusBuffer(name));
  // console.log("contractId2Key: nameHex: " + nameHex);

  // console.log("contractId2Key: address: " + address);
  // console.log("contractId2Key: name: " + name);
  const [version, hash160] = c32addressDecode(address);
  // console.log("contractId2Key: hash160: " + hash160);
  const nameBytes = hexToBytes(nameHex);
  const hashBytes = hexToBytes(hash160);
  // const clarityHash = sha256(hashBytes);
  // console.log(bytesToHex(clarityHash));
  const concaten = concatBytes(hashBytes, nameBytes);
  // console.log("contractId2Key: concaten: " + bytesToHex(concaten));
  const key = bytesToHex(sha256(concaten));
  // console.log("contractId2Key: key: " + key);
  return key;
}

function encodeToConsensusBuffer(name: string) {
  // Ensure the string is valid ASCII
  if (!/^[\x00-\x7F]*$/.test(name)) {
    throw new Error("The name contains non-ASCII characters.");
  }

  // Convert the ASCII string to a Uint8Array
  const asciiBytes = new Uint8Array(
    [...name].map((char) => char.charCodeAt(0))
  );

  // Define the type prefix for `string-ascii`
  const typePrefix = new Uint8Array([0x0d, 0x00, 0x00, 0x00]); // `0d000000`

  // Define the length prefix (4 bytes)
  const lengthPrefix = new Uint8Array([asciiBytes.length]); // 1-byte length

  // Concatenate type, length, and ASCII bytes
  const consensusBuffer = new Uint8Array([
    ...typePrefix,
    ...lengthPrefix,
    ...asciiBytes,
  ]);

  return consensusBuffer;
}

// (principal-contract (unwrap! (principal-destruct? tx-sender) (err u1001)))
// (contract-bytes (get hash-bytes principal-contract))
// (contract-name (unwrap! (to-consensus-buff? (unwrap! (get name principal-contract) err-expecting-an-owner)) err-expecting-an-owner))
// (contract-key (sha256 (concat contract-bytes contract-name )))
