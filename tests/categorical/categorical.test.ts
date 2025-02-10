import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { alice, assertContractBalance, assertDataVarNumber, betty, bob, constructDao, deployer, fred, marketPredicting, metadataHash, setupSimnet, stxToken, tom } from "../helpers";

const simnet = await setupSimnet();

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/
async function printMarketBalances(marketId:number) {
  let data = await simnet.callReadOnlyFn(
    "bde023-market-predicting",
    "get-market-data",
    [Cl.uint(marketId)],
    alice
  );
  //console.log("categories", (data.result as any).value.data.categories)
  //console.log("outcome", (data.result as any).value.data.outcome)
  //console.log("stakes", (data.result as any).value.data.stakes)
}

async function printStakeBalances(user:string, marketId:number) {
  let data = await simnet.callReadOnlyFn(
    "bde023-market-predicting",
    "get-stake-balances",
    [Cl.uint(marketId), Cl.principal(user)],
    alice
  );
  //console.log("get-stake-balances: " + user, (data.result as any).value)

}
export async function createBinaryMarketWithGating(marketId:number, proof:any, key?: any, creator?: string, token?: string, fee?:number) {
  let response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "create-market",
    [
      Cl.list([Cl.stringAscii('nay'), Cl.stringAscii('yay')]), (fee) ? Cl.some(Cl.uint(fee)) : Cl.none(),
      Cl.principal((token) ? token : stxToken),
      Cl.bufferFromHex((key) ? key : metadataHash()),
      proof, Cl.principal(`${deployer}.bde022-market-gating`)
    ], 
    (creator) ? creator : deployer
  );
  if (marketId > 200) {
    expect(response.result).toEqual(Cl.error(Cl.uint(marketId)));
  } else {
    expect(response.result).toEqual(Cl.ok(Cl.uint(marketId)));
  }
  return response
}
export async function createBinaryMarketWithFees(marketId:number, fee:number, creator?: string, token?: string) {
  let response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "create-market",
    [
      Cl.list([Cl.stringAscii('nay'), Cl.stringAscii('yay')]), Cl.some(Cl.uint(fee)),
      Cl.principal((token) ? token : stxToken),
      Cl.bufferFromHex(metadataHash()),
      Cl.list([]), Cl.principal(`${deployer}.bde022-market-gating`)
    ], 
    (creator) ? creator : deployer
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(marketId)));
  return response
}
export async function createBinaryMarketWithErrorCode(errorCode:number, fee?:number, creator?: string, token?: string) {
  let response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "create-market",
    [
      Cl.list([Cl.stringAscii('lion'), Cl.stringAscii('tiger')]), (fee) ? Cl.some(Cl.uint(fee)) : Cl.none(),
      Cl.principal((token) ? token : stxToken),
      Cl.bufferFromHex(metadataHash()),
      Cl.list([]), Cl.principal(`${deployer}.bde022-market-gating`)
    ], 
    (creator) ? creator : deployer
  );
  expect(response.result).toEqual(Cl.error(Cl.uint(errorCode)));
  return response
}
export async function createBinaryMarket(marketId:number, creator?: string, token?: string) {
  let response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "create-market",
    [
      Cl.list([Cl.stringAscii('nay'), Cl.stringAscii('yay')]), Cl.none(),
      Cl.principal((token) ? token : stxToken),
      Cl.bufferFromHex(metadataHash()),
      Cl.list([]), Cl.principal(`${deployer}.bde022-market-gating`)
    ], 
    (creator) ? creator : deployer
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(marketId)));
  return response
}
async function createCategoricalMarket(marketId:number, creator?: string, token?: string) {
  constructDao(simnet);
  let response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "create-market",
    [
      Cl.list([Cl.stringAscii('lion'), Cl.stringAscii('tiger'), Cl.stringAscii('cheetah')]), Cl.none(),
      Cl.principal((token) ? token : stxToken),
      Cl.bufferFromHex(metadataHash()),
      Cl.list([]), Cl.principal(`${deployer}.bde022-market-gating`)
    ], 
    (creator) ? creator : deployer
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(marketId)));
}
export async function predictCategory(user:string, marketId:number, category:string, amount:number, code:number, token?: string) {
  let response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-category",
    [ 
      Cl.uint(marketId), 
      Cl.uint(amount),
      Cl.stringAscii(category),
      Cl.principal((token) ? token : stxToken),
    ],  
    user
  );
  if (code > 10) {
    if (code === 12) {
      expect(response.result).toEqual(Cl.error(Cl.uint(2)));
    } else {
      expect(response.result).toEqual(Cl.error(Cl.uint(code)));
    }
  } else { 
    expect(response.result).toEqual(Cl.ok(Cl.uint(code)));
  }
  return response;
}
async function resolveMarket(marketId:number, category:string, winner: number, token?: string) {
  let response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "resolve-market",
    [Cl.uint(marketId), Cl.stringAscii(category)],
    bob
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(winner)));
  return response 
}
async function resolveMarketUndisputed(marketId:number, code?:number) {
  let response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "resolve-market-undisputed",
    [Cl.uint(marketId)],
    bob 
  );
  if (code) {
    expect(response.result).toEqual(Cl.error(Cl.uint(code)));
  } else {
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  }
}
async function claim(user:string, marketId:number, share:number, code?:number) {
  let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(marketId), Cl.principal(stxToken)],
      user
    );
    if (code) {
      expect(response.result).toEqual(Cl.error(Cl.uint(code)));
    } else {
      expect(response.result).toEqual(Cl.ok(Cl.uint(share)));
    }
  }


