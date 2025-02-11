;; Title: BDP000 account gating
;; Author: -
;; Description:
;; GENERATE TESTNET MERKLE ROOTS FOR MARKET CREATION

(impl-trait 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		;; ["ST2CS5XAA3FNHEQZRDVF6YY0NTAK7JFV7PKF1CPVM", "ST1W59M686N2VZE37TGJYJCYMR018NSZJV05WZ4CY", "ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY", "ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ"];
		(try! (contract-call? .bde022-market-gating set-merkle-root-by-principal .bde023-market-predicting 0x32052e1600fb0b2cf53566c79b129a1c0aea9b5f254de08ad26eb7fbfbaffbf3))

		(print "Merkle root for account gating updated.")
		(ok true)
	)
)
