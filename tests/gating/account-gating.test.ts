import { assert, describe, expect, it } from 'vitest';
import { c32address } from 'c32check';
import { Cl } from '@stacks/transactions';
import { alice, betty, bob, constructDao, deployer, fred, isValidExtension, metadataHash, passProposalByCoreVote, setupSimnet, stxToken, tom, wallace } from '../helpers';
import { contractId2Key, generateMerkleProof, generateMerkleTreeUsingStandardPrincipal, proofToClarityValue } from './gating';
import { bytesToHex } from '@noble/hashes/utils';

const simnet = await setupSimnet();

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe('gating market  creation', () => {
	it("err-expecting-merkle-root-for-poll", async () => {
	  constructDao(simnet);
	  let response = await simnet.callPublicFn(
	    "bde023-market-predicting",
	    "create-market",
	    [Cl.uint(0), Cl.none(), Cl.principal(stxToken), Cl.bufferFromHex(metadataHash()), Cl.list([])],
	    deployer
	  ); 
	  expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
	});

	it("err-unauthorised", async () => {
	  constructDao(simnet);
	  let response = await simnet.callPublicFn(
	    "bde022-market-gating",
	    "set-merkle-root",
	    [
	      Cl.bufferFromHex(
	        "f5acf4f4f8dc7ee10d4bba032bb8d4776c405916fe07737b4abde40e858408e6"
	      ),
	      Cl.bufferFromHex(
	        "0xf5acf4f4f8dc7ee10d4bba032bb8d4776c405916fe07737b4abde40e858408e6"
	      ),
	    ],
	    deployer
	  );
	  expect(response.result).toEqual(Cl.error(Cl.uint(2200)));
	});

	it("ensure bde022 is valid extension", async () => {
	  constructDao(simnet);
	  const extension = `${deployer}.bde022-market-gating`;
	  await isValidExtension(extension);
	});


	it("can call set-merkle-root via proposal", async () => {
	  constructDao(simnet);

	  const proposal = `bdp001-gating`;
	  //await passProposalByExecutiveSignals(simnet, proposal);
	  await passProposalByCoreVote(proposal);
	  const lookupRootKey = contractId2Key('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bde023-market-predicting');
	  const allowedCreators = [alice, bob, tom, betty, wallace];
	  const { tree, root } = generateMerkleTreeUsingStandardPrincipal(allowedCreators);

	  let data = await simnet.callReadOnlyFn(
	    "bde022-market-gating",
	    "get-merkle-root",
	    [Cl.bufferFromHex(lookupRootKey)],
	    alice
	  );
	  expect(data.result).toEqual(
		// see bdp001-gating 
	    Cl.some(Cl.tuple({ "merkle-root": Cl.bufferFromHex(root) }))
	  );
	});

	it("can't call create-market with invalid merkle lookup key", async () => {
		constructDao(simnet);

		const proposal = `bdp001-gating`;
		//await passProposalByExecutiveSignals(simnet, proposal);
		await passProposalByCoreVote(proposal);
		const lookupRootKey = contractId2Key('ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5.bde021-market-voting');
		const allowedCreators = [alice, bob, tom, betty, wallace];
		const { tree, root } = generateMerkleTreeUsingStandardPrincipal(allowedCreators);
		const { proof, valid, leaf } = generateMerkleProof(tree, bob);

		let data = await simnet.callReadOnlyFn('bde022-market-gating', 'get-merkle-root', [Cl.bufferFromHex(lookupRootKey)], alice);
		expect(data.result).toEqual(Cl.none());

		let response = await simnet.callPublicFn(
			'bde023-market-predicting',
			'create-market',
			[Cl.uint(0), Cl.none(), Cl.principal(stxToken), Cl.bufferFromHex(metadataHash()), proofToClarityValue(proof)],
			deployer
		);
		expect(response.result).toEqual(Cl.error(Cl.uint(2214)));
	});

	it("deployer can create-market if dao bootstrapped", async () => {
		constructDao(simnet);
		const allowedCreators = [deployer];
		const { tree, root } = generateMerkleTreeUsingStandardPrincipal(allowedCreators);
		let merklProof = generateMerkleProof(tree, deployer);
		assert(merklProof.valid)
		//merklProof = generateMerkleProof(tree, deployer);
		//assert(merklProof.valid)
		const lookupRootKey = contractId2Key('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bde023-market-predicting');
		console.log(
			'bde023-market-predicting: 0x' + lookupRootKey + ' root= 0x' + root
			//tree
		);
		let response = await simnet.callPublicFn(
			'bde023-market-predicting',
			'create-market',
			[Cl.uint(0), Cl.none(), Cl.principal(stxToken), Cl.bufferFromHex(metadataHash()), proofToClarityValue(merklProof.proof)],
			deployer
		);
		expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
	});

	it("alice cannot create-market if dao bootstrapped", async () => {
		constructDao(simnet);
		const allowedCreators = [deployer];
		const { tree, root } = generateMerkleTreeUsingStandardPrincipal(allowedCreators);
		let merklProof = generateMerkleProof(tree, deployer);
		assert(merklProof.valid)
		//merklProof = generateMerkleProof(tree, deployer);
		//assert(merklProof.valid)
		const lookupRootKey = contractId2Key('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bde023-market-predicting');
		console.log(
			'bde023-market-predicting: 0x' + lookupRootKey + ' root= 0x' + root
			//tree 
		);
		let response = await simnet.callPublicFn(
			'bde023-market-predicting',
			'create-market',
			[Cl.uint(0), Cl.none(), Cl.principal(stxToken), Cl.bufferFromHex(metadataHash()), proofToClarityValue(merklProof.proof)],
			alice
		);
		expect(response.result).toEqual(Cl.error(Cl.uint(2214)));
	});

	it("GENERATE TESTNET MERKLE ROOTS FOR MARKET CREATION", async () => {
		constructDao(simnet);
		const allowedCreators = ["ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV", "ST2RPDWF6N939Y32C4ZEVC74SCRTGSJBFBPJP05H5", "ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY", "ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ"];
		const { tree, root } = generateMerkleTreeUsingStandardPrincipal(allowedCreators);
		let merklProof = generateMerkleProof(tree, "ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV");
		assert(merklProof.valid)
		//merklProof = generateMerkleProof(tree, deployer);
		//assert(merklProof.valid)
		const lookupRootKey = contractId2Key('ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV.bde023-market-predicting');
		console.log(
			'GENERATE TESTNET MERKLE ROOTS FOR MARKET CREATION: bde023-market-predicting: 0x' + lookupRootKey + ' root= 0x' + root
			//tree
		);
		let response = await simnet.callPublicFn(
			'bde023-market-predicting',
			'create-market',
			[Cl.uint(0), Cl.none(), Cl.principal(stxToken), Cl.bufferFromHex(metadataHash()), proofToClarityValue(merklProof.proof)],
			alice
		);
		expect(response.result).toEqual(Cl.error(Cl.uint(2214)));
	});

	it('can create-market with valid merkle proof', async () => {
		constructDao(simnet);

		const allowedCreators = [alice, bob, tom, betty, wallace];
		const disallowedCreators = [wallace, fred];
		const { tree, root } = generateMerkleTreeUsingStandardPrincipal(allowedCreators);
		// console.log('Leaves (Tree):', tree.getLeaves().map(bytesToHex));
		const lookupRootKey = contractId2Key('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bde023-market-predicting');
		console.log('lookupRootKey=' + lookupRootKey)
		const proposal = `bdp001-gating`;
		//await passProposalByExecutiveSignals(simnet, proposal);
		await passProposalByCoreVote(proposal);

		let data = await simnet.callReadOnlyFn('bde022-market-gating', 'get-merkle-root', [Cl.bufferFromHex(lookupRootKey)], alice);
		expect(data.result).toEqual(Cl.some(Cl.tuple({ 'merkle-root': Cl.bufferFromHex(root!) })));

		// bob can create a market
		let merdat = generateMerkleProof(tree, bob);
		assert(merdat.valid, 'should be a valid proof');
		await assertContractData(0, lookupRootKey, merdat.leaf, bob, merdat.proof);

		// // alice can create a market
		merdat = generateMerkleProof(tree, alice);
		assert(merdat.valid, 'should be a valid proof');
		await assertContractData(1, lookupRootKey, merdat.leaf, alice, merdat.proof);

		// // // // tom can create a market
		merdat = generateMerkleProof(tree, tom);
		assert(merdat.valid, 'should be a valid proof');
		await assertContractData(2, lookupRootKey, merdat.leaf, tom, merdat.proof);

		// // betty can create a market
		merdat = generateMerkleProof(tree, betty);
		assert(merdat.valid, 'should be a valid proof');
		await assertContractData(3, lookupRootKey, merdat.leaf, betty, merdat.proof);

		// // wallace can create a market
		merdat = generateMerkleProof(tree, wallace);
		assert(merdat.valid, 'should be a valid proof');
		await assertContractData(4, lookupRootKey, merdat.leaf, wallace, merdat.proof);

		// fred cannot create a market
		merdat = generateMerkleProof(tree, fred);
		//assert(merdat.valid, "should be a valid proof");
		await assertContractData(5, lookupRootKey, merdat.leaf, fred, merdat.proof);

		// fred cannot create a market
		merdat = generateMerkleProof(tree, deployer);
		//assert(merdat.valid, "should be a valid proof");
		await assertContractData(5, lookupRootKey, merdat.leaf, deployer, merdat.proof);
	});
});