describe("claiming errors", () => {
  it("err too few categories", async () => { 
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.list([Cl.stringAscii('lion')]), Cl.none(),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]), Cl.principal(`${deployer}.bde022-market-gating`)
      ],
      deployer
    ); 
    expect(response.result).toEqual(Cl.error(Cl.uint(10024)));
  });

  it("create binary market ok", async () => {
    constructDao(simnet);
    createBinaryMarket(0)
  }); 

  it("create ok", async () => {
    createCategoricalMarket(0)
  }); 

  it("create and stake not ok on unknown category", async () => {
    createCategoricalMarket(0)
    createCategoricalMarket(1)
    predictCategory(alice, 0, 'lionness', 1000, 10023)
  }); 

  it("create and stake ok", async () => {
    createCategoricalMarket(0)
    createCategoricalMarket(1)
    predictCategory(alice, 0, 'lion', 1000, 0)
  }); 
  it("res agent cannot stake", async () => {
    createCategoricalMarket(0)
    createCategoricalMarket(1)
    predictCategory(tom, 0, 'lion', 1000, 12) 
  }); 

  it("create and stake spread ok", async () => {
    createCategoricalMarket(0)
    createCategoricalMarket(1)
    predictCategory(alice, 0, 'lion', 1000, 0)
    predictCategory(bob, 0, 'tiger', 1000, 1)
    predictCategory(betty, 0, 'cheetah', 1000, 2)
  }); 

  it("resolve ok", async () => {
    createCategoricalMarket(0)
    createCategoricalMarket(1)
    predictCategory(alice, 0, 'lion', 1000, 0)
    predictCategory(bob, 0, 'tiger', 1000, 1)
    predictCategory(betty, 0, 'cheetah', 1000, 2)
    resolveMarket(0, 'cheetah', 2);
  }); 

  it("resolve undisputed requires window to elapse", async () => {
    createCategoricalMarket(0)
    createCategoricalMarket(1)
    predictCategory(alice, 0, 'lion', 1000, 0)
    predictCategory(bob, 0, 'tiger', 1000, 1)
    predictCategory(betty, 0, 'cheetah', 1000, 2)
    resolveMarket(0, 'cheetah', 2);
    simnet.mineEmptyBlocks(10);
    resolveMarketUndisputed(0, 10019);
    
  }); 

  it("resolve undisputed requires window to elapse", async () => {
    createCategoricalMarket(0)
    createCategoricalMarket(1)
    predictCategory(alice, 0, 'lion', 1000, 0)
    predictCategory(bob, 0, 'tiger', 1000, 1)
    predictCategory(betty, 0, 'cheetah', 1000, 2)
    resolveMarket(0, 'cheetah', 2);
    simnet.mineEmptyBlocks(25);
    resolveMarketUndisputed(0);
  }); 

  it("resolve undisputed requires window to elapse", async () => {
    createCategoricalMarket(0)
    createCategoricalMarket(1)
    predictCategory(alice, 0, 'lion', 1000, 0)
    predictCategory(bob, 0, 'tiger', 1000, 1)
    predictCategory(betty, 0, 'cheetah', 1000, 2)
    resolveMarket(0, 'cheetah', 2);
    simnet.mineEmptyBlocks(25);
    resolveMarketUndisputed(0);
    assertContractBalance(marketPredicting, 2970n)
  }); 

  it("claim err-user-not-winner-or-claimed", async () => {
    createCategoricalMarket(0)
    createCategoricalMarket(1)
    predictCategory(alice, 0, 'lion', 1000, 0)
    predictCategory(bob, 0, 'tiger', 1000, 1)
    predictCategory(betty, 0, 'cheetah', 1000, 2)
    resolveMarket(0, 'cheetah', 2);
    simnet.mineEmptyBlocks(25);
    resolveMarketUndisputed(0);
    assertContractBalance(marketPredicting, 2970n)
    claim(fred, 0, 80, 10008)
  }); 

  it("claim loser ok", async () => {
    createCategoricalMarket(0)
    createCategoricalMarket(1)
    predictCategory(alice, 0, 'lion', 1000, 0)
    predictCategory(bob, 0, 'tiger', 1000, 1)
    predictCategory(betty, 0, 'cheetah', 1000, 2)
    resolveMarket(0, 'cheetah', 2); 
    simnet.mineEmptyBlocks(25);
    resolveMarketUndisputed(0);
    assertContractBalance(marketPredicting, 2970n)
    claim(alice, 0, 80, 10006)
  }); 

  it("claim winner ok", async () => {
    createCategoricalMarket(0)
    createCategoricalMarket(1)
    predictCategory(alice, 0, 'lion', 1000, 0)
    predictCategory(bob, 0, 'tiger', 1000, 1)
    predictCategory(betty, 0, 'cheetah', 1000, 2)
    const result = await resolveMarket(0, 'cheetah', 2);
    //console.log("claim winner ok",result.events[0].data.value)

    printMarketBalances(0)

    printStakeBalances(alice, 0)
    printStakeBalances(bob, 0)
    printStakeBalances(betty, 0);


    simnet.mineEmptyBlocks(25);
    resolveMarketUndisputed(0);
    assertContractBalance(marketPredicting, 2970n)
    assertDataVarNumber(marketPredicting, 'dev-fee-bips', 100);
    assertDataVarNumber(marketPredicting, 'dao-fee-bips', 150);
    assertDataVarNumber(marketPredicting, 'market-fee-bips-max', 300);
    assertDataVarNumber(marketPredicting, 'market-create-fee', 100000000);
    
    claim(betty, 0, 2926)
  }); 

});
