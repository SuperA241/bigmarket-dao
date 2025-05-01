<img src="https://brightblock.org/logo/bm-logo-kight-blue.png" alt="BigMarket Logo" style="width: auto; max-width: 500px; display: inline-block; margin: 1rem auto;align:left;" />

# BigMarket Contracts

## Description

A system of smart contracts, based on [Executor DAO](https://github.com/Clarity-Innovation-Lab/executor-dao),
for community ownership and management of on-chain prediction market machinery.

## Development

- Vite
- Clarinet SDK
- Stacks.js

To run tests:

```bash
git clone ..
npm install
npm run test
```

## Deployment

Thje project is deployed with the following keys;

- testnet: [ST31A25YBK50KFJ2QS0EQK9FNXEQJD4PR0828789R](https://explorer.hiro.so/address/ST31A25YBK50KFJ2QS0EQK9FNXEQJD4PR0828789R?chain=testnet)
- mainnet: [TBD]

Once deployed the DAO is constructed with a bootstrap proposal. This proposal configures many aspects of the DAO with the initial
parameters and configuration.

### History & Commands

% stx make_keychain -t
% stx make_keychain --backup_phrase -t ""

[accounts.deployer.3]
"mnemonic": "bone solid draft aerobic grid envelope draw torch hurdle submit peasant steel say build recipe airport either item brown boil butter brief skull vendor",
"privateKey": "63ff02cc62e09f5a5b6531133caa3d8c68d7e3356916822f1171c342d3113bc801",
"publicKey": "0248eec0cc49312cb4b6f8a1d3739e9743aae74b3a8523693f1eb148af0433c426",
"address": "ST2P1A2ECDAT2053BMYKHCN3ZTRKPX2RAKKY9WJ38",
"btcAddress": "mwCqipA4UNPYmHiw494yzxoYsA9vXp4pmh",
"wif": "cQw5ewyKXA2HK8Sso5xShLRZN91QmJP4duHnnxpyHRTqT29Ls4WG",

0: ST2P1A2ECDAT2053BMYKHCN3ZTRKPX2RAKKY9WJ38
1: ST15GF59RDTKS7YY8VMKREQ7A0C1CP1NEJE23DMJA
2: ST205A56XSM3F65NQBDBNN9FNZF5J9TBFH1MY1TJ1
3: ST16RPMHH96463TP1AFEWZKQ12D7CY57YZGRWJR88

[accounts.deployer.2]
"mnemonic": "car cycle lizard wage busy gain paper ticket orient gentle globe chuckle wrist hurt chat great wink hotel crouch height timber dolphin anger scissors",
"privateKey": "13837dcffa014e9ff9aaf54934bb9471b13c7c7e3cb8a58e9995517f41686ae201",
"publicKey": "02dc0a2be7def28a5318215bb844ea6c978700b70bf456e216dd506858a2f08fcc",
"address": "ST1SV7MYKRKKDG8PHSSKZ0W66DPKRPB5KV8ACN62G",
"btcAddress": "mr4jRk9kXXFrveEx24Wfhzucy9oRQwNvYC",
"wif": "cNEdhhLzUBxwubyibDaFsJrbpfnn1LjVybcZiyEBVDYjpszfSbAn",

0: ST1SV7MYKRKKDG8PHSSKZ0W66DPKRPB5KV8ACN62G
1: ST2F4ZBBV22RF2WYR424HKX5RDN6XRK19X37YEVGG
2: STNNX8QFM2MPJ35V9SNH6BMWYRJF8KVZC3XDZGVZ
3: ST1EEDB05014JVXS8BF3E1G54WC5M782AC66WPHAR

[accounts.deployer.1]
mnemonic = "spray film true unusual faith genius small knife shell ice manage disagree wise junk spatial aerobic enroll goat fan true kitten merry swamp volcano"
#"privateKey": "e0b4979d0d73e2fbe3871271f8bbd4151627f8c1cff8937b674e90fdf998441401",
#"publicKey": "03ce1edd57321fa0fbfa37dcf3290ae9df4481ba2a2d0d8ace91a16a51ec1efac0",
#"btcAddress": "myG4NCkyKGPTABWY5ARCeFcemeK99UjzXs",
#"wif": "cV7Vw5GmVw1N8fM5MNaNrjx8qZFouWShLa2tRZmjh5RvVNmY2DpY",
#"index": 0
0: ST31A25YBK50KFJ2QS0EQK9FNXEQJD4PR0828789R / bcrt1q02k2fwu9kupez7ecqj9p489qswg0th98n29hjs
1: ST2ZGXYF58V9D2HXDTP3N02DC3F8G2251PPGRXDQD / bcrt1q0d8k6ltq90e8gdt5d056f43vqgrj8vlk2xwn20
2: ST4MRSK0XMGX05VNWNNTQQE8D8RN5J91SP5VWWCV
3: ST18V03KSFR84AG69JEPG6SM7GA1CBJR6PSXS1Y8M
