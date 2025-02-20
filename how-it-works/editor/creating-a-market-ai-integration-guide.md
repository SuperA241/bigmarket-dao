# Creating a Market (AI Integration Guide)

### **📌 Market Creation for Developers & AI Integration**

Developers and **AI agents** can **automate market creation** by interacting directly with the **BigMarket smart contract**. This section covers **how to structure the request**, sign data, and interact with the **create-market** function.

#### **🛠️ Smart Contract Function: `create-market`**

To create binary and categorical markets via smart contract, call:To create binary and categorical markets via smart contract, call:

```clarity
(create-market 
   (categories (list 10 (string-ascii 64))) 
   (fee-bips (optional uint)) 
   (token <ft-token>) 
   (market-data-hash (buff 32)) 
   (proof (list 10 (tuple (position bool) (hash (buff 32))))) 
   (treasury principal)
)
```

To create scalar markets via smart contract, call:

```
(create-market 
   (categories (list 10 {min: uint, max: uint})) 
   (fee-bips (optional uint)) 
   (token <ft-token>) 
   (market-data-hash (buff 32)) 
   (proof (list 10 (tuple (position bool) (hash (buff 32))))) 
   (treasury principal) 
   (market-duration (optional uint)) 
   (cool-down-period (optional uint))
   (price-feed-id (string-ascii 32)))
)
```

**Note: Categories for scalar markets are list of min/max points and these must be contiguous.**

#### **📝 Required Parameters**

| **Parameter**      | **Type**                                                        | **Description**                                |
| ------------------ | --------------------------------------------------------------- | ---------------------------------------------- |
| `categories`       | **list 10 (string-ascii 64) or list 10 ({min:uint, max:uint})** | Market outcomes (e.g. yes/no for binary)       |
| `fee-bips`         | **optional uint**                                               | Market fee in **basis points** (100 bips = 1%) |
| `token`            | **ft-token**                                                    | Fungible token used (must be DAO-approved)     |
| `market-data-hash` | **buff 32**                                                     | Hash of signed market data                     |
| `proof`            | **list 10 (tuple (position bool) (hash (buff 32)))**            | Merkle proof (if gating is enabled)            |
| `treasury`         | **principal**                                                   | Address where market fees are sent             |

#### **📌 Off-Chain Data Signing**

To ensure data integrity, **market data must be signed** before submission. This prevents malicious modifications. The hash is then passed to the **`create-market`** function.

#### **📍 Example API Integration (TypeScript)**

Here’s an example of how to **create a market using an API request**:

```typescript
CreateMarketRequest {
  name: string;
  type: "binary" | "categorical" | "scalar";
  description: string;
  criteria: string;
  treasury: string;
  marketImage: string;
  feePercentage: number;
  token: string;
  categories: string[];
  socialLinks: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
}

// Example usage
const newMarket = {
  name: "Will Bitcoin reach $100K in 2025?",
  type: "binary",
  description: "Predict if Bitcoin will cross $100,000 before the end of 2025.",
  criteria: "Resolution based on Bitcoin price on December 31, 2025.",
  treasury: "SP123456789...",
  marketImage: "https://example.com/market-image.png",
  feePercentage: 200,
  token: "STX",
  category: 'crypto',
  categories: ["Yes", "No"], // binary market
  social: { twitter: {projectHandle: 'Stacks'}, discord: {serverId: '1306302974515089510'}, website: {url: 'https://www.stacks.co/'}}
};

const newMarket = {
  name: "Best film in Baftas",
  type: "binary",
  description: "Which films will win best overall?",
  criteria: "Baesed on official announcement",
  treasury: "SP123456789...",
  marketImage: "https://example.com/market-image.png",
  feePercentage: 200,
  token: "STX",
  category: 'politics',
  categories: ["Film 1", "Film 2", "Film 3"], // categorical market
  social: { twitter: {projectHandle: 'Stacks'}, discord: {serverId: '1306302974515089510'}, website: {url: 'https://www.stacks.co/'}}
};

```

***

### **SIP 18 Signing**

**The data passed to sip-018 signing function is;**

```typescript
export function marketDataToTupleCV(
  name: string,
  category: string,
  createdAt: number,
  proposer: string,
  token: string
) {
  return tupleCV({
    name: stringAsciiCV(name),    
    criteria: stringAsciiCV(criteria),
    category: stringAsciiCV(category),
    createdAt: uintCV(createdAt),
    proposer: principalCV(proposer),
    token: stringAsciiCV(token),
  });
}
```

this is passes to the wallet for signing via;

```
export async function signCreateMarketRequest(market: TupleCV<TupleData<ClarityValue>>, callback: any) {
	openStructuredDataSignatureRequestPopup({
		message: market,
		domain: domainCV(domain),
		network: getStxNetwork(),
		appDetails: {
			name: bigmarket-dao,
			icon: https://bigmarket.ai/img/stx_eco_logo_icon_white.png
		},
		onFinish(signature) {
			let res = verifyDaoSignature(getConfig().VITE_NETWORK, getConfig().VITE_PUBLIC_APP_NAME, getConfig().VITE_PUBLIC_APP_VERSION, market, signature.publicKey, signature.signature);
			callback(signature);
		}
	});
}

where 

export function domainCV(domain: any) {
	return tupleCV({
		name: stringAsciiCV(domain.name),
		version: stringAsciiCV(domain.version),
		'chain-id': uintCV(domain['chain-id'])
	});
}

and 

export const domain = {
	name: getConfig().VITE_PUBLIC_APP_NAME,
	version: getConfig().VITE_PUBLIC_APP_VERSION,
	'chain-id': getConfig().VITE_NETWORK === 'mainnet' ? ChainId.Testnet : ChainId.Testnet
};

VITE_PUBLIC_APP_NAME: 'BigMarket',
VITE_PUBLIC_APP_VERSION: '1.0.0',
```

