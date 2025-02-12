import { Cl } from "@stacks/transactions";
import { expect } from "vitest";
import { bob, deployer, setupSimnet } from "../helpers";

const simnet = await setupSimnet();

export async function resolveUndisputed(marketId: number, outcome: boolean) {
  let response = await simnet.callPublicFn(
    "bme023-market-predicting",
    "resolve-market",
    [Cl.uint(marketId), Cl.stringAscii(outcome ? 'yay' : 'nay')],
    bob
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(outcome ? 1 : 0)));
  simnet.mineEmptyBlocks(145);
  response = await simnet.callPublicFn(
    "bme023-market-predicting",
    "resolve-market-undisputed",
    [Cl.uint(marketId)],
    bob
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
}
