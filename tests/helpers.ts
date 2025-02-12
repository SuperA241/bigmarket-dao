import { initSimnet } from "@hirosystems/clarinet-sdk";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { Cl, uintCV } from "@stacks/transactions";
import { assert, expect } from "vitest";
import { contractId2Key, generateMerkleProof, generateMerkleTreeUsingStandardPrincipal } from "./gating/gating";

export const simnet = await setupSimnet();
export const accounts = simnet.getAccounts();
export const deployer = accounts.get("deployer")!;
export const alice = accounts.get("wallet_1")!;
export const bob = accounts.get("wallet_2")!;
export const tom = accounts.get('wallet_3')!;
export const betty = accounts.get('wallet_4')!;
export const fred = accounts.get('wallet_5')!;
export const wallace = accounts.get('wallet_6')!;
export const piedro = accounts.get('wallet_7')!;
export const annie = accounts.get("wallet_4")!;
export const developer = accounts.get("wallet_8")!;

export const coreProposals = "bme003-core-proposals"; 
export const marketVoting = "bme021-market-voting";
export const marketGating = "bme022-market-gating";
export const marketPredicting = "bme023-market-predicting";
export const treasury = "bme006-treasury";

export async function setupSimnet() {
  return await initSimnet();
}

export const stxToken = `${deployer}.wrapped-stx`;
export const sbtcToken = `${deployer}.sbtc`;

export function metadataHash() {
  const metadata = "example metadata";
  const metadataHash = sha256(metadata);
  return bytesToHex(metadataHash);
}

export function dataHash(message: string) {
  const metadataHash = sha256(message);
  return bytesToHex(metadataHash);
}

/**
 * Constructs the DAO
 */
export async function constructDao(simnet: any) {
  const proposal = simnet.deployer + "." + "bdp000-bootstrap";
  const result = await simnet.callPublicFn(
    "bigmarket-dao", // Replace with actual contract name
    "construct",
    [Cl.principal(proposal)],
    simnet.deployer
  );
  // console.log("constructDao: ", Cl.prettyPrint(result.result));

  // Ensure the DAO is constructed successfully
  //expect(result.result).toEqual("(ok true)");
  return proposal;
}

export async function assertDataVarNumber(contract:string, varName:string, value: number) {
  let result = Number((simnet.getDataVar(contract, varName) as any).value);
  expect(result).toEqual(value)
}
export async function assertContractBalance(contract:string, value:bigint) {
  let stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log("contractBalance : " + contract + ' : ' + stxBalances?.get(`${deployer}.${contract}`));
  expect(stxBalances?.get(`${deployer}.${contract}`)).toEqual(value)
}

export async function assertUserBalance(user:string, value:bigint) {
  let stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log("assertUserBalance: " + user + stxBalances?.get(`${user}`));
  expect(stxBalances?.get(`${user}`)).toEqual(value)
}

export async function allowMarketCreators(user:string) {
  const allowedCreators = [alice, bob, tom, betty, wallace];
  const { tree, root } = generateMerkleTreeUsingStandardPrincipal(allowedCreators);
  // console.log('Leaves (Tree):', tree.getLeaves().map(bytesToHex));
  const lookupRootKey = contractId2Key('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bme023-market-predicting');
  console.log('root=' + root)
  console.log('lookupRootKey=' + lookupRootKey)
  const proposal = `bdp001-gating`;
  await passProposalByCoreVote(proposal);
  let merdat = generateMerkleProof(tree, user);
  
  return merdat.proof;
}
 

export async function assertStakeBalance(user:string, againstValue:number, forValue:number) {
  let data = await simnet.callReadOnlyFn(
    "bme023-market-predicting",
    "get-stake-balances",
    [Cl.uint(0), Cl.principal(user)],
    alice
  );
  expect(data.result).toEqual(
    Cl.some(
      Cl.list([Cl.uint(forValue), Cl.uint(againstValue), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0)])
    )
  );
}

export async function corePropose(
  simnet: any,
  proposalName: string
) {
  const alice = simnet.getAccounts().get("wallet_1")!;
  const deployer = simnet.getAccounts().get("deployer")!;
  const proposal1 = `${deployer}.${proposalName}`;
  const result = await simnet.callPublicFn(
    coreProposals,
    "core-propose",
    [
      Cl.principal(proposal1),
      Cl.uint(simnet.blockHeight + 2),
      Cl.uint(100),
      Cl.uint(6600),
    ],
    alice
  );
  // console.log("corePropose: ", Cl.prettyPrint(result.result));
  expect(result.result).toEqual("ok true");
}

