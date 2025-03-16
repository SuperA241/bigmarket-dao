---
description: Notes for using clarity-bitcoin-lib-v5 on devnet
---

# Devnet Development

Set up and run a local regtest node alongside Clarinet devnet.

1. Configure bitcoin.conf and Devnet.toml to talk to eachother
2. Send transactions on the local bitcoin regtest node
3. Confirm they get mined and that clarity-bitcoin lib can verify

### Part 1: Sync up bitcoin nodes

Restart process

1. stop clarinet devnet and bitcoin core

```
bitcoin-cli -conf=/Users/mijoco/bitcoin-regtest/bitcoin.conf -regtest stop
```

2. start devnet (\`clarinet devnet start\`) and bitcoin core

```
bitcoind -daemon -conf=/Users/mijoco/bitcoin-regtest/bitcoin.conf -datadir=/Users/mijoco/bitcoin-regtest/data -regtest
```

or bitcoin-qt

```
bitcoin-qt -regtest -conf=/Users/mijoco/bitcoin-regtest/bitcoin.conf
```



3. Check nodes in sync

```
docker exec -it bitcoin-node.bigmarket-dao.devnet bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet getblockchaininfo
docker exec -it bitcoin-node.bigmarket-dao.devnet bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet getpeerinfo

bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet getblockchaininfo
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet getpeerinfo
```

4. create non descriptor wallet

```
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet -rpcport=18445 createwallet "big-wallet" false false
```

5. mine some blocks / check balance

```
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet -rpcport=18445 -rpcwallet=big-wallet getnewaddress    
```

```
docker exec -it bitcoin-node.bigmarket-dao.devnet bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet generatetoaddress 1 bcrt1qtlye7v8ejj35wpf79qn23wg6ukkhk6se65jlyl
```

6. check balance

```
bitcoin-cli -regtest -rpcport=18445 -rpcuser=devnet -rpcpassword=devnet -rpcwallet=big-wallet getbalance
```

7. send btc to leather wallet

```
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet -rpcwallet=big-wallet sendtoaddress bcrt1q3tj2fr9scwmcw3rq5m6jslva65f2rqjxfrjz47 5
```

Generate a Wallet

```
stx make_keychain --backup_phrase "twice kind fence tip hidden tilt action fragile skin nothing glory cousin green tomorrow spring wrist shed math olympic multiply hip blue scout claw"
```

take the wif and use it to import wallet in bitcoin core

fund deployer btc address..

```
clarinet deployments apply -p deployments/send-btc.devnet-plan.yaml --no-dashboard
```

decode this transaction

```
bitcoin-cli -regtest -rpcport=18445 -rpcuser=devnet -rpcpassword=devnet decoderawtransaction "010000000112528a7588804ca4440735b3bd56ca22b3f5f48644676f97a81dfad834ece3da000000006a473044022009d2da88395d40000348da194cd48cae320e839ddce8743d20fe877aad1013d802207a2a74d4250480a12d71a2852bacafe35408622d36a4c0f264db690e71f52edd012102add319140c528a8955d76d4afe32c4d3143fea57ea353a31ce793cffb77ef861fdffffff0280969800000000001600148ae4a48cb0c3b7874460a6f5287d9dd512a1824610446d29010000001976a9142b19bade75a48768a5ffc142a86490303a95f41388ac00000000"
```



deploy devnet

<pre><code>
<strong>clarinet deployments apply -p deployments/default.devnet-plan.yaml --no-dashboard
</strong></code></pre>

generate in separate rgetest node

```yaml
bcrt1qmfp6qc8tyj6va240jt74xmwxp30exuq73srvsn

leather ..GZM address
bcrt1q3tj2fr9scwmcw3rq5m6jslva65f2rqjxfrjz47
```

Decode the transaction generated from deployment plan;

```
-> Transaction HEX
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet decoderawtransaction "0100000001c9c5a383ee54bdf6f8faca9d70270acb93ad261aafb400e8dadd1a73e7000fb9000000006a473044022077603b5fad59c1a1687668716ff847940974a218c2caa1bc5099af83a92fd7d0022039eeb664d914cd83660fe2221bbc5dd857fe7666cf001f30426c12248b120383012102add319140c528a8955d76d4afe32c4d3143fea57ea353a31ce793cffb77ef861fdffffff0280969800000000001600148ae4a48cb0c3b7874460a6f5287d9dd512a1824610446d29010000001976a9142b19bade75a48768a5ffc142a86490303a95f41388ac00000000"
✔ Transactions successfully confirmed on Devnet
```

Txid: fbdbbe4ebe969ccbe431e29d04b8dd8892fb1f21e91b09e691fd17b1dc21384d







### Appendix A: Configuration

local bitcoin.conf

```
server=1
txindex=1

[regtest]
rpcuser=devnet
rpcpassword=devnet
rpcallowip=127.0.0.1
rpcbind=127.0.0.1
rpcport=18445   # Use a different port than Clarinet’s Bitcoin node

# Allow peer connections (Clarinet Devnet should connect)
listen=1
port=18446      # Different from Clarinet’s P2P port
bind=127.0.0.1

# Connect to Clarinet’s Bitcoin node as a peer
addnode=127.0.0.1:18444  # Clarinet’s P2P port

# Avoid pruning
prune=0

# Enable indexing for transaction lookups
blockfilterindex=1
fallbackfee=0.0002
```

Devnet.toml

```
bitcoin_node_rpc_port = 18443
bitcoin_node_p2p_port = 18444
bitcoin_node_username = "devnet"
bitcoin_node_password = "devnet"
```



