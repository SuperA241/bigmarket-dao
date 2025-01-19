import { describe, expect, it } from "vitest";
import { boolCV, Cl, principalCV, uintCV } from "@stacks/transactions";
import { initSimnet } from "@hirosystems/clarinet-sdk";
import { metadataHash } from "../helpers";
import { bufferFromHex } from "@stacks/transactions/dist/cl";

async function setupSimnet() {
  return await initSimnet();
}

const simnet = await setupSimnet(); // Ensure proper initialization
const accounts = simnet.getAccounts();

const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const tom = accounts.get("wallet_3")!;
const annie = accounts.get("wallet_4")!;
const deployer = accounts.get("deployer")!;
const developer = accounts.get("wallet_8")!;

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe("check actual claims vs expected for some scenarios", () => {
  it("Alice stake 100STX on YES, market resolves yes", async () => {
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(100000000n)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(true)],
      developer
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "claim-winnings",
      [Cl.uint(0)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(96040000n)));
  });

  it("Alice stakes 100STX on yes, Bob 100STX on NO market resolves yes", async () => {
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(100000000n)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(100000000n)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(true)],
      developer
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "claim-winnings",
      [Cl.uint(0)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(192080000n)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "claim-winnings",
      [Cl.uint(0)],
      bob
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10006)));
  });

  it("Alice stakes 100 STX on YES, Bob stakes 50 STX on YES, Tom stakes 200 STX on NO, Annie stakes 20 STX on NO, market resolves NO", async () => {
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(100000000n)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(50000000n)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(200000000)],
      tom
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(20000000)],
      annie
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(false)],
      developer
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "claim-winnings",
      [Cl.uint(0)],
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10006)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "claim-winnings",
      [Cl.uint(0)],
      bob
    );
    let stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
    console.log(
      "contractBalance: " +
        stxBalances?.get(deployer + ".bde023-market-staked-predictions")
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10006)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "claim-winnings",
      [Cl.uint(0)],
      tom
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(323043636n)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "claim-winnings",
      [Cl.uint(0)],
      annie
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(32304364n)));
    stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
    console.log(
      "contractBalance: " +
        stxBalances?.get(deployer + ".bde023-market-staked-predictions")
    );
  });
});

it("Alice stakes 100 STX on YES, Bob stakes 50 STX on YES, Tom stakes 200 STX on NO, Annie stakes 20 STX on NO, market resolves NO", async () => {
  let response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "create-market",
    [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
    deployer
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(100000000000n)],
    alice
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(5000000000000n)],
    bob
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(20000000000000)],
    tom
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(20000000000000)],
    annie
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "resolve-market",
    [Cl.uint(0), Cl.bool(false)],
    developer
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "claim-winnings",
    [Cl.uint(0)],
    alice
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(96040000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "claim-winnings",
    [Cl.uint(0)],
    bob
  );
  let stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance: " +
      stxBalances?.get(deployer + ".bde023-market-staked-predictions")
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(4802000000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "claim-winnings",
    [Cl.uint(0)],
    tom
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(19208000000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "claim-winnings",
    [Cl.uint(0)],
    annie
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(19208000000000n)));
  stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance: " +
      stxBalances?.get(deployer + ".bde023-market-staked-predictions")
  );
});

it("Alice stakes 100 STX on YES, Bob stakes 50 STX on YES, Tom stakes 200 STX on NO, Annie stakes 20 STX on NO, market resolves NO", async () => {
  let response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "create-market",
    [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
    deployer
  );
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "create-market",
    [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
    deployer
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(1)));

  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(100000000000n)],
    alice
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(5000000000000n)],
    bob
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(20000000000000)],
    tom
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(20000000000000)],
    annie
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "predict-no-stake",
    [Cl.uint(1), Cl.uint(1000000n)],
    alice
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "predict-no-stake",
    [Cl.uint(1), Cl.uint(5000000000000n)],
    bob
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "predict-no-stake",
    [Cl.uint(1), Cl.uint(20000000000000)],
    tom
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "predict-no-stake",
    [Cl.uint(1), Cl.uint(20000000000000)],
    annie
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "resolve-market",
    [Cl.uint(0), Cl.bool(false)],
    developer
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "resolve-market",
    [Cl.uint(1), Cl.bool(false)],
    developer
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "claim-winnings",
    [Cl.uint(0)],
    alice
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(96040000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "claim-winnings",
    [Cl.uint(0)],
    bob
  );
  let stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance: " +
      stxBalances?.get(deployer + ".bde023-market-staked-predictions")
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(4802000000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "claim-winnings",
    [Cl.uint(0)],
    tom
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(19208000000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "claim-winnings",
    [Cl.uint(0)],
    annie
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(19208000000000n)));
  stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance: " +
      stxBalances?.get(deployer + ".bde023-market-staked-predictions")
  );

  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "claim-winnings",
    [Cl.uint(1)],
    alice
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(960400n)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "claim-winnings",
    [Cl.uint(1)],
    bob
  );
  stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance: " +
      stxBalances?.get(deployer + ".bde023-market-staked-predictions")
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(4802000000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "claim-winnings",
    [Cl.uint(1)],
    tom
  );
  let data = await simnet.callReadOnlyFn(
    "bde023-market-staked-predictions",
    "get-market-data",
    [Cl.uint(0)],
    alice
  );
  expect(data.result).toEqual(
    Cl.some(
      Cl.tuple({
        creator: principalCV(deployer),
        "market-type": uintCV(0),
        "metadata-hash": bufferFromHex(metadataHash()),
        "yes-pool": uintCV(0n),
        "no-pool": uintCV(44198000000000n),
        concluded: boolCV(true),
        outcome: boolCV(false),
      })
    )
  );

  data = await simnet.callReadOnlyFn(
    "bde023-market-staked-predictions",
    "get-stake-balances",
    [Cl.uint(1), Cl.principal(annie)],
    annie
  );
  expect(data.result).toEqual(
    Cl.some(
      Cl.tuple({
        "yes-amount": uintCV(0),
        "no-amount": uintCV(19600000000000n),
      })
    )
  );
  stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance 32: " +
      stxBalances?.get(deployer + ".bde023-market-staked-predictions")
  );

  expect(response.result).toEqual(Cl.ok(Cl.uint(19208000000000n)));
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "claim-winnings",
    [Cl.uint(1)],
    annie
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(19208000000000n)));
  stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
  console.log(
    "contractBalance 32: " +
      stxBalances?.get(deployer + ".bde023-market-staked-predictions")
  );
});
