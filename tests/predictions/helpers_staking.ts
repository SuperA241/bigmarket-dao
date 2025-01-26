import { Cl } from "@stacks/transactions";
import { expect } from "vitest";
import { bob, deployer, setupSimnet } from "../helpers";

const simnet = await setupSimnet();

export async function resolveUndisputed(marketId: number, outcome: boolean) {
  let response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "resolve-market",
    [Cl.uint(marketId), Cl.bool(outcome)],
    bob
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  simnet.mineEmptyBlocks(145);
  response = await simnet.callPublicFn(
    "bde023-market-staked-predictions",
    "resolve-market-undisputed",
    [Cl.uint(marketId)],
    bob
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
}
