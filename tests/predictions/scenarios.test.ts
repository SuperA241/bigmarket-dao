import { describe, expect, it } from "vitest";
import { boolCV, Cl, principalCV, uintCV } from "@stacks/transactions";
import { alice, annie, betty, bob, constructDao, deployer, developer, metadataHash, passProposalByCoreVote, setupSimnet, stxToken, tom, wallace } from "../helpers";
import { bufferFromHex } from "@stacks/transactions/dist/cl";
import { resolveUndisputed } from "./helpers_staking";
import { generateMerkleProof, generateMerkleTreeUsingStandardPrincipal, proofToClarityValue } from "../gating/gating";

const simnet = await setupSimnet();

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe("check actual claims vs expected for some scenarios", () => {
  it("Alice stake 100STX on YES, market resolves yes", async () => {
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
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(100000000n), Cl.principal(stxToken)], 
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
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
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(100000000n), Cl.principal(stxToken)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(100000000n), Cl.principal(stxToken)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

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
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(100000000n), Cl.principal(stxToken)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(50000000n), Cl.principal(stxToken)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(200000000), Cl.principal(stxToken)],
      developer
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(20000000), Cl.principal(stxToken)],
      annie
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
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
    expect(response.result).toEqual(Cl.ok(Cl.uint(328005000n)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(stxToken)],
      annie
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(32800500n)));
    stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
    console.log(
      "contractBalance: " +
        stxBalances?.get(deployer + ".bde023-market-predicting")
    );
  });
});

it("Alice stakes 100 STX on YES, Bob stakes 50 STX on YES, Tom stakes 200 STX on NO, Annie stakes 20 STX on NO, market resolves NO", async () => {
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
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(100000000000n), Cl.principal(stxToken)],
    alice
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(5000000000000n), Cl.principal(stxToken)],
    bob
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(20000000000000), Cl.principal(stxToken)],
    developer
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(20000000000000), Cl.principal(stxToken)],
    annie
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
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

  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(100000000000n), Cl.principal(stxToken)],
    alice
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(5000000000000n), Cl.principal(stxToken)],
    bob
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(20000000000000), Cl.principal(stxToken)],
    developer
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(20000000000000), Cl.principal(stxToken)],
    annie
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-no-stake",
    [Cl.uint(1), Cl.uint(1000000n), Cl.principal(stxToken)],
    alice
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-no-stake",
    [Cl.uint(1), Cl.uint(5000000000000n), Cl.principal(stxToken)],
    bob
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-no-stake",
    [Cl.uint(1), Cl.uint(20000000000000), Cl.principal(stxToken)],
    developer
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-no-stake",
    [Cl.uint(1), Cl.uint(20000000000000), Cl.principal(stxToken)],
    annie
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

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
        "market-type": uintCV(0),
        "market-data-hash": bufferFromHex(metadataHash()),
        "yes-pool": uintCV(0n),
        "no-pool": uintCV(44649000000000n),
        // "resolution-burn-height": uintCV(0),
        "resolution-state": uintCV(3),
        concluded: boolCV(true),
        outcome: boolCV(false),
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
      Cl.tuple({
        "yes-amount": uintCV(0),
        "no-amount": uintCV(19800000000000n),
      })
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
