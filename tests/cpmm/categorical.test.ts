import { describe, expect, it } from 'vitest';
import { Cl } from '@stacks/transactions';
import {
	alice,
	assertContractBalance,
	assertDataVarNumber,
	betty,
	bob,
	constructDao,
	deployer,
	developer,
	fred,
	marketPredictingCPMM,
	metadataHash,
	piedro,
	reputationSft,
	setupSimnet,
	stxToken,
	tom,
	wallace
} from '../helpers';

const simnet = await setupSimnet();

async function assertBalance(user: string, tier: number, balance: number) {
	let bal = simnet.callReadOnlyFn(`${deployer}.${reputationSft}`, 'get-balance', [Cl.uint(tier), Cl.principal(user)], user);
	expect(bal.result).toEqual(Cl.ok(Cl.uint(balance * 2)));
}

describe('claiming errors', () => {
	it('err too few categories', async () => {
		constructDao(simnet);
		let response = await simnet.callPublicFn(
			'bme024-0-market-predicting',
			'create-market',
			[
				Cl.list([Cl.stringAscii('lion')]),
				Cl.none(),
				Cl.principal(stxToken),
				Cl.bufferFromHex(metadataHash()),
				Cl.list([]),
				Cl.principal(`${deployer}.bme022-0-market-gating`),
				Cl.uint(100000000)
			],
			deployer
		);
		expect(response.result).toEqual(Cl.error(Cl.uint(10024)));
	});

	it('create binary market ok', async () => {
		constructDao(simnet);
		createBinaryMarket(0);
	});

	it('create ok', async () => {
		createCategoricalMarket(0);
		assertBalance(deployer, 6, 4);
	});

	it('create and stake not ok on unknown category', async () => {
		createCategoricalMarket(0);
		assertBalance(deployer, 6, 4);
		createCategoricalMarket(1);
		assertBalance(deployer, 6, 8);
		predictCategory(alice, 0, 'lionness', 1000, 10023);
	});

	it('create and stake ok', async () => {
		createCategoricalMarket(0);
		predictCategory(alice, 0, 'lion', 1000, 0);
	});
	it('res agent cannot stake', async () => {
		createCategoricalMarket(0);
		predictCategory(tom, 0, 'lion', 1000, 12);
	});

	it('create and stake spread ok', async () => {
		createCategoricalMarket(0);
		predictCategory(alice, 0, 'lion', 1000, 0);
		predictCategory(bob, 0, 'tiger', 1000, 1);
		predictCategory(betty, 0, 'cheetah', 1000, 2);
	});

	it('resolve ok', async () => {
		createCategoricalMarket(0);
		predictCategory(alice, 0, 'lion', 1000, 0);
		predictCategory(bob, 0, 'tiger', 1000, 1);
		predictCategory(betty, 0, 'cheetah', 1000, 2);
		resolveMarket(0, 'cheetah', 2);
	});

	it('resolve undisputed requires window to elapse', async () => {
		createCategoricalMarket(0);
		predictCategory(alice, 0, 'lion', 1000, 0);
		predictCategory(bob, 0, 'tiger', 1000, 1);
		predictCategory(betty, 0, 'cheetah', 1000, 2);
		resolveMarket(0, 'cheetah', 2);
		simnet.mineEmptyBlocks(10);
		resolveMarketUndisputed(0, 10019);
	});

	it('resolve undisputed requires window to elapse', async () => {
		createCategoricalMarket(0);
		predictCategory(alice, 0, 'lion', 1000, 0);
		predictCategory(bob, 0, 'tiger', 1000, 1);
		predictCategory(betty, 0, 'cheetah', 1000, 2);
		resolveMarket(0, 'cheetah', 2);
		simnet.mineEmptyBlocks(25);
		resolveMarketUndisputed(0);
	});

	it('resolve undisputed requires window to elapse', async () => {
		createCategoricalMarket(0);
		predictCategory(alice, 0, 'lion', 1000000, 0);
		predictCategory(bob, 0, 'tiger', 1000000, 1);
		predictCategory(betty, 0, 'cheetah', 1000000, 2);
		resolveMarket(0, 'cheetah', 2);
		simnet.mineEmptyBlocks(25);
		resolveMarketUndisputed(0);
		assertContractBalance(marketPredictingCPMM, 102970000n);
	});

	it('claim err-user-not-winner-or-claimed', async () => {
		createCategoricalMarket(0, deployer, undefined, 10000);
		predictCategory(alice, 0, 'lion', 1000, 0);
		predictCategory(bob, 0, 'tiger', 1000, 1);
		predictCategory(betty, 0, 'cheetah', 1000, 2);
		resolveMarket(0, 'cheetah', 2);
		simnet.mineEmptyBlocks(25);
		resolveMarketUndisputed(0);
		assertContractBalance(marketPredictingCPMM, 12970n);
		claim(fred, 0, 80, 10008);
	});

	it('claim loser ok', async () => {
		createCategoricalMarket(0);
		predictCategory(alice, 0, 'lion', 1000, 0);
		predictCategory(bob, 0, 'tiger', 1000, 1);
		predictCategory(betty, 0, 'cheetah', 1000, 2);
		resolveMarket(0, 'cheetah', 2);
		simnet.mineEmptyBlocks(25);
		resolveMarketUndisputed(0);
		assertContractBalance(marketPredictingCPMM, 100002970n);
		claim(alice, 0, 80, 10006);
	});

	it('claim winner ok', async () => {
		createCategoricalMarket(0, deployer, undefined, 9999);
		let response = await predictCategory(alice, 0, 'lion', 3333, 0, stxToken, 10000000);
		// console.log('claim winner ok', response.events);
		response = await predictCategory(bob, 0, 'tiger', 3333, 1, stxToken, 10000000);
		// console.log('claim winner ok', response.events);
		response = await predictCategory(betty, 0, 'cheetah', 3333, 2, stxToken, 10000000);
		// console.log('claim winner ok', response.events);
		const result = await resolveMarket(0, 'cheetah', 2);

		printMarketBalances(0);

		printStakeBalances(alice, 0);
		printStakeBalances(bob, 0);
		printStakeBalances(betty, 0);

		simnet.mineEmptyBlocks(25);
		resolveMarketUndisputed(0);
		assertContractBalance(marketPredictingCPMM, 29709999n);
		assertDataVarNumber(marketPredictingCPMM, 'dev-fee-bips', 100);
		assertDataVarNumber(marketPredictingCPMM, 'dao-fee-bips', 150);
		assertDataVarNumber(marketPredictingCPMM, 'market-fee-bips-max', 300);

		// claim for the treasury seed fund
		response = await simnet.callPublicFn(
			'bme006-0-treasury',
			'claim-for-dao',
			[Cl.principal(deployer + '.bme024-0-market-predicting'), Cl.uint(0), Cl.principal(stxToken)],
			bob
		);
		console.log('claim winner ok', response.events);
		expect(response.result).toEqual(Cl.ok(Cl.uint(3302872)));

		claim(betty, 0, 26407126);
		assertContractBalance(marketPredictingCPMM, 1n);
	});

	it('claim winner ok', async () => {
		createCategoricalMarket(0, deployer, undefined, 9999);

		let response = await predictCategory(deployer, 0, 'lion', 3333, 0, stxToken, 10000000);
		response = await predictCategory(alice, 0, 'tiger', 3333, 1, stxToken, 10000000);
		response = await predictCategory(bob, 0, 'cheetah', 3333, 2, stxToken, 10000000);
		// response = await predictCategory(tom, 0, 'lion', 3333, 0);
		response = await predictCategory(betty, 0, 'tiger', 3333, 1, stxToken, 10000000);
		response = await predictCategory(fred, 0, 'cheetah', 3333, 2, stxToken, 10000000);
		response = await predictCategory(wallace, 0, 'lion', 3333, 0, stxToken, 10000000);
		response = await predictCategory(piedro, 0, 'tiger', 3333, 1, stxToken, 10000000);
		response = await predictCategory(developer, 0, 'cheetah', 3333, 2, stxToken, 10000000);

		const result = await resolveMarket(0, 'cheetah', 2);

		printMarketBalances(0);

		printStakeBalances(alice, 0);
		printStakeBalances(bob, 0);
		printStakeBalances(betty, 0);

		simnet.mineEmptyBlocks(25);
		resolveMarketUndisputed(0);
		assertContractBalance(marketPredictingCPMM, 79209999n);
		assertDataVarNumber(marketPredictingCPMM, 'dev-fee-bips', 100);
		assertDataVarNumber(marketPredictingCPMM, 'dao-fee-bips', 150);
		assertDataVarNumber(marketPredictingCPMM, 'market-fee-bips-max', 300);

		// claim for the treasury seed fund
		response = await simnet.callPublicFn(
			'bme006-0-treasury',
			'claim-for-dao',
			[Cl.principal(deployer + '.bme024-0-market-predicting'), Cl.uint(0), Cl.principal(stxToken)],
			bob
		);
		console.log('claim winner ok', response.events);
		expect(response.result).toEqual(Cl.ok(Cl.uint(464213)));

		claim(fred, 0, 9243457);
		claim(bob, 0, 3711477);
		claim(developer, 0, 65790850);
		claim(alice, 0, 80, 10006);
		claim(betty, 0, 80, 10006);
		assertContractBalance(marketPredictingCPMM, 2n);
	});
});

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/
async function printMarketBalances(marketId: number) {
	let data = await simnet.callReadOnlyFn('bme024-0-market-predicting', 'get-market-data', [Cl.uint(marketId)], alice);
	console.log('MarketBalances ---> categories', (data.result as any).value.data.categories.list);
	console.log('MarketBalances ---> outcome', (data.result as any).value.data.outcome.value?.value);
	console.log('MarketBalances ---> stakes', (data.result as any).value.data.stakes.list);
	console.log('MarketBalances ---> stake-tokens', (data.result as any).value.data['stake-tokens']);
}

