import { initSimnet } from "@hirosystems/clarinet-sdk";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";

export async function getSimnet() {
  const simnet = await initSimnet();
  const accounts = simnet.getAccounts();

  const deployer = accounts.get("deployer")!;
  const alice = accounts.get("wallet_1")!;
  const bob = accounts.get("wallet_2")!;

  if (!deployer || !alice || !bob) {
    throw new Error("Accounts not initialized properly");
  }

  return { simnet, deployer, alice, bob };
}

export function metadataHash() {
  const metadata = "example metadata";
  const metadataHash = sha256(metadata);
  return bytesToHex(metadataHash);
}
