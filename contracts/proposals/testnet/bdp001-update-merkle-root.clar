;; Title: BDP000 account gating
;; Description:
;; Enable merkle root: see GENERATE TESTNET MERKLE ROOTS FOR MARKET CREATION
;; Allowed = ["ST2P1A2ECDAT2053BMYKHCN3ZTRKPX2RAKKY9WJ38, ST15GF59RDTKS7YY8VMKREQ7A0C1CP1NEJE23DMJA, ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY, ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ, ST3SJD6KV86N90W0MREGRTM1GWXN8Z91PF6W0BQKM"];
;; For ContractID = bme023-0-market-predicting

(impl-trait  'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-predicting 0x865f22ef861a47324fed3c9aec19a60b47dd0f67a534c696538408350fccb962))
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-scalar-pyth 0x865f22ef861a47324fed3c9aec19a60b47dd0f67a534c696538408350fccb962))
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-bitcoin 0x865f22ef861a47324fed3c9aec19a60b47dd0f67a534c696538408350fccb962))

		(print "Merkle root for account gating updated.")
		(ok true)
	)
)
