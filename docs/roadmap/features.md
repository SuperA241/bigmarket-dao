# Features

### How to get involved <a href="#phase-ii-implementation-suggestions" id="phase-ii-implementation-suggestions"></a>

Best way to begin the journey and join the BigMarket team is through testing.

#### Bug hunting

* testing the front end UI application will help become familiar with the features and also in finding bugs
* testing in the Clarity layer involves submitting Pull Requests for extending or improving our unit test framework

Becoming familiar with the application is of course a necessary first step.

### Feature Suggestions <a href="#phase-ii-implementation-suggestions" id="phase-ii-implementation-suggestions"></a>

Ideas for expanding BigMarket functionality

#### 1. [Staking via Swaps](https://app.gitbook.com/o/2ysVYBOkvvU7UOU2to93/s/3cIxRMJVHBYMrhhgNxl0/roadmaps/technical-roadmap/intra-chain-staking-via-swaps)​ <a href="#id-1.-intra-chain-staking-via-swaps" id="id-1.-intra-chain-staking-via-swaps"></a>

Introduce Velar Swap integration so users can stake in markets using their preferred token via a swap to the native token of the market (STX, sBTC, BIG etc).

#### 2. [Inter-Chain Staking via Swaps](https://app.gitbook.com/o/2ysVYBOkvvU7UOU2to93/s/3cIxRMJVHBYMrhhgNxl0/roadmaps/technical-roadmap/intra-chain-staking-via-swaps)​ <a href="#id-2.-inter-chain-staking-via-swaps" id="id-2.-inter-chain-staking-via-swaps"></a>

* STX-SUI
* STX-APTOS
* STX-ETH

Broaden BigMarket community by allowing users on these chains to stake in our markets using their native token and wallet

#### 3. [Prediction Market Trends and MCP Servers](https://app.gitbook.com/s/3cIxRMJVHBYMrhhgNxl0/roadmaps/technical-roadmap/mcp-servers-and-prediction-market-trends)​ <a href="#id-3.-prediction-market-trends-and-mcp-servers" id="id-3.-prediction-market-trends-and-mcp-servers"></a>

Model Context Protocol servers are becoming increasingly important in AI applications.

This stream would look into feasibility of using MCPs in a workflow that helps users understand pridiction market odds

#### 4. TON Integration <a href="#id-4.-ton-integration" id="id-4.-ton-integration"></a>

Create Telegram Bot that pulls market data and enables in app staking using TON. The TON would be swapped real time for STX on BigMarket

#### 5. Wormhole <a href="#id-5.-wire-network-vs-wormhole" id="id-5.-wire-network-vs-wormhole"></a>

Intetration with Stacks Aapplication for wormhole would be a community win. Not sure of the application but expect it would be needed for cross chain staking.

**6. Bitcoin**

Our Bitcoin contract needs to be updated with CPMM functionality. The best way to manage this is to understand the differences between;

* bme023-0-market-bitcoin.clar and&#x20;
* bme024-0-market-predicting.clar

where 023 is the old linear contract and 024 is the CPMM contract. &#x20;

[\
](https://app.gitbook.com/o/2ysVYBOkvvU7UOU2to93/s/3cIxRMJVHBYMrhhgNxl0/scalar-defi)
