;; Title: BDP000 account gating
;; Author: mijoco.btc
;; Description:
;; GENERATE TESTNET MERKLE ROOTS FOR MARKET CREATION

(impl-trait .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		;; Enable merkle root.
		;; see account-gating.test.ts / GENERATE TESTNET MERKLE ROOTS FOR MARKET CREATION
		;; const allowedCreators = ["ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV", "ST2RPDWF6N939Y32C4ZEVC74SCRTGSJBFBPJP05H5", "ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY"];
		(try! (contract-call? .bde022-market-gating set-merkle-root-by-principal .bde023-market-staked-predictions 0xd693025fae8e91c41d415fcb3f84dc4340b4ea78f7b4fc925aa347b41bca0091))

		(print "Merkle root for account gating updated.")
		(ok true)
	)
)
