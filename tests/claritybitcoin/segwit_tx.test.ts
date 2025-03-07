import { assert, describe, expect, it } from 'vitest';
import { deployer, setupSimnet } from '../helpers';
import { Cl } from '@stacks/transactions';
const proofData = {
	height: 21731,
	wtx: '02000000011057465eb81967f7ef9360eb89d5323b7acdaf4e5f7e07e532a170c1fcaf96b600000000000000000002e803000000000000160014a889b37ce58d58cfe541089cf9697670a2df01d547190000000000001600142c9fad3e438b0ffc82e352c2b661cf92c7489e6f00000000',
	header: '00000020169930171a7024ad0bbf104459b9ea0d753b002d52225a4133f3c8b9a1f700070e59fd6f24fc5c24d069a9adb94f87a54af39ce408fa0b924be343e18f2b120b3960c867ffff7f2004000000',
	txIndex: 2,
	treeDepth: 2,
	wproof: ['5607484b90f7d6086da91e9897b01fab6c2915b275b9362b6339c48c2e3442af', '1031787c96b27c780e567baf561ceb855e942592209e91122c839f68bcfaf098'],
	witnessMerkleRoot: '0b122b8fe143e34b920bfa08e49cf34aa5874fb9ada969d0245cfc246ffd590e',
	witnessReservedValue: 'aa21a9edfc088350b9afa9f0a722d920',
	ctx: '02000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0402e35400ffffffff0219540000000000001976a91496b1993849d2abc9c04b2ba16e0ceae36d69cbdd88ac0000000000000000266a24aa21a9edfc088350b9afa9f0a722d92082fe8bb0b8626193e9107dc77633ceb37f5c2d5800000000',
	cproof: ['a302e10499504bc0e92d0f15315ed5da27a35f3cfa191ee2cfd486fc488ba0aa']
};
// wproof: [
// 	{
// 		hash: '5607484b90f7d6086da91e9897b01fab6c2915b275b9362b6339c48c2e3442af',
// 		direction: 'right'
// 	},
// 	{
// 		hash: '1031787c96b27c780e567baf561ceb855e942592209e91122c839f68bcfaf098',
// 		direction: 'left'
// 	}
// ],

const simnet = await setupSimnet();

describe('clarity bitcoin', () => {
	// (height uint)
	// (wtx (buff 4096))
	// (header (buff 80))
	// (tx-index uint)
	// (tree-depth uint)
	// (wproof (list 14 (buff 32)))
	// (witness-merkle-root (buff 32))
	// (witness-reserved-value (buff 32))
	// (ctx (buff 1024))
	// (cproof (list 14 (buff 32))))

	it('segwit transaction', async () => {
		let response = await simnet.callReadOnlyFn(
			'clarity-bitcoin-lib-v5',
			'was-segwit-tx-mined-compact',
			[
				Cl.uint(proofData.height),
				Cl.bufferFromHex(proofData.wtx),
				Cl.bufferFromHex(proofData.header),
				Cl.uint(proofData.txIndex),
				Cl.uint(proofData.treeDepth),
				Cl.list(proofData.wproof.map((o) => Cl.bufferFromHex(o))),
				Cl.bufferFromHex(proofData.witnessMerkleRoot),
				Cl.bufferFromHex(proofData.witnessReservedValue),
				Cl.bufferFromHex(proofData.ctx),
				Cl.list(proofData.cproof.map((o) => Cl.bufferFromHex(o)))
			],
			deployer
		);
		expect(response.result).toEqual(Cl.error(Cl.uint(2200)));
	});
});
