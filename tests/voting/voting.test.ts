import { assert, describe, expect, it, test } from "vitest";
import { boolCV, Cl, noneCV, principalCV, uintCV } from "@stacks/transactions";
import { alice, betty, bob, constructDao, deployer, metadataHash, setupSimnet, stxToken, tom } from "../helpers";
import { bufferFromHex } from "@stacks/transactions/dist/cl";

const simnet = await setupSimnet();
/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

async function assertMarketData(user:string, yesPool:number, noPool:number, resolutionState:number, concluded:boolean, passed:boolean) {
  const data = await simnet.callReadOnlyFn(
    "bde023-market-predicting",
    "get-market-data",
    [Cl.uint(0)], 
    tom
  );
  return data;
  //console.log('data.result', data.result.value)
  // const result = {
  //   concluded: data.result.value.data.concluded.type === 4,
  //   outcome: (data.result.value.data['outcome']).type === 4,
  //   creator: data.result.value.data.creator,
  //   metaDataHash: data.result.value.data['market-data-hash'],
  //   noPool: Number(data.result.value.data['no-pool'].value) || 0,
  //   yesPool: Number(data.result.value.data['yes-pool'].value) || 0,
  //   token: (data.result.value.data['token']) || undefined,
  //   resolutionBurnHeight: Number((data.result.value.data['resolution-burn-height']).value) || 0,
  //   resolutionState: Number((data.result.value.data['resolution-state']).value) || 0,
  // }
  // return result
}

async function assertVotingData(proposer:string, votesFor:number, votesAg:number, concluded:boolean, passed:boolean, testName?:string) {
  if (testName) console.log(testName)
  const data = await simnet.callReadOnlyFn(
    "bde021-market-voting",
    "get-poll-data",
    [Cl.uint(0)], 
    tom
  );
  return data;

  //console.log('data.result', data.result.value)
  // expect(data.result).toMatchObject(
  //   Cl.some(
  //     Cl.tuple({
  //       "market-data-hash": bufferFromHex(metadataHash()),
  //       "votes-for": uintCV(votesFor),
  //       "votes-against": uintCV(votesAg),
  //       "proposer": principalCV(proposer),
  //       concluded: boolCV(concluded),
  //       passed: boolCV(passed),
  //     }) 
  //   )
  // );
}

async function setUpmarketAndResolve(resolve:boolean) {
  constructDao(simnet);
  let response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "create-market",
    [
      Cl.uint(0), Cl.none(),
      Cl.principal(stxToken),
      Cl.bufferFromHex(metadataHash()),
      Cl.list([]), 
    ],
    deployer
  );
  expect(response.result).toEqual(Cl.ok(Cl.uint(0))); 
  let md = await assertMarketData(deployer, 0, 0, 0, false, false)
  expect(md.result).toMatchObject(
    Cl.some(
      Cl.tuple({
        creator: principalCV(deployer),
        "market-type": uintCV(0),
        "market-data-hash": bufferFromHex(metadataHash()),
        "yes-pool": uintCV(0),
        "no-pool": uintCV(0),
        "resolution-state": uintCV(0),
        concluded: boolCV(false),
        outcome: boolCV(false),
        token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
      }) 
    )
  );

  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-no-stake",
    [Cl.uint(0), Cl.uint(2000000), Cl.principal(stxToken)],
    bob
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "predict-yes-stake",
    [Cl.uint(0), Cl.uint(5000), Cl.principal(stxToken)],
    alice
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  
  response = await simnet.callPublicFn(
    "bde023-market-predicting",
    "resolve-market",
    [Cl.uint(0), Cl.bool(resolve)],
    bob
  );
  expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  return response;

}

