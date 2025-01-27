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
		(try! (contract-call? .bde003-core-proposals set-core-team-member 'ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV true))
		(try! (contract-call? .bde003-core-proposals set-core-team-member 'ST2RPDWF6N939Y32C4ZEVC74SCRTGSJBFBPJP05H5 true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST2RPDWF6N939Y32C4ZEVC74SCRTGSJBFBPJP05H5 true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST1CMKP9X41A64WM0BVQ9HBG8QQ6FHKTZ85S7DM2R true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST1KRE4FNYJTN3R9S580J148BFKK0Z1A61WYKKW9P true))
		(try! (contract-call? .bde004-core-execute set-signals-required u2)) ;; signal from 3 out of 4 team members requied.
		(try! (contract-call? .bde022-market-gating set-merkle-root-by-principal .bde023-market-staked-predictions 0xd693025fae8e91c41d415fcb3f84dc4340b4ea78f7b4fc925aa347b41bca0091))
		(try! (contract-call? .bde023-market-staked-predictions set-resolution-agent 'ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV))
		(try! (contract-call? .bde023-market-staked-predictions set-dev-fund 'ST1KRE4FNYJTN3R9S580J148BFKK0Z1A61WYKKW9P))

		(print "Merkle root for account gating updated.")
		(ok true)
	)
)
