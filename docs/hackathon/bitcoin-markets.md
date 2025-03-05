# Bitcoin Markets

Sprint Name: Buidl Hackathon

Sprint goal

> Make bigmarket.ai work for bitcoin users. Display amount and conversions in btc. Devise a mechanism to stake using only bitcoin transactions (consider claiming in the next sprint).

Approaches;

Bitcoin staking transaction

* **Option 1:** Use bitcoin deposit with op\_return for meta data
* **Option 2**: Use sBTC deposit with signed message for meta data

Option 1: Bitcoin Deposit

There are several ways to slice and dice this. P2TR means we can include meta data and the end user send a standard bitcoin commitment. Working with the time constraints of the hackathon a straight forward P2WPKH transaction is more managable.

The P2WPKH flow is as follows;&#x20;

1. user connects wallet to bigmarket.ai
2. user finds market, enters amount and clicks stake
3. system crafts a PSBT with market meta data in the OP\_RETURN
4. system invokes bitcoin web wallet for transaction signature
5. user signs and broadcasts

separate process let's say the monitor, periodically checks for new/confirmed transactions (note the monitor is decentralised - nothing to stop anyone else performing the same function).

On detection of new transaction;

1. monitor reads the transactions block data and constructs a Merkle proof
2. monitor submits merkle proof to contract
3. contract (using clarity-bitoin-v5) determines the vlidity of transaction
4. contract transfers the staked amount of sBTC to the staking contract - along with the user and market details

Uncertainties:

parsing op\_return in clarity - not sure if / how this is done atm?







