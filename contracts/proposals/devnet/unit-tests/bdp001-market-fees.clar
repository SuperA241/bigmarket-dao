;; Title: Gating
;; Author(s): mijoco.btc
;; Synopsis:
;; Description:

(impl-trait .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? .bde023-market-predicting set-market-fee-bips-max u1000))
		(try! (contract-call? .bde023-market-predicting set-market-create-fee u1000))
		(try! (contract-call? .bde023-market-predicting set-dev-fee-bips u500))
		(try! (contract-call? .bde023-market-predicting set-dao-fee-bips u500))
		(ok true)
	)
)
