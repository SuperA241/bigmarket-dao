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

const acc = simnet.getAccounts();
const alice = acc.get("wallet_1")!;
const bob = acc.get("wallet_2")!;
const deployer = accounts.get("deployer")!;

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe("prediction contract", () => {
  it("ensures the contract is deployed", () => {
    const contractSource = simnet.getContractSource(
      "bde023-market-staked-predictions"
    );
    expect(contractSource).toBeDefined();
  });

  it("setup market - unknown market type does not work", async () => {
    const response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(3), Cl.bufferFromHex(metadataHash())],
      deployer
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10001)));
  });

  it("setup market with market share type works", async () => {
    const response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
  });

  it("setup market with market stake type works", async () => {
    const response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(1), Cl.bufferFromHex(metadataHash())],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
  });

  it("setup two share type markets works", async () => {
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(1)));
  });

  it("ensure market data is as expected", async () => {
    let response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-staked-predictions",
      "create-market",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(1)));

    const data = await simnet.callReadOnlyFn(
      "bde023-market-staked-predictions",
      "get-market-data",
      [Cl.uint(0)],
      bob
    );
    expect(data.result).toEqual(
      Cl.some(
        Cl.tuple({
          creator: principalCV(alice),
          "market-type": uintCV(0),
          "metadata-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(0),
          "no-pool": uintCV(0),
          concluded: boolCV(false),
          outcome: boolCV(false),
        })
      )
    );
  });
});
