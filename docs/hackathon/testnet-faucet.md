# Testnet Faucet

Get bitcoin for testing on stacks bitcoin regtest network;

```
curl -X POST "https://api.testnet.hiro.so/extended/v1/faucets/btc?address=bcrt1q9j0660jr3v8leqhr2tptvcw0jtr538n0t3c2fw"

```

Note this needs docs bug raising on Hiro [here](https://docs.hiro.so/stacks/api/faucets/stx)!

## Address types

#### **Summary Table of All Bitcoin Address Prefixes**

| **Transaction Type**       | **Mainnet** | **Testnet** | **Regtest** |
| -------------------------- | ----------- | ----------- | ----------- |
| **P2PKH** (Legacy)         | `1`         | `m` or `n`  | `m` or `n`  |
| **P2SH** (Script-based)    | `3`         | `2`         | `2`         |
| **P2WPKH** (SegWit)        | `bc1q`      | `tb1q`      | `bcrt1q`    |
| **P2WSH** (SegWit Scripts) | `bc1q`      | `tb1q`      | `bcrt1q`    |
| **P2TR** (Taproot)         | `bc1p`      | `tb1p`      | `bcrt1p`    |

Would you like me to expand on **script construction for each type** or explain how to **decode and generate these addresses**? 🚀
