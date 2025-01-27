;; Title: BDP000 Core Sunset Height
;; Author: Mike Cohen
;; Synopsis:
;; Boot proposal that sets the governance token, DAO parameters, and extensions, and
;; mints the initial governance tokens.
;; Description:
;; Mints the initial supply of governance tokens and enables the the following 
;; extensions: "BDE000 Governance Token", "BDE001 Proposal Voting",
;; "BDE002 Proposal Submission", "BDE003 Core Proposals",
;; "BDE004 Core Execute".

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
		(try! (contract-call? .bde003-core-proposals set-core-team-member 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY true))
		(try! (contract-call? .bde003-core-proposals set-core-team-member 'ST3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNZN9J752 true))

		;; Set executive team members.
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNZN9J752 true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST11BJYQFNW4QT57NJVHWSW0T4SYRGCBG2CHQJ83Q true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST1RQZ8Q8JXGZ8EWCSV3P6PDYB6Y1RBVJWF3BRQPX true))
		(try! (contract-call? .bde004-core-execute set-signals-required u2)) ;; signal from 3 out of 4 team members requied.

		;; configure prediction markets
		(try! (contract-call? .bde023-market-staked-predictions set-resolution-agent 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG))
		(try! (contract-call? .bde023-market-staked-predictions set-dev-fund 'ST3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNZN9J752))
		(try! (contract-call? .bde023-market-staked-predictions set-dao-treasury .bde006-treasury))

		;; configure prediction markets
		;; const allowedCreators = ["ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"];
		(try! (contract-call? .bde022-market-gating set-merkle-root-by-principal .bde023-market-staked-predictions 0x26067618f71da1da6fa33c9b7f8d989b87f71ade892e1c55ce3b46ac79a7e64e))
		(try! (contract-call? .bde023-market-staked-predictions set-resolution-agent 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY))
		(try! (contract-call? .bde023-market-staked-predictions set-dev-fund 'ST3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNZN9J752))
		(try! (contract-call? .bde023-market-staked-predictions set-dao-treasury .bde006-treasury))
		(try! (contract-call? .bde023-market-staked-predictions set-dispute-window-length u3))
		(try! (contract-call? .bde023-market-staked-predictions set-allowed-token .wrapped-stx true))
		(try! (contract-call? .bde023-market-staked-predictions set-allowed-token .sbtc true))

		;; Mint initial token supply.
		(try! (contract-call? .bde000-governance-token bdg-mint-many
			(list
				{amount: u1000, recipient: sender}
				{amount: u1000, recipient: 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY}
				{amount: u1000, recipient: 'ST3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNZN9J752}
				{amount: u1000, recipient: 'ST11BJYQFNW4QT57NJVHWSW0T4SYRGCBG2CHQJ83Q}
				{amount: u1000000000, recipient: .bde006-treasury}
			)
		))

		(print "Bitcoin DAO has risen.")
		(ok true)
	)
)