/**
 * Pass a Proposal by Signals
 */
export async function passProposalByExecutiveSignals(simnet: any, proposalName: string) {
  const proposal = `${deployer}.${proposalName}`;

  // Signal 1 by Alice
  const response2 = await simnet.callPublicFn(
    "bme004-core-execute", // Replace with actual contract name
    "executive-action",
    [Cl.principal(proposal)],
    alice
  );
  expect(response2.result).toEqual(Cl.ok(Cl.uint(1)));

  // Signal 2 by Bob
  await simnet.callPublicFn(
    "bme004-core-execute",
    "executive-action",
    [Cl.principal(proposal)],
    bob
  );
  expect(response2.result).toEqual(Cl.ok(Cl.uint(1)));

  // Check if the proposal is executed
  const executedAt = await simnet.callReadOnlyFn(
    "bigmarket-dao",
    "executed-at",
    [Cl.principal(proposal)],
    deployer
  );
  //console.log("executedAt: ", executedAt);
  //expect(executedAt.result).toEqual(Cl.some(Cl.uint(619n)));
  expect(executedAt.result).toMatchObject(/^ok u\d+/); // Expect a valid block height
}

export async function isValidExtension(extension: string) {
  let data = await simnet.callReadOnlyFn(
    "bigmarket-dao",
    "is-extension",
    [Cl.principal(extension)],
    alice
  );
  expect(data.result).toEqual(Cl.bool(true));
  return true;
}

export function prepareVotes(
  voters: {
    voter: string;
    votingPower: number;
    for: boolean;
    timestamp: number;
  }[]
) {
  return Cl.list(
    voters.map((v) =>
      Cl.tuple({
        message: Cl.tuple({
          voter: Cl.principal(v.voter),
          "voting-power": Cl.uint(v.votingPower),
          for: Cl.bool(v.for),
          timestamp: Cl.uint(v.timestamp),
        }),
        signature: Cl.buffer(new Uint8Array(65).fill(0x01)), // Dummy signature, replace with real signature if available
      })
    )
  );
}

export async function passProposalByCoreVote(proposal: string, errorCode?: number) {
  await isValidExtension(`${deployer}.bme000-governance-token`);
  await isValidExtension(`${deployer}.bme001-proposal-voting`);
  await isValidExtension(`${deployer}.bme004-core-execute`);
  await isValidExtension(`${deployer}.bme003-core-proposals`);
  await isValidExtension(`${deployer}.bme006-treasury`);
  await isValidExtension(`${deployer}.bme022-market-gating`);
  await isValidExtension(`${deployer}.bme021-market-voting`);
  await isValidExtension(`${deployer}.bme023-market-predicting`);

  const votingContract = "bme001-proposal-voting";
  const coreProposeResponse = await simnet.callPublicFn(
    coreProposals,
    "core-propose",
    [
      Cl.principal(`${deployer}.${proposal}`),
      Cl.uint(simnet.burnBlockHeight + 10),
      Cl.uint(100),
      Cl.some(Cl.uint(6600)),
    ],
    alice
  );
  expect(coreProposeResponse.result).toEqual(Cl.ok(Cl.bool(true)));

  // Step 3: Mine 2 empty blocks
  simnet.mineEmptyBurnBlocks(20);

  // Step 4: Vote on the proposal
  const voteResponse = await simnet.callPublicFn(
    votingContract,
    "vote",
    [Cl.uint(1000), Cl.bool(true), Cl.principal(`${deployer}.${proposal}`), Cl.none()],
    bob
  );
  expect(voteResponse.result).toEqual(Cl.ok(Cl.bool(true)));

  // Step 6: Mine 200 empty blocks to reach the conclusion point
  simnet.mineEmptyBurnBlocks(200);

  // Step 7: Conclude the proposal
  const concludeResponse = await simnet.callPublicFn(
    votingContract,
    "conclude",
    [Cl.principal(`${deployer}.${proposal}`)],
    bob
  );
  if (errorCode) {
    expect(concludeResponse.result).toEqual(Cl.error(Cl.uint(errorCode)));
  } else {
    expect(concludeResponse.result).toEqual(Cl.ok(Cl.bool(true)));
  }
  return concludeResponse;
}
