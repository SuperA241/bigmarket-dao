---
description: Notes for using clarity-bitcoin-lib-v5 on devnet
---

# Devnet

Set up and run a local regtest node alongside Clarinet devnet.

1. Configure bitcoin.conf and Devnet.toml to talk to eachother
2. Send transactions on the local bitcoin regtest node
3. Confirm they get mined and that clarity-bitcoin lib can verify

### Part 1: Sync up bitcoin nodes

```
// as normal
clarinet devnet start 
// start local regtest node
bitcoind -conf=/Users/mijoco/bitcoin-regtest/bitcoin.conf -datadir=/Users/mijoco/bitcoin-regtest/data -regtest

// check clarinet docker bitcoin
docker exec -it bitcoin-node.bigmarket-dao.devnet bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet getblockchaininfo
docker exec -it bitcoin-node.bigmarket-dao.devnet bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet getpeerinfo

// check local node
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet getblockchaininfo
bitcoin-cli -regtest -rpcuser=devnet -rpcpassword=devnet getpeerinfo

```

### Part 2: Bitcoin Transactions



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



