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
		(try! (contract-call? .bde003-core-proposals-tokenised set-core-team-member 'ST2293W5GRAYMAQTC5D3NZ0R5YR4XT56NW8P920W true))
		(try! (contract-call? .bde003-core-proposals-tokenised set-core-team-member 'ST1EVGZ9JDRDKMMVJKNQCFBG1JCNDAEDFJRV15S3C true))

		;; Set executive team members.
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST2293W5GRAYMAQTC5D3NZ0R5YR4XT56NW8P920W true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST1EVGZ9JDRDKMMVJKNQCFBG1JCNDAEDFJRV15S3C true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST3ZN50B98X3WGVDH0DG8MSTMB7GNRH035EFBQ4R5 true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST1JGAVFJ7N63M2CC0CY2RSKSQWK94DBVKK1TBAHT true))
		(try! (contract-call? .bde004-core-execute set-signals-required u2)) ;; signal from 3 out of 4 team members requied.

		;; configure prediction markets
		;; allowedCreators = ["ST2293W5GRAYMAQTC5D3NZ0R5YR4XT56NW8P920W", "ST1EVGZ9JDRDKMMVJKNQCFBG1JCNDAEDFJRV15S3C", "ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY", "ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ"];
		(try! (contract-call? .bde022-market-gating set-merkle-root-by-principal .bde023-market-predicting 0x88bbe7a9506b98e89f83df1cd16fea8402a1fcdd56c7e021b109a053bbf01cf7))
		(try! (contract-call? .bde023-market-predicting set-resolution-agent 'ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ))
		(try! (contract-call? .bde023-market-predicting set-dev-fund 'ST1JGAVFJ7N63M2CC0CY2RSKSQWK94DBVKK1TBAHT))
		(try! (contract-call? .bde023-market-predicting set-creation-gated true))
		(try! (contract-call? .bde023-market-predicting set-dao-treasury .bde006-treasury))
		(try! (contract-call? .bde023-market-predicting set-market-create-fee u100000000))
		(try! (contract-call? .bde023-market-predicting set-market-fee-bips-max u1000))
		(try! (contract-call? .bde023-market-predicting set-dev-fee-bips u200))
		(try! (contract-call? .bde023-market-predicting set-dao-fee-bips u200))
		(try! (contract-call? .bde023-market-predicting set-dispute-window-length u6))
		(try! (contract-call? .bde023-market-predicting set-allowed-token .wrapped-stx true))
		(try! (contract-call? .bde023-market-predicting set-allowed-token .sbtc true))
		(try! (contract-call? .bde023-market-predicting set-allowed-token .bde000-governance-token true))

		(try! (contract-call? .bde021-market-voting set-voting-duration u12))

		;; Fake sbtc mint.
		(try! (contract-call? .sbtc sbtc-mint-many
			(list
				{amount: u1000000000000000, recipient: 'ST2293W5GRAYMAQTC5D3NZ0R5YR4XT56NW8P920W}
				{amount: u1000000000000000, recipient: 'ST1EVGZ9JDRDKMMVJKNQCFBG1JCNDAEDFJRV15S3C}
				{amount: u1000000000000000, recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM}
				{amount: u1000000000000000, recipient: 'ST3ZN50B98X3WGVDH0DG8MSTMB7GNRH035EFBQ4R5}
				{amount: u1000000000000000, recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC}
				{amount: u1000000000000000, recipient: 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND}
				{amount: u1000000000000000, recipient: 'ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ}
			)
		))
		;; Mint initial token supply.
		(try! (contract-call? .bde000-governance-token bdg-mint-many
			(list
				{amount: u1000, recipient: sender}
				{amount: u1000, recipient: 'ST1EVGZ9JDRDKMMVJKNQCFBG1JCNDAEDFJRV15S3C}
				{amount: u1000, recipient: 'ST3ZN50B98X3WGVDH0DG8MSTMB7GNRH035EFBQ4R5}
				{amount: u1000, recipient: 'ST1JGAVFJ7N63M2CC0CY2RSKSQWK94DBVKK1TBAHT}
				{amount: u1000, recipient: 'ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ}
				{amount: u1000000000, recipient: .bde006-treasury}
			)
		))

		(print "Bitcoin DAO has risen.")
		(ok true)
	)
)
