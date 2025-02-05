import { describe, expect, it } from "vitest";
import { Cl, principalCV, uintCV } from "@stacks/transactions";
import { alice, bob, constructDao, deployer, metadataHash, setupSimnet, stxToken } from "../helpers";
import { createBinaryMarketWithFees, predictCategory } from "../categorical/categorical.test";
 
const simnet = await setupSimnet();

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/


describe("successful claim", () => {
  it("bob wins 50% of pool", async () => {
    constructDao(simnet);
    let response = await createBinaryMarketWithFees(0, 200, deployer, stxToken);
    response = await predictCategory(bob, 0, 'yay', 5000, 1);
    response = await predictCategory(alice, 0, 'yay', 5000, 1);

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
        Cl.list([Cl.uint(0), Cl.uint(4950n), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0)])
      ) 
    );

    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "resolve-market",
      [Cl.uint(0), Cl.stringAscii('yay')],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(1)));

    simnet.mineEmptyBlocks(10);
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "resolve-market-undisputed",
      [Cl.uint(0)],
      deployer
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10019)));

    simnet.mineEmptyBlocks(145);
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "resolve-market-undisputed",
      [Cl.uint(0)],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

    let data = await simnet.callReadOnlyFn(
      "bde023-market-predicting",
      "get-stake-balances", 
      [Cl.uint(0), Cl.principal(alice)],
      alice
    );
    expect(data.result).toEqual(
      Cl.some(
        Cl.list([Cl.uint(0), Cl.uint(4950n), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0)])
      )
    );
    let stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
    console.log(
      "contractBalance 215: " +
        stxBalances?.get(deployer + ".bde023-market-predicting")
    );

    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(stxToken)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(4777n)));

    stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
    console.log(
      "contractBalance 272: " +
        stxBalances?.get(deployer + ".bde023-market-predicting")
    );

    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(stxToken)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(4777n)));
    stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
    console.log(
      "contractBalance 285: " +
        stxBalances?.get(deployer + ".bde023-market-predicting")
    );
  });
  
});
