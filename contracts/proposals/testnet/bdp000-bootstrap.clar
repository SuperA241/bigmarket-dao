;; Title: BDP000 Bootstrap
;; Author: mijoco.btc
;; Description:
;; Sets up and configure the DAO

(impl-trait .proposal-trait.proposal-trait)

(define-constant token-supply u10000000000000)

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
				{extension: .bde010-token-sale, enabled: true}
				{extension: .bde021-market-voting, enabled: true}
				{extension: .bde022-market-gating, enabled: true}
				{extension: .bde023-market-predicting, enabled: true}
			)
		))
		;; Set core team members.
		(try! (contract-call? .bde003-core-proposals-tokenised set-core-team-member 'ST37GR4292BERRGXYVK317DQ1VCKJKZM375SQVBJZ true))
		(try! (contract-call? .bde003-core-proposals-tokenised set-core-team-member 'STV37B0DG2K89FXDY1GJQWWGH4VGRBK6941GG849 true))

		;; Set executive team members.
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST37GR4292BERRGXYVK317DQ1VCKJKZM375SQVBJZ true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'STV37B0DG2K89FXDY1GJQWWGH4VGRBK6941GG849 true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'STPBQA353JF9PC2T9NHEF0P155MNM7SMJ8KDGB09 true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'STTCAQJM6D5J1WAH1Z3X5A3NFN7FRSBHYCF7DE17 true))
		(try! (contract-call? .bde004-core-execute set-signals-required u2)) ;; signal from 3 out of 4 team members requied.

		;; configure prediction markets
		;; allowedCreators = ["ST37GR4292BERRGXYVK317DQ1VCKJKZM375SQVBJZ", "STV37B0DG2K89FXDY1GJQWWGH4VGRBK6941GG849", "ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY", "ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ"];
		(try! (contract-call? .bde022-market-gating set-merkle-root-by-principal .bde023-market-predicting 0xe6b0a3652319a9d8735f2fde4f36e578abc6eeb3c5eab85dbc994afc034ae8ee))
		(try! (contract-call? .bde023-market-predicting set-resolution-agent 'ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ))
		(try! (contract-call? .bde023-market-predicting set-dev-fund 'STTCAQJM6D5J1WAH1Z3X5A3NFN7FRSBHYCF7DE17))
		(try! (contract-call? .bde023-market-predicting set-creation-gated true))
		(try! (contract-call? .bde023-market-predicting set-dao-treasury .bde006-treasury))
		(try! (contract-call? .bde023-market-predicting set-market-create-fee u1000000))
		(try! (contract-call? .bde023-market-predicting set-market-fee-bips-max u1000))
		(try! (contract-call? .bde023-market-predicting set-dev-fee-bips u200))
		(try! (contract-call? .bde023-market-predicting set-dao-fee-bips u200))
		(try! (contract-call? .bde023-market-predicting set-dispute-window-length u6))
		(try! (contract-call? .bde023-market-predicting set-allowed-token .wrapped-stx true))
		(try! (contract-call? .bde023-market-predicting set-allowed-token .sbtc true))
		(try! (contract-call? .bde023-market-predicting set-allowed-token .bde000-governance-token true))

		(try! (contract-call? .bde021-market-voting set-voting-duration u12))
		(try! (contract-call? .bde010-token-sale initialize-ido))

		;; Fake sbtc mint.
		(try! (contract-call? .sbtc sbtc-mint-many
			(list
				{amount: u1000000000000000, recipient: 'ST37GR4292BERRGXYVK317DQ1VCKJKZM375SQVBJZ}
				{amount: u1000000000000000, recipient: 'STV37B0DG2K89FXDY1GJQWWGH4VGRBK6941GG849}
				{amount: u1000000000000000, recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM}
				{amount: u1000000000000000, recipient: 'STPBQA353JF9PC2T9NHEF0P155MNM7SMJ8KDGB09}
				{amount: u1000000000000000, recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC}
				{amount: u1000000000000000, recipient: 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND}
				{amount: u1000000000000000, recipient: 'ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ}
			)
		))
		;; core team voting rights unlock over u105120 bitcoin block period 
		(try! (contract-call? .bde000-governance-token set-core-team-vesting
			(list
				{recipient: sender, start-block: burn-block-height, duration: u105120}
				{recipient: 'STV37B0DG2K89FXDY1GJQWWGH4VGRBK6941GG849, start-block: burn-block-height, duration: u105120} 
				{recipient: 'STPBQA353JF9PC2T9NHEF0P155MNM7SMJ8KDGB09, start-block: burn-block-height, duration: u105120} 
				{recipient: 'ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ, start-block: burn-block-height, duration: u105120}
				{recipient: 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY, start-block: burn-block-height, duration: u105120}
			)
		))
		(try! (contract-call? .bde000-governance-token bdg-mint-many
			(list
				{amount: (/ (* u1000 token-supply) u10000), recipient: .bde006-treasury}
			)
		))

		(print "Bitcoin DAO has risen.")
		(ok true)
	)
)