describe("voting on resolution", () => {

  it("err-disputer-must-have-stake", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(2000000), Cl.principal(stxToken)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "resolve-market", 
      [Cl.uint(0), Cl.bool(true)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "dispute-resolution",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash()), Cl.principal(alice)],
      bob
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10015)));
    let md = await assertMarketData(deployer, 0, 1980000, 1, false, true)
    expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(0),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(1),
          concluded: boolCV(false),
          outcome: boolCV(true),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
  
  });

  it("err-unauthorised - dao function", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(stxToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(2000000), Cl.principal(stxToken)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(5000), Cl.principal(stxToken)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "resolve-market",
      [Cl.uint(0), Cl.bool(true)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "dispute-resolution",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash()), Cl.principal(alice)],
      bob
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10000)));

  });

  it("staker can create market vote", async () => {
    await setUpmarketAndResolve(true)
    let response = await simnet.callPublicFn(
      "bde021-market-voting",
      "create-market-vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  });

  // it("cant create vote is market resolved undisputed", async () => {
  //   await setUpmarketAndResolve(true)

  //   simnet.mineEmptyBlocks(145);
  //   let response = await simnet.callPublicFn(
  //     "bde023-market-predicting",
  //     "resolve-market-undisputed",
  //     [Cl.uint(0)],
  //     deployer
  //   );
  //   expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    
  //   response = await simnet.callPublicFn(
  //     "bde021-market-voting",
  //     "create-market-vote",
  //     [Cl.uint(0), Cl.bufferFromHex(metadataHash()), Cl.none()],
  //     alice
  //   );
  //   expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  // });

  it("staker can create market vote", async () => {
    await setUpmarketAndResolve(true)
    let response = await simnet.callPublicFn(
      "bde021-market-voting",
      "create-market-vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    let md = await assertMarketData(deployer, 4950, 1980000, 2, false, true);
    expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(2),
          concluded: boolCV(false),
          outcome: boolCV(true),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
    let vd = await assertVotingData(alice, 0, 0, false, false)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(0),
          "votes-against": uintCV(0),
          "proposer": principalCV(alice),
          concluded: boolCV(false),
          passed: boolCV(false),
        }) 
      )
    );
  });

  it("vote cant close before voting window", async () => {
    await setUpmarketAndResolve(true)
    let response = await simnet.callPublicFn(
      "bde021-market-voting",
      "create-market-vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    let md = await assertMarketData(deployer, 4950, 1980000, 2, false, true);
    expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(2),
          concluded: boolCV(false),
          outcome: boolCV(true),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );

    let vd = await assertVotingData(alice, 0, 0, false, false)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(0),
          "votes-against": uintCV(0),
          "proposer": principalCV(alice),
          concluded: boolCV(false),
          passed: boolCV(false),
        }) 
      )
    );
    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "conclude-market-vote",
      [Cl.uint(0)],
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(2113)));

  });

  it("vote can close after voting window with no votes", async () => {
    await setUpmarketAndResolve(true)
    let response = await simnet.callPublicFn(
      "bde021-market-voting",
      "create-market-vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    let md = await assertMarketData(deployer, 4950, 1980000, 2, false, true);
    expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(2),
          concluded: boolCV(false),
          outcome: boolCV(true),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
    let vd = await assertVotingData(alice, 0, 0, false, false)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(0),
          "votes-against": uintCV(0),
          "proposer": principalCV(alice),
          concluded: boolCV(false),
          passed: boolCV(false),
        }) 
      )
    );
    simnet.mineEmptyBlocks(11);
    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "conclude-market-vote",
      [Cl.uint(0)],
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(2113)));

    simnet.mineEmptyBlocks(25);
    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "conclude-market-vote",
      [Cl.uint(0)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(false)));
    md = await assertMarketData(deployer, 4950, 1980000, 3, true, false);
    expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(3),
          concluded: boolCV(true),
          outcome: boolCV(false),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
    vd = await assertVotingData(alice, 0, 0, true, false)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(0),
          "votes-against": uintCV(0),
          "proposer": principalCV(alice),
          concluded: boolCV(true),
          passed: boolCV(false),
        }) 
      )
    );

  });

  it("vote cant vote after end", async () => {
    await setUpmarketAndResolve(false)
    let response = await simnet.callPublicFn(
      "bde021-market-voting",
      "create-market-vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    let md = await assertMarketData(deployer, 4950, 1980000, 2, false, false);
    expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(2),
          concluded: boolCV(false),
          outcome: boolCV(false),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
    let vd = await assertVotingData(alice, 0, 0, false, false)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(0),
          "votes-against": uintCV(0),
          "proposer": principalCV(alice),
          concluded: boolCV(false),
          passed: boolCV(false),
        }) 
      )
    );

    simnet.mineEmptyBlocks(25);

    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash()), Cl.bool(true), Cl.uint(100), Cl.none()],
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(2105)));
    md = await assertMarketData(deployer, 4950, 1980000, 2, false, false);
    vd = await assertVotingData(alice, 0, 0, false, false)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(0),
          "votes-against": uintCV(0),
          "proposer": principalCV(alice),
          concluded: boolCV(false),
          passed: boolCV(false),
        }) 
      )
    );
  });

  it("cant vote with more than current unlocked bdg balance", async () => {
    await setUpmarketAndResolve(false)
    let response = await simnet.callPublicFn(
      "bde021-market-voting",
      "create-market-vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    let md = await assertMarketData(deployer, 4950, 1980000, 2, false, false);
    expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(2),
          concluded: boolCV(false),
          outcome: boolCV(false),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
    let vd = await assertVotingData(alice, 0, 0, false, false)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(0),
          "votes-against": uintCV(0),
          "proposer": principalCV(alice),
          concluded: boolCV(false),
          passed: boolCV(false),
        }) 
      )
    );

    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash()), Cl.bool(true), Cl.uint(100), Cl.none()],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash()), Cl.bool(true), Cl.uint(1000000000), Cl.none()],
      alice
    );
    // vote exceeds
    expect(response.result).toEqual(Cl.error(Cl.uint(1)));
     md = await assertMarketData(deployer, 4950, 1980000, 2, false, false);
     expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(2),
          concluded: boolCV(false),
          outcome: boolCV(false),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
    vd = await assertVotingData(alice, 1, 0, false, false)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(100),
          "votes-against": uintCV(0),
          "proposer": principalCV(alice),
          concluded: boolCV(false),
          passed: boolCV(false),
        }) 
      )
    );
  });

  it("can vote before end", async () => {
    await setUpmarketAndResolve(false)
    let response = await simnet.callPublicFn(
      "bde021-market-voting",
      "create-market-vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    let md = await assertMarketData(deployer, 4950, 1980000, 2, false, false);
    expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(2),
          concluded: boolCV(false),
          outcome: boolCV(false),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
    let vd = await assertVotingData(alice, 0, 0, false, false)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(0),
          "votes-against": uintCV(0),
          "proposer": principalCV(alice),
          concluded: boolCV(false),
          passed: boolCV(false),
        }) 
      )
    );

    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash()), Cl.bool(true), Cl.uint(100), Cl.none()],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash()), Cl.bool(false), Cl.uint(100), Cl.none()],
      tom
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash()), Cl.bool(false), Cl.uint(100), Cl.none()],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
     md = await assertMarketData(deployer, 4950, 1980000, 2, false, false);
     expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(2),
          concluded: boolCV(false),
          outcome: boolCV(false),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
    vd = await assertVotingData(alice, 1, 2, false, false)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(100),
          "votes-against": uintCV(200),
          "proposer": principalCV(alice),
          concluded: boolCV(false),
          passed: boolCV(false),
        }) 
      )
    );
  });

  it("vote closes true with for votes", async () => {
    await setUpmarketAndResolve(true)
    let response = await simnet.callPublicFn(
      "bde021-market-voting",
      "create-market-vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    let md = await assertMarketData(deployer, 4950, 1980000, 2, false, true);
    expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(2),
          concluded: boolCV(false),
          outcome: boolCV(true),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
    let vd = await assertVotingData(alice, 0, 0, false, false)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(0),
          "votes-against": uintCV(0),
          "proposer": principalCV(alice),
          concluded: boolCV(false),
          passed: boolCV(false),
        }) 
      )
    );


    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash()), Cl.bool(true), Cl.uint(100), Cl.none()],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
     md = await assertMarketData(deployer, 4950, 1980000, 2, false, true);
     expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(2),
          concluded: boolCV(false),
          outcome: boolCV(true),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
    vd = await assertVotingData(alice, 1, 0, false, false)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(100),
          "votes-against": uintCV(0),
          "proposer": principalCV(alice),
          concluded: boolCV(false),
          passed: boolCV(false),
        }) 
      )
    );

    simnet.mineEmptyBlocks(25);
    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "conclude-market-vote",
      [Cl.uint(0)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
     md = await assertMarketData(deployer, 4950, 1980000, 3, true, true);
     expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(3),
          concluded: boolCV(true),
          outcome: boolCV(true),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
    vd = await assertVotingData(alice, 1, 0, true, true)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(100),
          "votes-against": uintCV(0),
          "proposer": principalCV(alice),
          concluded: boolCV(true),
          passed: boolCV(true),
        }) 
      )
    );
  });

  it("vote closes true with against votes", async () => {
    await setUpmarketAndResolve(true)
    let response = await simnet.callPublicFn(
      "bde021-market-voting",
      "create-market-vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash())],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    let md = await assertMarketData(deployer, 4950, 1980000, 2, false, true);
    expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(2),
          concluded: boolCV(false),
          outcome: boolCV(true),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
    let vd = await assertVotingData(alice, 0, 0, false, false)

    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(0),
          "votes-against": uintCV(0),
          "proposer": principalCV(alice),
          concluded: boolCV(false),
          passed: boolCV(false),
        }) 
      )
    );

    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash()), Cl.bool(true), Cl.uint(100), Cl.none()],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash()), Cl.bool(false), Cl.uint(100), Cl.none()],
      tom
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "vote",
      [Cl.uint(0), Cl.bufferFromHex(metadataHash()), Cl.bool(false), Cl.uint(100), Cl.none()],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
     md = await assertMarketData(deployer, 4950, 1980000, 2, false, true);
     expect(md.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          creator: principalCV(deployer),
          "market-type": uintCV(0),
          "market-data-hash": bufferFromHex(metadataHash()),
          "yes-pool": uintCV(4950n),
          "no-pool": uintCV(1980000),
          "resolution-state": uintCV(2),
          concluded: boolCV(false),
          outcome: boolCV(true),
          token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
        }) 
      )
    );
    vd = await assertVotingData(alice, 1, 2, false, true)
    expect(vd.result).toMatchObject(
      Cl.some(
        Cl.tuple({
          "market-data-hash": bufferFromHex(metadataHash()),
          "votes-for": uintCV(100),
          "votes-against": uintCV(200),
          "proposer": principalCV(alice),
          concluded: boolCV(false),
          passed: boolCV(false),
        }) 
      )
    );

    simnet.mineEmptyBlocks(25);
    response = await simnet.callPublicFn(
      "bde021-market-voting",
      "conclude-market-vote",
      [Cl.uint(0)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(false)));
    md = await assertMarketData(deployer, 4950, 1980000, 2, true, false);
    expect(md.result).toMatchObject(
     Cl.some(
       Cl.tuple({
         creator: principalCV(deployer),
         "market-type": uintCV(0),
         "market-data-hash": bufferFromHex(metadataHash()),
         "yes-pool": uintCV(4950),
         "no-pool": uintCV(1980000),
         "resolution-state": uintCV(3),
         concluded: boolCV(true),
         outcome: boolCV(false),
         token: Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "wrapped-stx")
       }) 
     )
   );
   vd = await assertVotingData(alice, 1, 2, false, true)
   expect(vd.result).toMatchObject(
     Cl.some(
       Cl.tuple({
         "market-data-hash": bufferFromHex(metadataHash()),
         "votes-for": uintCV(100),
         "votes-against": uintCV(200),
         "proposer": principalCV(alice),
         concluded: boolCV(true),
         passed: boolCV(false),
       }) 
     )
   );

  });

});
