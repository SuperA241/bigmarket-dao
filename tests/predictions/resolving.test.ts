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
const deployer = accounts.get("deployer")!;
const developer = accounts.get("wallet_8")!;

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe("resolving errors", () => {
  it("only dev can resolve", async () => {
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    // not deployer
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(false)],
      deployer
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10000)));
    // not bob
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(false)],
      bob
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10000)));
    // only alice
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(false)],
      developer
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  });

  it("err-market-not-found", async () => {
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(1), Cl.bufferFromHex(metadataHash())],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(2), Cl.bool(false)],
      developer
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10005)));
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
      "resolve-market",
      [Cl.uint(0), Cl.bool(false)],
      developer
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(false)],
      developer
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10004)));
  });
});

describe("resolve market", () => {
  it("resolve market yes", async () => {
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
      [Cl.uint(0), Cl.uint(2000000)],
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
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(2000000 - (2 * 2000000) / 100),
          "no-pool": uintCV(2000000 - (2 * 2000000) / 100),
          concluded: boolCV(true),
          outcome: boolCV(true),
        })
      )
    );
  });

  it("resolve market no bids", async () => {
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(false)],
      developer
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
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(0),
          "no-pool": uintCV(0),
          concluded: boolCV(true),
          outcome: boolCV(false),
        })
      )
    );
  });
});
