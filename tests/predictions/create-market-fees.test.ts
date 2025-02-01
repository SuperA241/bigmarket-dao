import { assert, describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { alice, allowMarketCreators, assertContractBalance, assertDataVarNumber, assertStakeBalance, assertUserBalance, betty, bob, constructDao, deployer, fred, marketPredicting, metadataHash, passProposalByExecutiveSignals, setupSimnet, stxToken, tom, treasury, wallace } from "../helpers";
import { proofToClarityValue } from "../gating/gating";

const simnet = await setupSimnet();

describe("prediction contract", () => {

    it("ensure creation fee is paid", async () => {
      constructDao(simnet);
      await passProposalByExecutiveSignals(simnet, 'bdp001-market-fees');

      assertDataVarNumber(marketPredicting, 'dev-fee-bips', 500);
      assertDataVarNumber(marketPredicting, 'dao-fee-bips', 500);
      assertDataVarNumber(marketPredicting, 'market-fee-bips-max', 1000);
      assertDataVarNumber(marketPredicting, 'market-create-fee', 1000);
 
      const response = await simnet.callPublicFn(
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
      // console.log(response.events[0].data)
      expect(response.events[0].data).toMatchObject(
        {
          amount: "1000",
          memo: "",
          recipient: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bde006-treasury",
          sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        }
      );
    });


    it("ensure create market fee is paid", async () => {
      constructDao(simnet);
      await passProposalByExecutiveSignals(simnet, 'bdp001-market-fees');

      assertDataVarNumber(marketPredicting, 'dev-fee-bips', 500);
      assertDataVarNumber(marketPredicting, 'dao-fee-bips', 500);
      assertDataVarNumber(marketPredicting, 'market-fee-bips-max', 1000);
      assertDataVarNumber(marketPredicting, 'market-create-fee', 1000);
 
      const response = await simnet.callPublicFn(
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
      // console.log(response.events[0].data)
      expect(response.events[0].data).toMatchObject(
        {
          amount: "1000",
          memo: "",
          recipient: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bde006-treasury",
          sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        }
      );

      await passProposalByExecutiveSignals(simnet, 'bdp001-market-fees-1');

      assertDataVarNumber(marketPredicting, 'dev-fee-bips', 500);
      assertDataVarNumber(marketPredicting, 'dao-fee-bips', 500);
      assertDataVarNumber(marketPredicting, 'market-fee-bips-max', 0);
      assertDataVarNumber(marketPredicting, 'market-create-fee', 0);
    });

    it("ensure market fee cant exceed max", async () => {
      constructDao(simnet);
      await passProposalByExecutiveSignals(simnet, 'bdp001-market-fees');
      const response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "create-market",
        [
          Cl.uint(0), Cl.some(Cl.uint(1001)),
          Cl.principal(stxToken),
          Cl.bufferFromHex(metadataHash()),
          Cl.list([]),
        ],
        deployer
      );
      expect(response.result).toEqual(Cl.error(Cl.uint(10022)));
    });

    it("ensure betty pays the market creat fee of 1000 but receives 10% of alice winnings", async () => {
      constructDao(simnet);
      await passProposalByExecutiveSignals(simnet, 'bdp001-market-fees');
      assertDataVarNumber(marketPredicting, 'dev-fee-bips', 500);
      assertDataVarNumber(marketPredicting, 'dao-fee-bips', 500);
      assertDataVarNumber(marketPredicting, 'market-fee-bips-max', 1000);
      assertDataVarNumber(marketPredicting, 'market-create-fee', 1000);
      assertUserBalance(deployer, 100000000000000n)

      const proof = await allowMarketCreators(betty);

      let response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "create-market",
        [
          Cl.uint(0), Cl.some(Cl.uint(1000)),
          Cl.principal(stxToken), 
          Cl.bufferFromHex(metadataHash()),
          proofToClarityValue(proof),
        ],
        betty 
      );
      expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "predict-yes-stake",
        [Cl.uint(0), Cl.uint(10000), Cl.principal(stxToken)],
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
  
      simnet.mineEmptyBlocks(146);
      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "resolve-market-undisputed",
        [Cl.uint(0)],
        deployer
      );
      expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

      assertStakeBalance(alice, 9500, 0)
      assertContractBalance(marketPredicting, 9500n) 

      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "claim-winnings",
        [Cl.uint(0), Cl.principal(stxToken)],
        alice
      );
      expect(response.result).toEqual(Cl.ok(Cl.uint(8075)));

      // betty pays thed market creat fee of 1000 but receives 10% of alice winnings
      assertUserBalance(alice, 99999999998075n)
      assertUserBalance(betty, 100000000000000n - 1000n + 950n)
      assertUserBalance(deployer, 100000000000000n)
      assertStakeBalance(alice, 0, 0)
      assertContractBalance(marketPredicting, 0n)
      assertContractBalance(treasury, 1475n)
    });
  
    it("ensure fees are correct with 4 users", async () => {
      constructDao(simnet);
      await passProposalByExecutiveSignals(simnet, 'bdp001-market-fees');
      assertDataVarNumber(marketPredicting, 'dev-fee-bips', 500);
      assertDataVarNumber(marketPredicting, 'dao-fee-bips', 500);
      assertDataVarNumber(marketPredicting, 'market-fee-bips-max', 1000);
      assertDataVarNumber(marketPredicting, 'market-create-fee', 1000);
      assertUserBalance(deployer, 100000000000000n)

      const proof = await allowMarketCreators(betty);

      let response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "create-market",
        [
          Cl.uint(0), Cl.some(Cl.uint(1000)),
          Cl.principal(stxToken), 
          Cl.bufferFromHex(metadataHash()),
          proofToClarityValue(proof),
        ],
        betty 
      );
      expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
      // ----- staking ------------------------
      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "predict-yes-stake",
        [Cl.uint(0), Cl.uint(100_000_000), Cl.principal(stxToken)],
        alice
      );
      expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "predict-yes-stake",
        [Cl.uint(0), Cl.uint(100_000_000), Cl.principal(stxToken)],
        bob
      );
      expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "predict-no-stake",
        [Cl.uint(0), Cl.uint(100_000_000), Cl.principal(stxToken)],
        tom
      );
      expect(response.result).toEqual(Cl.error(Cl.uint(2))); // tom is dev fund - can't transfer to him self
      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "predict-no-stake",
        [Cl.uint(0), Cl.uint(100_000_000), Cl.principal(stxToken)],
        fred
      );
      expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "predict-no-stake",
        [Cl.uint(0), Cl.uint(100_000_000), Cl.principal(stxToken)],
        wallace
      );
      expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
      // ----- resolving ------------------------
      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "resolve-market",
        [Cl.uint(0), Cl.bool(false)],
        bob
      );
      expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
  
      simnet.mineEmptyBlocks(146);
      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "resolve-market-undisputed",
        [Cl.uint(0)],
        deployer
      );
      expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

      assertStakeBalance(alice, 95000000, 0)
      assertContractBalance(marketPredicting, 380000000n) 

      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "claim-winnings",
        [Cl.uint(0), Cl.principal(stxToken)],
        alice
      );
      expect(response.result).toEqual(Cl.error(Cl.uint(10006)));
      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "claim-winnings",
        [Cl.uint(0), Cl.principal(stxToken)],
        bob
      );
      expect(response.result).toEqual(Cl.error(Cl.uint(10006)));

      assertStakeBalance(alice, 95000000, 0)
      assertStakeBalance(bob, 95000000, 0)
      assertStakeBalance(fred, 0, 95000000)
      assertStakeBalance(wallace, 0, 95000000)

      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "claim-winnings",
        [Cl.uint(0), Cl.principal(stxToken)],
        fred
      );
      expect(response.result).toEqual(Cl.ok(Cl.uint(161500000)));
      response = await simnet.callPublicFn(
        "bde023-market-predicting",
        "claim-winnings",
        [Cl.uint(0), Cl.principal(stxToken)],
        wallace
      );
      expect(response.result).toEqual(Cl.ok(Cl.uint(161500000)));

      // betty pays thed market creat fee of 1000 but receives 10% of alice winnings
      assertUserBalance(alice, 99999900000000n)
      assertUserBalance(betty, 100000037999000n)
      assertUserBalance(deployer, 100000000000000n)
      assertStakeBalance(alice, 95000000, 0)
      assertStakeBalance(bob, 95000000, 0)
      assertStakeBalance(fred, 0, 0)
      assertStakeBalance(wallace, 0, 0)
      assertContractBalance(marketPredicting, 0n)
      assertContractBalance(treasury, 19001000n)
    });
  
  });
