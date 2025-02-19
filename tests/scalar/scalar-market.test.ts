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
	fred,
	marketScalar,
	metadataHash,
	setupSimnet,
	stxToken,
	tom
} from '../helpers';

const simnet = await setupSimnet();

describe('claiming errors', () => {
	it('err too few categories', async () => {
		constructDao(simnet);
		let response = await simnet.callPublicFn(
			marketScalar,
			'create-market',
			[
				Cl.list([Cl.tuple({ min: Cl.uint(1), max: Cl.uint(2) })]),
				Cl.none(),
				Cl.principal(stxToken),
				Cl.bufferFromHex(metadataHash()),
				Cl.list([]),
				Cl.principal(`${deployer}.bme022-0-market-gating`),
				Cl.none(),
				Cl.none(),
				Cl.stringAscii('STX/USD')
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
		createScalarMarket(0, 'STX/USD/0');
	});

	it('create and stake not ok on unknown category', async () => {
		createScalarMarket(0, 'STX/USD/0');
		createScalarMarket(1, 'STX/USD/1');
		predictCategory(alice, 0, 5, 1000, 10023);
	});

	it('create and stake ok', async () => {
		createScalarMarket(0, 'STX/USD/0');
		createScalarMarket(1, 'STX/USD/1');
		predictCategory(alice, 0, 0, 1000, 0);
	});
	it('res agent cannot stake', async () => {
		createScalarMarket(0, 'STX/USD/0');
		createScalarMarket(1, 'STX/USD/1');
		predictCategory(tom, 0, 0, 1000, 12);
	});

	it('create and stake spread ok', async () => {
		createScalarMarket(0, 'STX/USD/0');
		createScalarMarket(1, 'STX/USD/1');
		predictCategory(alice, 0, 0, 1000, 0);
		predictCategory(bob, 0, 1, 1000, 1);
		predictCategory(betty, 0, 2, 1000, 2);
	});

	it('resolve to category 0 for STX/USD/0', async () => {
		const stacksHeightStart = simnet.blockHeight;
		createScalarMarket(0, 'STX/USD/0');
		predictCategory(alice, 0, 0, 1000, 0);
		predictCategory(bob, 0, 1, 1000, 1);
		predictCategory(betty, 0, 2, 1000, 2);
		simnet.mineEmptyBlocks(144);
		resolveMarketError(0, stacksHeightStart, 10020);
		simnet.mineEmptyBlocks(143);
		resolveMarketError(0, stacksHeightStart, 10020);
		simnet.mineEmptyBlocks(1);
		resolveMarket(0, 0, stacksHeightStart);
	});

	it('resolve to category 1 for STX/USD/1', async () => {
		const stacksHeightStart = simnet.blockHeight;
		createScalarMarket(0, 'STX/USD/1');
		predictCategory(alice, 0, 0, 1000, 0);
		predictCategory(bob, 0, 1, 1000, 1);
		predictCategory(betty, 0, 2, 1000, 2);
		simnet.mineEmptyBlocks(144);
		resolveMarketError(0, stacksHeightStart, 10020);
		simnet.mineEmptyBlocks(143);
		resolveMarketError(0, stacksHeightStart, 10020);
		simnet.mineEmptyBlocks(1);
		const response = await resolveMarket(0, 1, stacksHeightStart);
		printMarketevents(response);
	});

	it('resolve to category 2 for STX/USD/2', async () => {
		const stacksHeightStart = simnet.blockHeight;
		createScalarMarket(0, 'STX/USD/2');
		predictCategory(alice, 0, 0, 1000, 0);
		predictCategory(bob, 0, 1, 1000, 1);
		predictCategory(betty, 0, 2, 1000, 2);
		simnet.mineEmptyBlocks(144);
		resolveMarketError(0, stacksHeightStart, 10020);
		simnet.mineEmptyBlocks(143);
		resolveMarketError(0, stacksHeightStart, 10020);
		simnet.mineEmptyBlocks(1);
		const response = await resolveMarket(0, 2, stacksHeightStart);
		printMarketevents(response);
	});

	it('resolve to category 0 for STX/USD (ie 0)', async () => {
		const stacksHeightStart = simnet.blockHeight;
		createScalarMarket(0, 'STX/USD');
		predictCategory(alice, 0, 0, 1000, 0);
		predictCategory(bob, 0, 1, 1000, 1);
		predictCategory(betty, 0, 2, 1000, 2);
		simnet.mineEmptyBlocks(144);
		resolveMarketError(0, stacksHeightStart, 10020);
		simnet.mineEmptyBlocks(143);
		resolveMarketError(0, stacksHeightStart, 10020);
		simnet.mineEmptyBlocks(1);
		const response = await resolveMarket(0, 0, stacksHeightStart);
		printMarketevents(response);
	});

	it('resolve to category 2 if above range STX/USD/3', async () => {
		const stacksHeightStart = simnet.blockHeight;
		createScalarMarket(0, 'STX/USD/3');
		predictCategory(alice, 0, 0, 1000, 0);
		predictCategory(bob, 0, 1, 1000, 1);
		predictCategory(betty, 0, 2, 1000, 2);
		simnet.mineEmptyBlocks(144);
		resolveMarketError(0, stacksHeightStart, 10020);
		simnet.mineEmptyBlocks(143);
		resolveMarketError(0, stacksHeightStart, 10020);
		simnet.mineEmptyBlocks(1);
		const response = await resolveMarket(0, 2, stacksHeightStart);
		printMarketevents(response);
	});

	it('resolve undisputed requires window to elapse', async () => {
		const stacksHeightStart = simnet.blockHeight;
		createScalarMarket(0, 'STX/USD/0');
		predictCategory(alice, 0, 0, 1000, 0);
		predictCategory(bob, 0, 1, 1000, 1);
		predictCategory(betty, 0, 2, 1000, 2);
		simnet.mineEmptyBlocks(288);
		resolveMarket(0, 0, stacksHeightStart);
		simnet.mineEmptyBlocks(20); // set ot 24 in bootstrap prop
		resolveMarketUndisputed(0, 10019);
		simnet.mineEmptyBlocks(5);
		resolveMarketUndisputed(0);
	});

	it('claim err-user-not-winner-or-claimed', async () => {
		const stacksHeightStart = simnet.blockHeight;
		createScalarMarket(0, 'STX/USD/0');
		predictCategory(alice, 0, 0, 1000, 0);
		predictCategory(bob, 0, 1, 1000, 1);
		predictCategory(betty, 0, 2, 1000, 2);
		simnet.mineEmptyBlocks(288);
		resolveMarket(0, 0, stacksHeightStart);
		simnet.mineEmptyBlocks(25);
		resolveMarketUndisputed(0);
		assertContractBalance(marketScalar, 2970n);
		claim(fred, 0, 80, 10008);
	});

	it('claim loser 1 ok', async () => {
		const stacksHeightStart = simnet.blockHeight;
		createScalarMarket(0, 'STX/USD/1');
		predictCategory(alice, 0, 0, 1000, 0);
		predictCategory(bob, 0, 1, 1000, 1);
		predictCategory(betty, 0, 2, 1000, 2);
		simnet.mineEmptyBlocks(288);
		resolveMarket(0, 1, stacksHeightStart);
		simnet.mineEmptyBlocks(25);
		resolveMarketUndisputed(0);
		assertContractBalance(marketScalar, 2970n);
		claim(alice, 0, 80, 10006);
	});

	it('claim loser 2 ok', async () => {
		const stacksHeightStart = simnet.blockHeight;
		createScalarMarket(0, 'STX/USD/2');
		predictCategory(alice, 0, 0, 1000, 0);
		predictCategory(bob, 0, 1, 1000, 1);
		predictCategory(betty, 0, 2, 1000, 2);
		simnet.mineEmptyBlocks(288);
		resolveMarket(0, 2, stacksHeightStart);
		simnet.mineEmptyBlocks(25);
		resolveMarketUndisputed(0);
		assertContractBalance(marketScalar, 2970n);
		claim(bob, 0, 80, 10006);
	});

	it('claim winner ok', async () => {
		const stacksHeightStart = simnet.blockHeight;
		createScalarMarket(0, 'STX/USD/0');
		predictCategory(alice, 0, 0, 1000, 0);
		predictCategory(bob, 0, 1, 1000, 1);
		predictCategory(betty, 0, 2, 1000, 2);
		simnet.mineEmptyBlocks(288);
		const result = await resolveMarket(0, 0, stacksHeightStart);
		//console.log("claim winner ok",result.events[0].data.value)

		printMarketBalances(0);

		printStakeBalances(alice, 0);
		printStakeBalances(bob, 0);
		printStakeBalances(betty, 0);

		simnet.mineEmptyBlocks(25);
		resolveMarketUndisputed(0);
		assertContractBalance(marketScalar, 2970n);
		assertDataVarNumber(marketScalar, 'dev-fee-bips', 100);
		assertDataVarNumber(marketScalar, 'dao-fee-bips', 150);
		assertDataVarNumber(marketScalar, 'market-fee-bips-max', 300);
		assertDataVarNumber(marketScalar, 'market-create-fee', 100000000);

		const response = await claim(alice, 0, 2926);
		console.log('claim winner ok', response);
	});

	it('claim winners ok all staked on winning category', async () => {
		const stacksHeightStart = simnet.blockHeight;
		createScalarMarket(0, 'STX/USD/2');
		predictCategory(alice, 0, 2, 1000, 2);
		predictCategory(bob, 0, 2, 1000, 2);
		predictCategory(betty, 0, 2, 1000, 2);
		simnet.mineEmptyBlocks(288);
		const result = await resolveMarket(0, 2, stacksHeightStart);
		//console.log("claim winner ok",result.events[0].data.value)

		printMarketBalances(0);

		printStakeBalances(alice, 0);
		printStakeBalances(bob, 0);
		printStakeBalances(betty, 0);

		simnet.mineEmptyBlocks(25);
		resolveMarketUndisputed(0);
		assertContractBalance(marketScalar, 2970n);

		let response = await claim(alice, 0, 976);
		response = await claim(bob, 0, 976);
		response = await claim(betty, 0, 976);
		// console.log('claim winner ok', response);
	});

	it('claim winners ok all staked on wrong category', async () => {
		const stacksHeightStart = simnet.blockHeight;
		createScalarMarket(0, 'STX/USD/2');
		predictCategory(alice, 0, 1, 1000, 1);
		predictCategory(bob, 0, 1, 1000, 1);
		predictCategory(betty, 0, 1, 1000, 1);
		simnet.mineEmptyBlocks(288);
		const result = await resolveMarket(0, 2, stacksHeightStart);
		//console.log("claim winner ok",result.events[0].data.value)

		printMarketBalances(0);

		printStakeBalances(alice, 0);
		printStakeBalances(bob, 0);
		printStakeBalances(betty, 0);

		simnet.mineEmptyBlocks(25);
		resolveMarketUndisputed(0);
		assertContractBalance(marketScalar, 2970n);

		let response = await claim(alice, 0, 976, 10006);
		response = await claim(bob, 0, 976, 10006);
		response = await claim(betty, 0, 976, 10006);
		// console.log('claim winner ok', response);
		assertContractBalance(marketScalar, 2970n);
		await transferLosingStake(alice, 0);
		assertContractBalance(marketScalar, 0n);
	});
});

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/
async function printPriceData() {
	let data = await simnet.callReadOnlyFn('dia-oracle', 'get-value', [Cl.stringAscii('STX/USD/0')], alice);
	console.log('STX/USD/0', (data.result as any).value);
	data = await simnet.callReadOnlyFn('dia-oracle', 'get-value', [Cl.stringAscii('STX/USD/1')], alice);
	console.log('STX/USD/1', (data.result as any).value);
	data = await simnet.callReadOnlyFn('dia-oracle', 'get-value', [Cl.stringAscii('STX/USD/2')], alice);
	console.log('STX/USD/2', (data.result as any).value);
}

async function printMarketevents(response: any) {
	console.log('response', response.events[0].data.value.data);
}

async function printMarketBalances(marketId: number) {
	let data = await simnet.callReadOnlyFn(marketScalar, 'get-market-data', [Cl.uint(marketId)], alice);
	console.log('categories', (data.result as any).value.data.categories.list[0]);
	console.log('categories', (data.result as any).value.data.categories.list[1]);
	console.log('categories', (data.result as any).value.data.categories.list[2]);
	console.log('outcome', (data.result as any).value.data.outcome);
	console.log('stakes', (data.result as any).value.data.stakes);
}

async function printStakeBalances(user: string, marketId: number) {
	let data = await simnet.callReadOnlyFn(marketScalar, 'get-stake-balances', [Cl.uint(marketId), Cl.principal(user)], alice);
	console.log('get-stake-balances: ' + user, (data.result as any).value);
}
export async function createBinaryMarket(marketId: number, creator?: string, token?: string) {
	let response = await simnet.callPublicFn(
		marketScalar,
		'create-market',
		[
			Cl.list([Cl.tuple({ min: Cl.uint(0), max: Cl.uint(1) }), Cl.tuple({ min: Cl.uint(1), max: Cl.uint(2) })]),
			Cl.none(),
			Cl.principal(token ? token : stxToken),
			Cl.bufferFromHex(metadataHash()),
			Cl.list([]),
			Cl.principal(`${deployer}.bme022-0-market-gating`),
			Cl.none(),
			Cl.none(),
			Cl.stringAscii('STX/USD')
		],
		creator ? creator : deployer
	);
	expect(response.result).toEqual(Cl.ok(Cl.uint(marketId)));
	return response;
}
async function createScalarMarket(marketId: number, priceFeed: string, creator?: string, token?: string) {
	constructDao(simnet);
	let response = await simnet.callPublicFn(
		marketScalar,
		'create-market',
		[
			// (map-set test-values "STX/USD/0" { value: u950000000, timestamp: u1739355000 })
			// (map-set test-values "STX/USD/1" { value: u1050000000, timestamp: u1739355100 })
			// (map-set test-values "STX/USD/2" { value: u1150000000, timestamp: u1739355200 })
			Cl.list([Cl.tuple({ min: Cl.uint(90), max: Cl.uint(100) }), Cl.tuple({ min: Cl.uint(100), max: Cl.uint(110) }), Cl.tuple({ min: Cl.uint(110), max: Cl.uint(120) })]),
			Cl.none(),
			Cl.principal(token ? token : stxToken),
			Cl.bufferFromHex(metadataHash()),
			Cl.list([]),
			Cl.principal(`${deployer}.bme022-0-market-gating`),
			Cl.none(),
			Cl.none(),
			Cl.stringAscii(priceFeed)
		],
		creator ? creator : deployer
	);
	expect(response.result).toEqual(Cl.ok(Cl.uint(marketId)));
}
export async function predictCategory(user: string, marketId: number, category: number, amount: number, code: number, token?: string) {
	let response = await simnet.callPublicFn(
		marketScalar,
		'predict-category',
		[Cl.uint(marketId), Cl.uint(amount), Cl.uint(category), Cl.principal(token ? token : stxToken)],
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
async function resolveMarket(marketId: number, finalIndex: number, stacksHeight: number) {
	let response = await simnet.callPublicFn(marketScalar, 'resolve-market', [Cl.uint(marketId), Cl.uint(stacksHeight)], bob);
	expect(response.result).toEqual(Cl.ok(Cl.some(Cl.uint(finalIndex))));
	return response;
}
async function resolveMarketError(marketId: number, stacksHeight: number, errorCode: number) {
	let response = await simnet.callPublicFn(marketScalar, 'resolve-market', [Cl.uint(marketId), Cl.uint(stacksHeight)], bob);
	expect(response.result).toEqual(Cl.error(Cl.uint(errorCode)));
	return response;
}
async function resolveMarketUndisputed(marketId: number, code?: number) {
	let response = await simnet.callPublicFn(marketScalar, 'resolve-market-undisputed', [Cl.uint(marketId)], bob);
	if (code) {
		expect(response.result).toEqual(Cl.error(Cl.uint(code)));
	} else {
		expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
	}
	return response;
}

async function claim(user: string, marketId: number, share: number, code?: number) {
	let response = await simnet.callPublicFn(marketScalar, 'claim-winnings', [Cl.uint(marketId), Cl.principal(stxToken)], user);
	if (code) {
		expect(response.result).toEqual(Cl.error(Cl.uint(code)));
	} else {
		expect(response.result).toEqual(Cl.ok(Cl.uint(share)));
	}
	return response;
}
async function transferLosingStake(user: string, marketId: number) {
	let response = await simnet.callPublicFn(marketScalar, 'transfer-losing-stakes', [Cl.uint(marketId), Cl.principal(stxToken)], user);
	expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
	return response;
}
