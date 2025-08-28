;; Title: Gating
;; Author(s): mijoco.btc
;; Synopsis:
;; Description:

(impl-trait  'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		;; Enable genesis extensions.
		;; [alice, bob, tom, betty, wallace];
		(try! (contract-call? .bme024-0-market-predicting set-creation-gated false))
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme024-0-market-predicting 0x26067618f71da1da6fa33c9b7f8d989b87f71ade892e1c55ce3b46ac79a7e64e))
		(ok true)
	)
)
