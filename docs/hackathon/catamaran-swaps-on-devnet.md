---
description: Notes for using clarity-bitcoin-lib-v5 on devnet
---

# Catamaran Swaps on Devnet

Set up and run a local regtest node alongside Clarinet devnet.

1. Configure bitcoin.conf and Devnet.toml to talk to eachother
2. Send transactions on the local bitcoin regtest node
3. Confirm they get mined and that clarity-bitcoin lib can verify

### Clarinet Devnet / Bitcoin Core

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

### Appendix A: bitcoin.conf

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



