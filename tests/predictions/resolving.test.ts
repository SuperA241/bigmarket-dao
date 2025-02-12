import { describe, expect, it } from "vitest";
import { boolCV, Cl, listCV, noneCV, principalCV, someCV, stringAsciiCV, uintCV } from "@stacks/transactions";
import { alice, bob, constructDao, deployer, metadataHash, setupSimnet, stxToken, tom } from "../helpers";
import { bufferFromHex } from "@stacks/transactions/dist/cl";
import { resolveUndisputed } from "./helpers_staking";
import { createBinaryMarket, predictCategory } from "../categorical/categorical.test";

const simnet = await setupSimnet();

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe("resolving errors", () => {
  it("only dev can resolve", async () => {
    constructDao(simnet);
    let response = await createBinaryMarket(0, deployer, stxToken);
    // not deployer
    response = await simnet.callPublicFn(
      "bme023-0-market-predicting",
      "resolve-market",
      [Cl.uint(0), Cl.stringAscii('nay')],
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10000)));
    // not bob
    response = await simnet.callPublicFn(
      "bme023-0-market-predicting",
      "resolve-market",
      [Cl.uint(0), Cl.stringAscii('nay')],
      tom
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10000)));
    // only alice
    response = await simnet.callPublicFn(
      "bme023-0-market-predicting",
      "resolve-market",
      [Cl.uint(0), Cl.stringAscii('nay')],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
  });

  it("err-market-not-found", async () => {
    constructDao(simnet);
    let response = await createBinaryMarket(0, deployer, stxToken);
    response = await simnet.callPublicFn(
      "bme023-0-market-predicting",
      "resolve-market",
      [Cl.uint(2), Cl.stringAscii('nay')],
      deployer
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10005)));
  });

  it("err-already-concluded", async () => {
    constructDao(simnet);
    let response = await createBinaryMarket(0, deployer, stxToken);
    response = await simnet.callPublicFn(
      "bme023-0-market-predicting", 
      "resolve-market",
      [Cl.uint(0), Cl.stringAscii('yay')],
      bob 
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(1)));
    response = await simnet.callPublicFn(
      "bme023-0-market-predicting",
      "resolve-market", 
      [Cl.uint(0), Cl.stringAscii('nay')], 
      bob
    ); 
    expect(response.result).toEqual(Cl.error(Cl.uint(10020)));
  });
});

describe("resolve market", () => {
  it("resolve market yes", async () => {
    constructDao(simnet);
    let response = await createBinaryMarket(0, deployer, stxToken);
    response = await predictCategory(alice, 0, 'yay', 2000000, 1);
    response = await predictCategory(bob, 0, 'nay', 2000000, 0);
    await resolveUndisputed(0, true);

    const data = await simnet.callReadOnlyFn(
      "bme023-0-market-predicting",
      "get-market-data", 
      [Cl.uint(0)],
      alice
    );
    expect(data.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-data-hash": bufferFromHex(metadataHash()),
          // "resolution-burn-height": uintCV(19),
          "resolution-state": uintCV(3),
          concluded: boolCV(true),
          "stakes": listCV([uintCV(1980000n), uintCV(1980000n), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0)]),
          "categories": listCV([stringAsciiCV('nay'), stringAsciiCV('yay')]),
          "outcome": someCV(uintCV(1)),
        })
      )
    );
  });

  it("resolve market no bids", async () => { 
    constructDao(simnet);
    let response = await createBinaryMarket(0, deployer, stxToken);

    await resolveUndisputed(0, false);

    let data = await simnet.callReadOnlyFn(
      "bme023-0-market-predicting",
      "get-market-data",
      [Cl.uint(0)],
      alice
    );
    expect(data.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-data-hash": bufferFromHex(metadataHash()),
          "stakes": listCV([uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0)]),
          "categories": listCV([stringAsciiCV('nay'), stringAsciiCV('yay')]),
          "outcome": someCV(uintCV(0)),
          "resolution-state": uintCV(3),
          concluded: boolCV(true),
        })
      )
    );

    response = await createBinaryMarket(1, deployer, stxToken);
    await resolveUndisputed(1, true);
    data = await simnet.callReadOnlyFn(
      "bme023-0-market-predicting",
      "get-market-data",
      [Cl.uint(1)],
      alice 
    );
    expect(data.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-data-hash": bufferFromHex(metadataHash()),
          "stakes": listCV([uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0), uintCV(0)]),
          "categories": listCV([stringAsciiCV('nay'), stringAsciiCV('yay')]),
          "outcome": someCV(uintCV(1)),
          "resolution-state": uintCV(3),
          concluded: boolCV(true),
        })
      )
    );
  });
});
