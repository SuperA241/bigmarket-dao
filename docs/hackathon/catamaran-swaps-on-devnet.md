---
description: Notes for using clarity-bitcoin-lib-v5 on devnet
---

# Catamaran Swaps on Devnet

Set up and run a local regtest node alongside Clarinet devnet.

1. Configure bitcoin.conf and Devnet.toml to talk to eachother
2. Send transactions on the local bitcoin regtest node
3. Confirm they get mined and that clarity-bitcoin lib can verify

## Part 1: Clarinet Devnet / Bitcoin Core

1. run clarinet devnet

```
clarinet devnet start
```

2. start bitcoin core ( see appendix for regtest conf)

```
bitcoin-qt -regtest -conf=p/bath/to/bitcoin-regtest/bitcoin.conf
```

3. fund core wallet

with bitcoin-qt got to receive address and use the address to overwrite the following;

````
```yaml
---
id: 0
name: Devnet deployment
network: devnet
stacks-node: 'http://localhost:20443'
bitcoin-node: 'http://devnet:devnet@localhost:18443'
plan:
  batches:
    - id: 0
      transactions:
        - btc-transfer:
            expected-sender: mjSrB3wS4xab3kYqFktwBzfTdPg367ZJ2d
            recipient: bcrt1qwneu6ldaemhhnpphla9mzuwgkwtz3q6vejq4jz
            sats-amount: 10000000
            sats-per-byte: 10
      epoch: '2.1'

```
````

and run it with

```
clarinet deployments apply -p deployments/send-btc.devnet-plan.yaml --no-dashboard
```

4. Check the two nodes are in sync

```
docker exec -it bitcoin-node.bigmarket-dao.devnet bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet getblockchaininfo
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet getblockchaininfo
```

and connected;

```
docker exec -it bitcoin-node.bigmarket-dao.devnet bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet getpeerinfo
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet getpeerinfo
```

5. Optionally:&#x20;

mine some blocks / check balance

```
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet -rpcport=18445 -rpcwallet=big-wallet getnewaddress    
```

```
docker exec -it bitcoin-node.bigmarket-dao.devnet bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet generatetoaddress 1 <address>
```

check balance

```
bitcoin-cli -regtest -rpcport=18445 -rpcuser=devnet -rpcpassword=devnet -rpcwallet=big-wallet getbalance
```

decode raw transactions;

```
bitcoin-cli -regtest -rpcport=18445 -rpcuser=devnet -rpcpassword=devnet decoderawtransaction "010000000112528a7588804ca4440735b3bd56ca22b3f5f48644676f97a81dfad834ece3da000000006a473044022009d2da88395d40000348da194cd48cae320e839ddce8743d20fe877aad1013d802207a2a74d4250480a12d71a2852bacafe35408622d36a4c0f264db690e71f52edd012102add319140c528a8955d76d4afe32c4d3143fea57ea353a31ce793cffb77ef861fdffffff0280969800000000001600148ae4a48cb0c3b7874460a6f5287d9dd512a1824610446d29010000001976a9142b19bade75a48768a5ffc142a86490303a95f41388ac00000000"
```

## Part 2: Build Transactions

Use btc-signer library for bitcoin transactions

Following method builds the transaction adding an unspendable output containing a serialised clarity value (a tuple of the market data).

It communicates with the regtest bitcoin core node above to sign and broadcast the transaction.

````
```typescript
export async function buildRegtestBitcoinSegwitTransaction(marketId: number, outcomeIndex: number, stxAddress: string, amountBtc: number): Promise<{ txid: string }> {
	// Define a SegWit-compatible UTXO (mocked)
	const response = await bitcoinRPC('listunspent', [], getRpcParams());
	const utxos = response;

	// Create a new Bitcoin transaction (SegWit enabled)
	const transaction = new btc.Transaction({
		allowUnknownInputs: true,
		allowUnknownOutputs: true
	});
	// Serialize OP_RETURN Data
	const mult = 100_000_000;
	const amountSats = Math.round(amountBtc * 100_000_000);

	const data = Cl.serialize(
		Cl.tuple({
			o: Cl.uint(outcomeIndex),
			i: Cl.uint(marketId),
			p: Cl.principal(stxAddress)
		})
	);
	//const encodedData = hex.encode(data);
	console.log('buildMockBitcoinSegwitTransaction: encodedData length: ' + data.length);
	console.log('buildMockBitcoinSegwitTransaction: encodedData length: ' + hex.decode(data).length);
	console.log('buildMockBitcoinSegwitTransaction: encodedData: ' + data);
	//if (data.length > 2) return '';
	// const OP_RETURN_PREFIX = new Uint8Array([0x6e]); // ✅ Correctly represents `0x6E` as a byte
	// const finalScript = concatBytes(OP_RETURN_PREFIX, hex.decode(encodedData));

	transaction.addOutput({
		script: btc.Script.encode(['RETURN', hex.decode(data)]),
		amount: BigInt(0)
	});

	//const amountSats = BigInt(Math.round(amountBtc * 100_000_000));

	transaction.addOutputAddress(getRpcParams().wallet, BigInt(amountSats), REGTEST_NETWORK); // ✅ Market wallet address (SegWit)
	const totalInput = utxos.reduce((acc: number, utxo: { amount: number }) => acc + utxo.amount, 0);
	console.log('buildMockBitcoinSegwitTransaction: input amount: ', amountBtc);

	const feeBtc = 0.0001;
	const feeSats = BigInt(Math.round(feeBtc * 100_000_000)); // ✅ 10,000 sats
	const totalOutputSats = BigInt(amountSats) + feeSats; // ✅ Safe BigInt math

	const totalInputSats = BigInt(Math.round(totalInput * 100_000_000)); // Convert total input

	const changeAmountSats = totalInputSats - totalOutputSats;
	if (changeAmountSats > 0) transaction.addOutputAddress(utxos[0].address, BigInt(changeAmountSats), REGTEST_NETWORK);

	// const privateKey: Signer = secp256k1.utils.randomPrivateKey();
	// const publicKey = secp256k1.getPublicKey(privateKey, true); // ✅ Derive compressed public key
	// const pubKeyHash = ripemd160(sha256(publicKey));
	// 4️⃣ Construct the SegWit `scriptPubKey` (0x00 | 0x14 | pubKeyHash)
	// const scriptPubKey = hex.encode(new Uint8Array([0x00, 0x14, ...pubKeyHash]));
	utxos.forEach((utxo: any) => {
		transaction.addInput({
			txid: utxo.txid,
			index: utxo.vout
		});
		console.log('buildMockBitcoinSegwitTransaction: input utxo: ', utxo);
	});

	// transaction.signIdx(privateKey, 0);
	// transaction.finalize();
	console.log('buildMockBitcoinSegwitTransaction: unsigned: ' + hex.encode(transaction.toBytes(true, true)));
	const signedTx = await bitcoinRPC('signrawtransactionwithwallet', [hex.encode(transaction.toBytes(true, true))], getRpcParams());
	console.log('buildMockBitcoinSegwitTransaction: signed rsponce: ', signedTx);
	const txid = await bitcoinRPC('sendrawtransaction', [signedTx.hex], getRpcParams());
	console.log('buildMockBitcoinSegwitTransaction: broadcast result: ' + txid);
	return { txid };
}

```
````

