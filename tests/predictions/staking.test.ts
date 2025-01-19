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
// console.log("accounts: ", accounts);
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const developer = accounts.get("wallet_8")!;
const deployer = accounts.get("deployer")!;

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe("prediction errors", () => {
  it("user can't commit more than their balance", async () => {
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
      [Cl.uint(0), Cl.uint(1000000000000000000000000000000000000n)],
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10011)));
  });

  it("err-wrong-market-type", async () => {
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(1), Cl.bufferFromHex(metadataHash())],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(1000000)], // 1 STX
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10003)));
  });

  it("err-already-concluded", async () => {
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
      [Cl.uint(0), Cl.uint(1000000)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    // conclude
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(true)],
      developer
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(1000000)],
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10004)));
  });
});

describe("prediction fees and stakes", () => {
  it("user transfers exact stake", async () => {
    let balances = simnet.getAssetsMap().get("STX");
    // console.log("prediction fees and stakes:", balances);

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
      [Cl.uint(0), Cl.uint(2000000)], // 1 STX
      alice
    );

    balances = simnet.getAssetsMap().get("STX");

    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(10000000)], // 1 STX
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    const data = await simnet.callReadOnlyFn(
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
          "yes-pool": uintCV(2000000 - (2 * 2000000) / 100),
          "no-pool": uintCV(10000000 - (2 * 10000000) / 100),
          concluded: boolCV(false),
          outcome: boolCV(false),
        })
      )
    );
  });

  it("fees are collected up front from prediction stakes", async () => {
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
      [Cl.uint(0), Cl.uint(2000000)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(10000000)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    const data = await simnet.callReadOnlyFn(
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
          "yes-pool": uintCV(2000000 - (2 * 2000000) / 100),
          "no-pool": uintCV(10000000 - (2 * 10000000) / 100),
          concluded: boolCV(false),
          outcome: boolCV(false),
        })
      )
    );
  });

  it("alice hedges yes and no", async () => {
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
      [Cl.uint(0), Cl.uint(2000000)], // 1 STX
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

    // check stake
    let aliceStake = simnet.getMapEntry(
      "bde023-market-staked-predictions",
      "stake-balances",
      Cl.tuple({
        "market-id": uintCV(0),
        user: principalCV(alice),
      })
    );
    expect(aliceStake).toEqual(
      Cl.some(
        Cl.tuple({
          "yes-amount": uintCV(2000000 - (2000000 * 2) / 100),
          "no-amount": uintCV(0),
        })
      )
    );

    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(4000000)], // 1 STX
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

    aliceStake = simnet.getMapEntry(
      "bde023-market-staked-predictions",
      "stake-balances",
      Cl.tuple({
        "market-id": uintCV(0),
        user: principalCV(alice),
      })
    );
    expect(aliceStake).toEqual(
      Cl.some(
        Cl.tuple({
          "yes-amount": uintCV(2000000 - (2000000 * 2) / 100),
          "no-amount": uintCV(4000000 - (4000000 * 2) / 100),
        })
      )
    );
  });
});
