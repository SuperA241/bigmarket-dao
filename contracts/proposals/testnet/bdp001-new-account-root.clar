;; Title: BDP000 account gating
;; Description:
;; Enable merkle root: see GENERATE TESTNET MERKLE ROOTS FOR MARKET CREATION
;; Allowed = ["ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV", "ST2RPDWF6N939Y32C4ZEVC74SCRTGSJBFBPJP05H5", "ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY"];
;; For ContractID = ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV.bme023-0-market-predicting => 0x61db988c6dfd25447d5df0406acca12463ef3aebecb95feba6ef2752d5a20aa3

(impl-trait  'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-predicting 0x88bbe7a9506b98e89f83df1cd16fea8402a1fcdd56c7e021b109a053bbf01cf7))

		(print "Merkle root for account gating updated.")
		(ok true)
	)
)
