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
				{extension: .bde001-proposal-voting, enabled: true}
				{extension: .bde003-core-proposals, enabled: true}
				{extension: .bde004-core-execute, enabled: true}
				{extension: .bde006-treasury, enabled: true}
				{extension: .bde021-market-resolution-voting, enabled: true}
				{extension: .bde022-market-gating, enabled: true}
				{extension: .bde023-market-staked-predictions, enabled: true}
			)
		))
		;; Set core team members.
		(try! (contract-call? .bde003-core-proposals set-core-team-member 'ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV true))
		(try! (contract-call? .bde003-core-proposals set-core-team-member 'ST2RPDWF6N939Y32C4ZEVC74SCRTGSJBFBPJP05H5 true))

		;; Set executive team members.
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST2RPDWF6N939Y32C4ZEVC74SCRTGSJBFBPJP05H5 true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST1CMKP9X41A64WM0BVQ9HBG8QQ6FHKTZ85S7DM2R true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST1KRE4FNYJTN3R9S580J148BFKK0Z1A61WYKKW9P true))
		(try! (contract-call? .bde004-core-execute set-signals-required u2)) ;; signal from 3 out of 4 team members requied.

		;; configure prediction markets
		;; const allowedCreators = ["ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"];
		(try! (contract-call? .bde022-market-gating set-merkle-root-by-principal .bde023-market-staked-predictions 0x26067618f71da1da6fa33c9b7f8d989b87f71ade892e1c55ce3b46ac79a7e64e))
		(try! (contract-call? .bde023-market-staked-predictions set-resolution-agent 'ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV))
		(try! (contract-call? .bde023-market-staked-predictions set-dev-fund 'ST1KRE4FNYJTN3R9S580J148BFKK0Z1A61WYKKW9P))
		(try! (contract-call? .bde023-market-staked-predictions set-dao-treasury .bde006-treasury))
		(try! (contract-call? .bde023-market-staked-predictions set-dispute-window-length u6))
		(try! (contract-call? .bde023-market-staked-predictions set-allowed-token .wrapped-stx true))
		(try! (contract-call? .bde023-market-staked-predictions set-allowed-token .sbtc true))

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
