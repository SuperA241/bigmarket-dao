;; Title: Gating
;; Author(s): mijoco.btc
;; Synopsis:
;; Description:

(impl-trait 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		;; Enable genesis extensions.
		;; [alice, bob, tom, betty, wallace];
		;;(try! (contract-call? .bme023-market-predicting set-market-create-fee u100000000))
		(try! (contract-call? .bme023-market-predicting set-creation-gated true))
		(try! (contract-call? .bme022-market-gating set-merkle-root-by-principal .bme023-market-predicting 0x5f24649277af2f6364faf35827dffe12b85f2f1dca5ae92733c72af91455aa64))
		(ok true)
	)
)