## Part 3: Send Transaction to Clarity

Use [clarity-bitcoin-client](https://github.com/BigMarketDao/clarity-bitcoin-client) to generate the proof data needed to communicate with the clarity layer;

````
```clarity
(define-public (predict-category 
    (height uint)
    (wtx (buff 4096))
    (header (buff 80))
    (tx-index uint)
    (tree-depth uint)
    (wproof (list 14 (buff 32)))
    (witness-merkle-root (buff 32))
    (witness-reserved-value (optional  (buff 32)))
    (ctx (optional (buff 1024)))
    (cproof (optional (list 14 (buff 32))))
  )
  (let (
      (verified 
        (if (is-some witness-reserved-value)
          (try! (verify-segwit height wtx header tx-index tree-depth wproof witness-merkle-root (unwrap! witness-reserved-value err-element-expected) (unwrap! ctx err-element-expected) (unwrap! cproof err-element-expected)))
          (try! (verify-legacy height wtx header { tx-index: tx-index, hashes: wproof, tree-depth: tree-depth}))
        )
      )
      (payload (if (is-some witness-reserved-value)
        (unwrap! (parse-payload-segwit wtx) err-element-expected)
        (unwrap! (parse-payload-legacy wtx) err-element-expected)
      ))
      (output1 (if (is-some witness-reserved-value)
        (unwrap! (get-output-segwit wtx u1) err-element-expected)
        (unwrap! (get-output-legacy wtx u1) err-element-expected)
      ))

```
````

where we verify by calling clarity bitcoin v5;

````
```clarity
(define-read-only (verify-segwit 
    (height uint)
    (wtx (buff 4096))
    (header (buff 80))
    (tx-index uint)
    (tree-depth uint)
    (wproof (list 14 (buff 32)))
    (witness-merkle-root (buff 32))
    (witness-reserved-value (buff 32))
    (ctx (buff 1024))
    (cproof (list 14 (buff 32)))
  )
  ;; commented out for testing on stacks testnet which is running on bitcoin regtest!
  (match (contract-call? .clarity-bitcoin-lib-v5 was-segwit-tx-mined-compact height wtx header tx-index tree-depth wproof witness-merkle-root witness-reserved-value ctx cproof)
    result (ok true)
    err err-transaction-segwit)
)

```
````

and can also parse the op\_return data straight back to clarity values using from-consensus-buf?

````
```clarity
(define-read-only (parse-payload-legacy (tx (buff 4096)))
  (match (get-output-legacy tx u0)
    parsed-result
    (let
      (
        (script (get scriptPubKey parsed-result))
        (script-len (len script))
        ;; lenght is dynamic one or two bytes!
        (offset (if (is-eq (unwrap! (element-at? script u1) err-element-expected) 0x4C) u3 u2)) 
        (payload (unwrap! (slice? script offset script-len) err-element-expected))
      )
      (asserts! (> (len payload) u2) err-element-expected)
      (ok (from-consensus-buff? { i: uint, o: uint, p: principal } payload))
    )
    not-found err-element-expected
  )
)

```
````



## Appendix A: bitcoin.conf

```
server=1
txindex=1

datadir=/Users/mijoco/bitcoin-regtest/data
rpccorsdomain=*
walletbroadcast=1

[regtest]
rpcuser=devnet
rpcpassword=devnet
rpcallowip=127.0.0.1
rpcbind=127.0.0.1
rpcport=18445

# Allow peer connections (Clarinet Devnet needs to connect)
listen=1
port=18446
bind=127.0.0.1

# Add Clarinet's regtest node as a peer
addnode=127.0.0.1:18444

# Avoid automatic pruning (ensures all blocks are available)
prune=0

# Generate blocks on demand (useful for testing)
blockfilterindex=1
fallbackfee=0.0002
```



