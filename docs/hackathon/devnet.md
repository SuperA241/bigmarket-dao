---
description: Notes for using clarity-bitcoin-lib-v5 on devnet
---

# Devnet

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

2. start devnet and bitcoin core

```
clarinet devnet start
bitcoind -conf=/Users/mijoco/bitcoin-regtest/bitcoin.conf -datadir=/Users/mijoco/bitcoin-regtest/data -regtest
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
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet createwallet "big-wallet" false false
```

5. mine some blocks / check balance

```
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet -rpcwallet=big-wallet getnewaddress
```

```
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet generatetoaddress 101 bcrt1qkt8ggmggzte67g9pfu6wpqu0tzpwyd9exw8ysj
```

6. check balance

```
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet -rpcwallet=big-wallet getbalance
```

7. send btc to leather wallet

```
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet -rpcwallet=big-wallet sendtoaddress bcrt1q3tj2fr9scwmcw3rq5m6jslva65f2rqjxfrjz47 5
```

### Configuration

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



