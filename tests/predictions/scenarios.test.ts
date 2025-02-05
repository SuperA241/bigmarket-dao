import { describe, expect, it } from "vitest";
import { boolCV, Cl, listCV, noneCV, principalCV, someCV, stringAsciiCV, uintCV } from "@stacks/transactions";
import { alice, annie, betty, bob, constructDao, deployer, developer, metadataHash, passProposalByCoreVote, setupSimnet, stxToken, tom, wallace } from "../helpers";
import { bufferFromHex } from "@stacks/transactions/dist/cl";
import { resolveUndisputed } from "./helpers_staking";
import { generateMerkleProof, generateMerkleTreeUsingStandardPrincipal, proofToClarityValue } from "../gating/gating";
import { createBinaryMarket, createBinaryMarketWithGating, predictCategory } from "../categorical/categorical.test";

const simnet = await setupSimnet();

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe("check actual claims vs expected for some scenarios", () => {
  it("Alice stake 100STX on YES, market resolves yes", async () => {
    constructDao(simnet);
    let response = await createBinaryMarket(0, deployer, stxToken);
    response = await predictCategory(alice, 0, 'yay', 100000000, 1);
    await resolveUndisputed(0, true);

    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(stxToken)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(97515000n)));
  });

  it("Alice stakes 100STX on yes, Bob 100STX on NO market resolves yes", async () => {
    constructDao(simnet);
    let response = await createBinaryMarket(0, deployer, stxToken);
    response = await predictCategory(alice, 0, 'yay', 100000000, 1);
    response = await predictCategory(bob, 0, 'nay', 100000000, 0);

    await resolveUndisputed(0, true);

    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(stxToken)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(195030000n)));

    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(stxToken)],
      bob
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10006)));
  });

  it("Alice stakes 100 STX on YES, Bob stakes 50 STX on YES, Tom stakes 200 STX on NO, Annie stakes 20 STX on NO, market resolves NO", async () => {
    constructDao(simnet);
    await passProposalByCoreVote(`bdp001-gating`);
    const allowedCreators = [alice, bob, tom, betty, wallace];
    const { tree, root } = generateMerkleTreeUsingStandardPrincipal(allowedCreators);
    let merdat = generateMerkleProof(tree, alice);
    let response = await createBinaryMarketWithGating(0, proofToClarityValue(merdat.proof), metadataHash(), alice, stxToken)
    response = await predictCategory(alice, 0, 'yay', 100000000, 1);
    response = await predictCategory(bob, 0, 'yay', 50000000, 1);
    response = await predictCategory(developer, 0, 'nay', 200000000, 0);
    response = await predictCategory(annie, 0, 'nay', 200000000, 0);

    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    await resolveUndisputed(0, false);
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(stxToken)],
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10006)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(stxToken)],
      bob
    );
    let stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
    console.log(
      "contractBalance: " +
        stxBalances?.get(deployer + ".bde023-market-predicting")
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10006)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(stxToken)],
      developer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(268166250n)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(stxToken)],
      annie
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(268166250n)));
    stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
    console.log(
      "contractBalance: " +
        stxBalances?.get(deployer + ".bde023-market-predicting")
    );
  });
});

it("Alice stakes 100 STX on YES, Bob stakes 50 STX on YES, Tom stakes 200 STX on NO, Annie stakes 20 STX on NO, market resolves NO", async () => {
    constructDao(simnet);
    let response = await createBinaryMarket(0, deployer, stxToken);
    response = await predictCategory(alice, 0, 'nay', 100000000000, 0, stxToken);
    response = await predictCategory(bob, 0, 'nay', 5000000000000, 0, stxToken);
    response = await predictCategory(developer, 0, 'nay', 20000000000000, 0, stxToken);
    response = await predictCategory(annie, 0, 'nay', 20000000000000, 0, stxToken);

  expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
  await resolveUndisputed(0, false);
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "claim-winnings",
    [Cl.uint(0), Cl.principal(stxToken)],
    alice
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(97515000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "claim-winnings",
    [Cl.uint(0), Cl.principal(stxToken)],
    bob
  );
  let stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance: " +
      stxBalances?.get(deployer + ".bde023-market-predicting")
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(4875750000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "claim-winnings",
    [Cl.uint(0), Cl.principal(stxToken)],
    developer
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(19503000000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "claim-winnings",
    [Cl.uint(0), Cl.principal(stxToken)],
    annie
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(19503000000000n)));
  stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance: " +
      stxBalances?.get(deployer + ".bde023-market-predicting")
  );
});

