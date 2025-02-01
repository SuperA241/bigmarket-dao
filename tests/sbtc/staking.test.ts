import { describe, expect, it } from "vitest";
import { boolCV, Cl, principalCV, uintCV } from "@stacks/transactions";
import { constructDao, metadataHash, setupSimnet, sbtcToken } from "../helpers";
import { bufferFromHex } from "@stacks/transactions/dist/cl";

const simnet = await setupSimnet();
const accounts = simnet.getAccounts();
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const deployer = accounts.get("deployer")!;

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe("prediction errors", () => {
  it("user can't commit more than their balance", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(), 
        Cl.principal(sbtcToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(1000000000000000000000000000000000000n), Cl.principal(sbtcToken)],
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10011)));
  });

  it("err-wrong-market-type", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(1), Cl.none(),
        Cl.principal(sbtcToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(1000000), Cl.principal(sbtcToken)], // 1 STX
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10003)));
  });

  it("err-already-concluded", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(sbtcToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(1000000), Cl.principal(sbtcToken)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    // conclude
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "resolve-market",
      [Cl.uint(0), Cl.bool(true)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(1000000), Cl.principal(sbtcToken)],
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10018)));
  });
});

describe("prediction fees and stakes", () => {
  it("user transfers exact stake", async () => {
    constructDao(simnet);
    let balances = simnet.getAssetsMap().get("STX");
    // console.log("prediction fees and stakes:", balances);

    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(sbtcToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(2000000), Cl.principal(sbtcToken)], // 1 STX
      alice
    );

    balances = simnet.getAssetsMap().get("STX");

    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(10000000), Cl.principal(sbtcToken)], // 1 STX
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    const data = await simnet.callReadOnlyFn(
      "bde023-market-predicting",
      "get-market-data",
      [Cl.uint(0)],
      alice
    );
    expect(data.result).toEqual(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(1980000n),
          "no-pool": uintCV(9900000n),
          "resolution-burn-height": uintCV(0),
          "resolution-state": uintCV(0),
          "market-fee-bips": uintCV(0),
          concluded: boolCV(false),
          outcome: boolCV(false),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","sbtc")
        })
      )
    );
  });

  it("fees are collected up front from prediction stakes", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(sbtcToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(2000000), Cl.principal(sbtcToken)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(10000000), Cl.principal(sbtcToken)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    const data = await simnet.callReadOnlyFn(
      "bde023-market-predicting",
      "get-market-data",
      [Cl.uint(0)],
      alice
    );
    expect(data.result).toEqual(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(1980000n),
          "no-pool": uintCV(9900000n),
          "resolution-burn-height": uintCV(0),
          "resolution-state": uintCV(0),
          "market-fee-bips": uintCV(0),
          concluded: boolCV(false),
          outcome: boolCV(false),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","sbtc")
        })
      )
    );
  });

  it("alice hedges yes and no", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(sbtcToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );

    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(2000000), Cl.principal(sbtcToken)], // 1 STX
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

    // check stake
    let aliceStake = simnet.getMapEntry(
      "bde023-market-predicting",
      "stake-balances",
      Cl.tuple({
        "market-id": uintCV(0),
        user: principalCV(alice),
      })
    );
    expect(aliceStake).toEqual(
      Cl.some(
        Cl.tuple({
          "yes-amount": uintCV(1980000n),
          "no-amount": uintCV(0),
        })
      )
    );

    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(4000000), Cl.principal(sbtcToken)], // 1 STX
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

    aliceStake = simnet.getMapEntry( 
      "bde023-market-predicting",
      "stake-balances",
      Cl.tuple({
        "market-id": uintCV(0),
        user: principalCV(alice),
      })
    );
    expect(aliceStake).toEqual(
      Cl.some(
        Cl.tuple({
          "yes-amount": uintCV(1980000n),
          "no-amount": uintCV(3960000n),
        })
      )
    );
  });
});
