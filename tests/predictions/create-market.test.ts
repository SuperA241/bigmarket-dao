import { describe, expect, it } from "vitest";
import { boolCV, Cl, principalCV, uintCV } from "@stacks/transactions";
import { alice, betty, bob, constructDao, deployer, fred, metadataHash, passProposalByCoreVote, passProposalByExecutiveSignals, setupSimnet, stxToken, tom, wallace } from "../helpers";
import { bufferFromHex } from "@stacks/transactions/dist/cl";
import { generateMerkleProof, generateMerkleTreeUsingStandardPrincipal, proofToClarityValue } from "../gating/gating";
import { hexToBytes } from "@noble/hashes/utils";

const simnet = await setupSimnet();

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe("prediction contract", () => {
  it("ensures the contract is deployed", () => {
    const contractSource = simnet.getContractSource( 
      "bde023-market-predicting"
    );
    expect(contractSource).toBeDefined();
  });

  it("setup market - unknown market type does not work", async () => {
    constructDao(simnet);
    console.log(metadataHash());
    const response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(3), Cl.none(),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10001)));
  });

  it("setup market with market share type works", async () => {
    constructDao(simnet);
    const response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
  });

  it("setup market with market stake type works", async () => {
    constructDao(simnet);
    const response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(1), Cl.none(),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
  });

  it("setup two share type markets works", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(1)));
  });

  it("ensure market data is as expected", async () => {
    constructDao(simnet);
    await passProposalByCoreVote(`bdp001-gating`);
    const allowedCreators = [alice, bob, tom, betty, wallace];
    const { tree, root } = generateMerkleTreeUsingStandardPrincipal(allowedCreators);
    let merdat = generateMerkleProof(tree, alice);
    
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        proofToClarityValue(merdat.proof),
      ],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));

    merdat = generateMerkleProof(tree, bob);
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        proofToClarityValue(merdat.proof),
      ],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(1)));

    const data = await simnet.callReadOnlyFn(
      "bde023-market-predicting",
      "get-market-data",
      [Cl.uint(0)], 
      bob
    );
    expect(data.result).toEqual(
      Cl.some(
        Cl.tuple({
          creator: principalCV(alice),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(0),
          "no-pool": uintCV(0),
          "resolution-burn-height": uintCV(0),
          "resolution-state": uintCV(0),
          "market-fee-bips": uintCV(0),
          concluded: boolCV(false),
          outcome: boolCV(false),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        })
      )
    );  
  
  });
});
