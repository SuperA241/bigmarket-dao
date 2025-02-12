import { describe, expect, it } from "vitest";
import { boolCV, Cl, listCV, noneCV, principalCV, stringAsciiCV, uintCV } from "@stacks/transactions";
import { alice, betty, bob, constructDao, deployer, metadataHash, passProposalByCoreVote, setupSimnet, stxToken, tom, wallace } from "../helpers";
import { bufferFromHex } from "@stacks/transactions/dist/cl";
import { generateMerkleProof, generateMerkleTreeUsingStandardPrincipal, proofToClarityValue } from "../gating/gating";
import { createBinaryMarket, createBinaryMarketWithGating } from "../categorical/categorical.test";

const simnet = await setupSimnet();
 
/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe("prediction contract", () => { 
  it("ensures the contract is deployed", () => { 
    const contractSource = simnet.getContractSource( 
      "bme023-market-predicting"
    ); 
    expect(contractSource).toBeDefined(); 
  }); 
 
  it("setup market with market share type works", async () => {
    constructDao(simnet);
    //let response = await createBinaryMarket(0, deployer, stxToken);
      let response = await simnet.callPublicFn(
        "bme023-market-predicting", 
        "create-market",
        [
          Cl.list([Cl.stringAscii('nay'), Cl.stringAscii('yay')]), Cl.none(),
          Cl.principal((stxToken) ? stxToken : stxToken),
          Cl.bufferFromHex(metadataHash()),
          Cl.list([]), Cl.principal(`${deployer}.bme022-market-gating`)
        ], 
        deployer
      );
      expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    
  });

  // it("setup market with market stake type works", async () => {
  //   constructDao(simnet); 
  //   let response = await createBinaryMarket(0, deployer, stxToken);
  // });

  // it("setup two share type markets works", async () => {
  //   constructDao(simnet);
  //   let response = await createBinaryMarket(0, deployer, stxToken);
  //   response = await createBinaryMarket(1, deployer, stxToken);
  // });

  // it("ensure market data is as expected", async () => {
  //   constructDao(simnet);
  //   await passProposalByCoreVote(`bdp001-gating`);
  //   const allowedCreators = [alice, bob, tom, betty, wallace];
  //   const { tree, root } = generateMerkleTreeUsingStandardPrincipal(allowedCreators);
  //   let merdat = generateMerkleProof(tree, alice);
    
  //   let response = await createBinaryMarketWithGating(0, proofToClarityValue(merdat.proof), metadataHash(), alice, stxToken)

  //   merdat = generateMerkleProof(tree, bob);
  //   response = await createBinaryMarketWithGating(1, proofToClarityValue(merdat.proof), metadataHash(), bob, stxToken)

  //   const data = await simnet.callReadOnlyFn(
  //     "bme023-market-predicting",
  //     "get-market-data",
  //     [Cl.uint(0)], 
  //     bob
  //   );
  //   expect(data.result).toEqual( 
  //     Cl.some( 
  //       Cl.tuple({
  //         creator: principalCV(alice), 
  //         "market-data-hash": bufferFromHex(metadataHash()),
  //         "stakes": listCV([uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0)]),
  //         "categories": listCV([stringAsciiCV('nay'), stringAsciiCV('yay')]),
  //         "outcome": noneCV(),
  //         "resolution-burn-height": uintCV(0),
  //         "resolution-state": uintCV(0),
  //         "market-fee-bips": uintCV(0),
  //         concluded: boolCV(false),
  //         token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
  //       })
  //     )
  //   );  
  
  // });
});
