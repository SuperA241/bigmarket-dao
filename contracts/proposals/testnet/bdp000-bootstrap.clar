;; Title: BDP000 Bootstrap
;; Author: mijoco.btc
;; Description:
;; Sets up and configure the DAO

(impl-trait .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		;; Enable genesis extensions.
		(try! (contract-call? .bitcoin-dao set-extensions
			(list
				{extension: .bde000-governance-token, enabled: true}
				{extension: .bde001-proposal-voting-tokenised, enabled: true}
				{extension: .bde003-core-proposals-tokenised, enabled: true}
				{extension: .bde004-core-execute, enabled: true}
				{extension: .bde006-treasury, enabled: true}
				{extension: .bde021-market-voting, enabled: true}
				{extension: .bde022-market-gating, enabled: true}
				{extension: .bde023-market-predicting, enabled: true}
			)
		))
		;; Set core team members.
		(try! (contract-call? .bde003-core-proposals-tokenised set-core-team-member 'ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV true))
		(try! (contract-call? .bde003-core-proposals-tokenised set-core-team-member 'ST2RPDWF6N939Y32C4ZEVC74SCRTGSJBFBPJP05H5 true))

		;; Set executive team members.
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST2RPDWF6N939Y32C4ZEVC74SCRTGSJBFBPJP05H5 true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST1CMKP9X41A64WM0BVQ9HBG8QQ6FHKTZ85S7DM2R true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST1KRE4FNYJTN3R9S580J148BFKK0Z1A61WYKKW9P true))
		(try! (contract-call? .bde004-core-execute set-signals-required u2)) ;; signal from 3 out of 4 team members requied.

		;; configure prediction markets
		;; allowedCreators = ["ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV", "ST2RPDWF6N939Y32C4ZEVC74SCRTGSJBFBPJP05H5", "ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY", "ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ"];
		(try! (contract-call? .bde022-market-gating set-merkle-root-by-principal .bde023-market-predicting 0x88bbe7a9506b98e89f83df1cd16fea8402a1fcdd56c7e021b109a053bbf01cf7))
		(try! (contract-call? .bde023-market-predicting set-resolution-agent 'ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV))
		(try! (contract-call? .bde023-market-predicting set-dev-fund 'ST1KRE4FNYJTN3R9S580J148BFKK0Z1A61WYKKW9P))
		(try! (contract-call? .bde023-market-predicting set-dao-treasury .bde006-treasury))
		(try! (contract-call? .bde023-market-predicting set-market-create-fee u50))
		(try! (contract-call? .bde023-market-predicting set-market-fee-bips-max u600))
		(try! (contract-call? .bde023-market-predicting set-dev-fee-bips u200))
		(try! (contract-call? .bde023-market-predicting set-dao-fee-bips u200))
		(try! (contract-call? .bde023-market-predicting set-dispute-window-length u6))
		(try! (contract-call? .bde023-market-predicting set-allowed-token .wrapped-stx true))
		(try! (contract-call? .bde023-market-predicting set-allowed-token .sbtc true))

		;; Mint initial token supply.
		(try! (contract-call? .bde000-governance-token bdg-mint-many
			(list
				{amount: u1000, recipient: sender}
				{amount: u1000, recipient: 'ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV}
				{amount: u1000, recipient: 'ST2RPDWF6N939Y32C4ZEVC74SCRTGSJBFBPJP05H5}
				{amount: u1000, recipient: 'ST1CMKP9X41A64WM0BVQ9HBG8QQ6FHKTZ85S7DM2R}
				{amount: u1000000000, recipient: .bde006-treasury}
			)
		))

		(print "Bitcoin DAO has risen.")
		(ok true)
	)
)
