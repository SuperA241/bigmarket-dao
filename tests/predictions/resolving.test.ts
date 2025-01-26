import { describe, expect, it } from "vitest";
import { boolCV, Cl, principalCV, uintCV } from "@stacks/transactions";
import { alice, bob, constructDao, deployer, metadataHash, setupSimnet, stxToken, tom } from "../helpers";
import { bufferFromHex } from "@stacks/transactions/dist/cl";
import { resolveUndisputed } from "./helpers_staking";

const simnet = await setupSimnet();

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe("resolving errors", () => {
  it("only dev can resolve", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market", 
      [ 
        Cl.uint(0),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),  
        Cl.list([]),
      ],
      deployer
    ); 
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    // not deployer
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(false)],
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10000)));
    // not bob
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(false)],
      tom
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10000)));
    // only alice
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(false)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  });

  it("err-market-not-found", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market", 
      [
        Cl.uint(1),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(2), Cl.bool(false)],
      deployer
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10005)));
  });

  it("err-already-concluded", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [
        Cl.uint(0),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(false)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "resolve-market",
      [Cl.uint(0), Cl.bool(false)],
      bob
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10018)));
  });
});

describe("resolve market", () => {
  it("resolve market yes", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [
        Cl.uint(0),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn( 
      "bde023-market-staked-predictions",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(2000000), Cl.principal(stxToken)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(2000000), Cl.principal(stxToken)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    await resolveUndisputed(0, true);

    const data = await simnet.callReadOnlyFn(
      "bde023-market-staked-predictions",
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
          "yes-pool": uintCV(2000000 - (2 * 2000000) / 100),
          "no-pool": uintCV(2000000 - (2 * 2000000) / 100),
          // "resolution-burn-height": uintCV(19),
          "resolution-state": uintCV(3),
          concluded: boolCV(true),
          outcome: boolCV(true),
        })
      )
    );
  });

  it("resolve market no bids", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [
        Cl.uint(0),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));

    await resolveUndisputed(0, false);

    let data = await simnet.callReadOnlyFn(
      "bde023-market-staked-predictions",
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
          "yes-pool": uintCV(0),
          "no-pool": uintCV(0),
          // "resolution-burn-height": uintCV(19),
          "resolution-state": uintCV(3),
          concluded: boolCV(true),
          outcome: boolCV(false),
        })
      )
    );

    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [
        Cl.uint(0),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(1)));
    await resolveUndisputed(1, true);
    data = await simnet.callReadOnlyFn(
      "bde023-market-staked-predictions",
      "get-market-data",
      [Cl.uint(1)],
      alice
    );
    expect(data.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(0),
          "no-pool": uintCV(0),
          // "resolution-burn-height": uintCV(19),
          "resolution-state": uintCV(3),
          concluded: boolCV(true),
          outcome: boolCV(true),
        })
      )
    );
  });
});
