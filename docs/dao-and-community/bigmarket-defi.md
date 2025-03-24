# BigMarket DeFi

Our scalar prediction markets are set up on any regular  schedule and take a range either side of the current price point on BTC/STX/ETH.

They can run for a day or a month or longer and traders can stake on the markets taking long / short / neutral positions on price.

markets resolve on-chain (via Pyth on-chain oracle) - no human intervention is required.

### ✅ BigMarket Fee Model

#### Our fee model is unique;

* 🔑  **Governance-first**: All fees are on-chain, DAO/community-configurable.
* 🔑  **Winner-pays**: Most fees are charged on **successful predictions**, not on entry—minimizing friction.
* 🔑  **Modular incentives**: Encourages custom markets with aligned local incentives via creator-tuned Market Fund.
* 🔑  **No LPs needed**: Fee extraction doesn’t depend on liquidity providers like AMMs.

| Feature                              | Your Scalar Markets       | Curve / dYdX              | OTC                 |
| ------------------------------------ | ------------------------- | ------------------------- | ------------------- |
| **Fee Control**                      | Fully DAO & creator-tuned | DAO/governance limited    | None (private)      |
| **Fee Visibility**                   | Transparent, on-chain     | Mostly, yes               | None                |
| **Winner-Based Fees**                | ✅ Yes                     | ❌ No                      | ❌ No                |
| **Market-Specific Treasury**         | ✅ Yes                     | ❌ No                      | ❌ No                |
| **Developer Incentive Clarity**      | ✅ Dev Fund on-chain       | ❌ Separate                | ❌ Built into spread |
| **User Participation in Fee Policy** | ✅ Active role             | ✅ Indirect via tokenomics | ❌ None              |



### 🧾 Fee Structure Comparison

#### 📈 $10,000 Market Payout — Cross-Platform Comparison

| **Platform**             | **When Fees Are Charged** | **Fee Breakdown**                                                                  | **Recipients**                           | **Total Fees** | **Net to Trader** |
| ------------------------ | ------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- | -------------- | ----------------- |
| **BigMarket (Low Fees)** | ✅ Only on winnings        | <p>Dev Fund: 0.1% ($10)<br>DAO Treasury: 0.2% ($20)<br>Market Fund: 0.5% ($50)</p> | Developers, DAO Treasury, Market Creator | **$80**        | **$9,920**        |
| **dYdX (Ethereum)**      | ❌ Entry & exit            | \~0.05–0.1% per trade × 2                                                          | Protocol Treasury, LPs, Referrers        | **$10–$20**    | **$9,980–$9,990** |
| **Curve (Ethereum)**     | ❌ Entry & exit            | \~0.04% per trade × 2                                                              | LPs & veCRV holders                      | **$8**         | **$9,992**        |
| **OTC Desk (TradFi)**    | ❌ Embedded in spread      | \~1–3% markup                                                                      | Desk’s profit margin                     | **$100–$300**  | **$9,700–$9,900** |

***

#### ✅ BigMarket Fee Flow (Low-Fee Configuration)

When a trader wins a $10,000 payout:

```
pgsqlCopy$10      → Developer Fund (0.1%)
$20      → DAO Treasury (0.2%)
$50      → Market-Specific Treasury (0.5%)
----------------------------------------
$80 Total Fees
$9,920 Net to Winner
```
