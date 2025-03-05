# Bitcoin Markets

Our goal for the next 2 week sprint on the Buidl Hackathon:

> Make bigmarket.ai work for bitcoin users

Changes;

1. Enable toggle for bitcoin address and balance on the site header
2. Enable predictions to be made via Bitcoin transactions
3. Investigate possibility of claiming without stacks transactions

Step 1 is straight forward / can be achieved using existing tools via Hiro API.

Step 2 requires the ability to detect a bitcoin transaction in a clarity smart contract. sBTC protocol allows deposits to contract addresses as well as normal account addresses. Therefore a proof of this bitcoin transaction inthe clarity may be enough to link the deposit with the intention to stake in a market.&#x20;

There are some open questions here. Can we track back from the contract deposit to the bitcoin transaction? Can we validate messages signed with the users bitcoin key? Can we automate this server side, maybe with AI agents to auto detect these transactions and invoke the staking operation?