async function assertContractData(marketId: number, lookupRootKey: string, leaf: string, user: string, proof: any) {
	// console.log('checking: ' + user + ' leaf: ' + leaf);
	// console.log('lookupRootKey: ' + lookupRootKey);
	// console.log('leaf: ' + leaf);
	// console.log('proof: ', proof);
	// console.log( 
	// 	'proof: ',
	// 	proof.map((p: any) => {
	// 		bytesToHex(p.data);
	// 	})
	// );

	const response = await simnet.callPublicFn(  
		'bde023-market-predicting',
		'create-market',
		[Cl.uint(0), Cl.none(), Cl.principal(stxToken), Cl.bufferFromHex(lookupRootKey), proofToClarityValue(proof)],
		user
	);
	if (user === fred || user === deployer) {
		expect(response.result).toEqual(Cl.error(Cl.uint(2214)));
		return;
	}
	
	expect(response.result).toEqual(Cl.ok(Cl.uint(marketId)));
	console.log('response.events[0].data.value', response)
	console.log('response.events[0].data.value', response.events[0].data.value)
	const ddv = (response.events[0].data.value as any)?.data;
	if (!ddv) return 

	expect(ddv['proof-valid']).toEqual(Cl.bool(true));
	assert('548bbe4cdf9ba84d53315dc3802e9665b6351d53ae24372e9b6f01b33bd7b684' === bytesToHex(ddv['contract-key'].buffer));

	const cAddress = c32address(ddv['txsender'].address.version, ddv['txsender'].address.hash160);
	assert(
		'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bde023-market-predicting' === cAddress + '.' + ddv['txsender'].contractName.content,
		'contract-name returned from contract is unexpected ' + user
	);

	console.log('lookupRootKey2=' + bytesToHex(ddv['contract-name'].buffer))

	assert(
		bytesToHex(ddv['contract-name'].buffer) === '0d000000186264653032332d6d61726b65742d70726564696374696e67',
		'contract-name hash returned from contract is unexpected ' + user
	);
	// assert(
	//   bytesToHex(ddv.leaf.buffer) === leaf,
	//   `leaf returned from contract is unexpected ${bytesToHex(ddv.leaf.buffer)}`
	// );
	const stacksAddress = c32address(ddv.sender.address.version, ddv.sender.address.hash160);
	// console.log(bytesToHex(ddv.leaf.buffer));
	// console.log(stacksAddress);
	// console.log(user);
	assert(stacksAddress === user, 'stacksAddress returned from contract is unexpected ' + user);
	// assert(
	//   bytesToHex(ddv.root.data["merkle-root"].buffer) ===
	//     "5f24649277af2f6364faf35827dffe12b85f2f1dca5ae92733c72af91455aa64",
	//   "root returned from contract is unexpected " + user
	// );
}