it("Alice stakes 100 STX on YES, Bob stakes 50 STX on YES, Tom stakes 200 STX on NO, Annie stakes 20 STX on NO, market resolves NO", async () => {
    constructDao(simnet);
    let response = await createBinaryMarket(0, deployer, stxToken);
    response = await createBinaryMarket(1, deployer, stxToken);

    response = await predictCategory(alice, 0, 'nay', 100000000000, 0, stxToken);
    response = await predictCategory(bob, 0, 'nay', 5000000000000, 0, stxToken);
    response = await predictCategory(developer, 0, 'nay', 20000000000000, 0, stxToken);
    response = await predictCategory(annie, 0, 'nay', 20000000000000, 0, stxToken);
    response = await predictCategory(alice, 1, 'nay', 1000000, 0, stxToken);
    response = await predictCategory(bob, 1, 'nay', 5000000000000, 0, stxToken);
    response = await predictCategory(developer, 1, 'nay', 20000000000000, 0, stxToken);
    response = await predictCategory(annie, 1, 'nay', 20000000000000, 0, stxToken);


  await resolveUndisputed(0, false);
  await resolveUndisputed(1, false);

  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "claim-winnings",
    [Cl.uint(0), Cl.principal(stxToken)],
    alice
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(97515000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "claim-winnings",
    [Cl.uint(0), Cl.principal(stxToken)],
    bob
  );
  let stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance: " +
      stxBalances?.get(deployer + ".bde023-market-predicting")
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(4875750000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "claim-winnings",
    [Cl.uint(0), Cl.principal(stxToken)],
    developer
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(19503000000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "claim-winnings",
    [Cl.uint(0), Cl.principal(stxToken)],
    annie
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(19503000000000n)));
  stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance: " +
      stxBalances?.get(deployer + ".bde023-market-predicting")
  );

  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "claim-winnings",
    [Cl.uint(1), Cl.principal(stxToken)],
    alice
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(975150n)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "claim-winnings",
    [Cl.uint(1), Cl.principal(stxToken)],
    bob
  );
  stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance: " +
      stxBalances?.get(deployer + ".bde023-market-predicting")
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(4875750000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "claim-winnings",
    [Cl.uint(1), Cl.principal(stxToken)],
    developer
  );
  let data = await simnet.callReadOnlyFn(
    "bde023-market-predicting",
    "get-market-data",
    [Cl.uint(0)],
    alice
  );
  expect(data.result).toMatchObject(
    Cl.some(
      Cl.tuple({
        creator: principalCV(deployer),
        "market-data-hash": bufferFromHex(metadataHash()),
        "stakes": listCV([uintCV(44649000000000), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0)]),
        "categories": listCV([stringAsciiCV('nay'), stringAsciiCV('yay')]),
        "outcome": someCV(uintCV(0)),
        "resolution-state": uintCV(3),
        concluded: boolCV(true),
      })
    )
  );
  data = await simnet.callReadOnlyFn( 
    "bde023-market-predicting",
    "get-stake-balances",
    [Cl.uint(1), Cl.principal(annie)],
    annie
  );
  expect(data.result).toEqual(
    Cl.some(
      Cl.list([Cl.uint(19800000000000n), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0)])
    )
  );
  stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance 32: " +
      stxBalances?.get(deployer + ".bde023-market-predicting")
  );

  expect(response.result).toEqual(Cl.ok(Cl.uint(19503000000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "claim-winnings",
    [Cl.uint(1), Cl.principal(stxToken)],
    annie
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(19503000000000n)));
  stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance 32: " +
      stxBalances?.get(deployer + ".bde023-market-predicting")
  );
});