async function printStakeBalances(user: string, marketId: number) {
	let data = await simnet.callReadOnlyFn('bme024-0-market-predicting', 'get-stake-balances', [Cl.uint(marketId), Cl.principal(user)], alice);
	//console.log("get-stake-balances: " + user, (data.result as any).value)
}
export async function createBinaryMarketWithGating(marketId: number, proof: any, key?: any, creator?: string, token?: string, fee?: number) {
	let response = await simnet.callPublicFn(
		'bme024-0-market-predicting',
		'create-market',
		[
			Cl.list([Cl.stringAscii('nay'), Cl.stringAscii('yay')]),
			fee ? Cl.some(Cl.uint(fee)) : Cl.none(),
			Cl.principal(token ? token : stxToken),
			Cl.bufferFromHex(key ? key : metadataHash()),
			proof,
			Cl.principal(`${deployer}.bme022-0-market-gating`),
			Cl.uint(100000000)
		],
		creator ? creator : deployer
	);
	if (marketId > 200) {
		expect(response.result).toEqual(Cl.error(Cl.uint(marketId)));
	} else {
		expect(response.result).toEqual(Cl.ok(Cl.uint(marketId)));
	}
	return response;
}
export async function createBinaryMarketWithFees(marketId: number, fee: number, creator?: string, token?: string) {
	let response = await simnet.callPublicFn(
		'bme024-0-market-predicting',
		'create-market',
		[
			Cl.list([Cl.stringAscii('nay'), Cl.stringAscii('yay')]),
			Cl.some(Cl.uint(fee)),
			Cl.principal(token ? token : stxToken),
			Cl.bufferFromHex(metadataHash()),
			Cl.list([]),
			Cl.principal(`${deployer}.bme022-0-market-gating`),
			Cl.uint(100000000)
		],
		creator ? creator : deployer
	);
	expect(response.result).toEqual(Cl.ok(Cl.uint(marketId)));
	return response;
}
export async function createBinaryMarketWithErrorCode(errorCode: number, fee?: number, creator?: string, token?: string) {
	let response = await simnet.callPublicFn(
		'bme024-0-market-predicting',
		'create-market',
		[
			Cl.list([Cl.stringAscii('lion'), Cl.stringAscii('tiger')]),
			fee ? Cl.some(Cl.uint(fee)) : Cl.none(),
			Cl.principal(token ? token : stxToken),
			Cl.bufferFromHex(metadataHash()),
			Cl.list([]),
			Cl.principal(`${deployer}.bme022-0-market-gating`),
			Cl.uint(100000000)
		],
		creator ? creator : deployer
	);
	expect(response.result).toEqual(Cl.error(Cl.uint(errorCode)));
	return response;
}
export async function createBinaryMarket(marketId: number, creator?: string, token?: string) {
	let response = await simnet.callPublicFn(
		'bme024-0-market-predicting',
		'create-market',
		[
			Cl.list([Cl.stringAscii('nay'), Cl.stringAscii('yay')]),
			Cl.none(),
			Cl.principal(token ? token : stxToken),
			Cl.bufferFromHex(metadataHash()),
			Cl.list([]),
			Cl.principal(`${deployer}.bme022-0-market-gating`),
			Cl.uint(100000000)
		],
		creator ? creator : deployer
	);
	expect(response.result).toEqual(Cl.ok(Cl.uint(marketId)));
	return response;
}
async function createCategoricalMarket(marketId: number, creator?: string, token?: string, seed?: number) {
	constructDao(simnet);
	let response = await simnet.callPublicFn(
		'bme024-0-market-predicting',
		'create-market',
		[
			Cl.list([Cl.stringAscii('lion'), Cl.stringAscii('tiger'), Cl.stringAscii('cheetah')]),
			Cl.none(),
			Cl.principal(token ? token : stxToken),
			Cl.bufferFromHex(metadataHash()),
			Cl.list([]),
			Cl.principal(`${deployer}.bme022-0-market-gating`),
			Cl.uint(seed ? seed : 100000000)
		],
		creator ? creator : deployer
	);
	expect(response.result).toEqual(Cl.ok(Cl.uint(marketId)));
}
async function predictCategory(user: string, marketId: number, category: string, amount: number, code: number, token?: string, maxCost?: number) {
	let response = await simnet.callPublicFn(
		'bme024-0-market-predicting',
		'predict-category',
		[Cl.uint(marketId), Cl.uint(amount), Cl.stringAscii(category), Cl.principal(token ? token : stxToken), Cl.uint(maxCost ? maxCost : amount)],
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
async function resolveMarket(marketId: number, category: string, winner: number, token?: string) {
	let response = await simnet.callPublicFn('bme024-0-market-predicting', 'resolve-market', [Cl.uint(marketId), Cl.stringAscii(category)], bob);
	expect(response.result).toEqual(Cl.ok(Cl.uint(winner)));
	return response;
}
async function resolveMarketUndisputed(marketId: number, code?: number) {
	let response = await simnet.callPublicFn('bme024-0-market-predicting', 'resolve-market-undisputed', [Cl.uint(marketId)], bob);
	if (code) {
		expect(response.result).toEqual(Cl.error(Cl.uint(code)));
	} else {
		expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
	}
}
async function claim(user: string, marketId: number, share: number, code?: number) {
	let response = await simnet.callPublicFn('bme024-0-market-predicting', 'claim-winnings', [Cl.uint(marketId), Cl.principal(stxToken)], user);
	if (code) {
		expect(response.result).toEqual(Cl.error(Cl.uint(code)));
	} else {
		expect(response.result).toEqual(Cl.ok(Cl.uint(share)));
	}
}
