;; Title: Gating
;; Author(s): Mike Cohen
;; Synopsis:
;; Description:

(impl-trait .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? .bde023-market-predicting set-market-fee-bips-max u0))
		(try! (contract-call? .bde023-market-predicting set-market-create-fee u0))
		(try! (contract-call? .bde023-market-predicting set-dev-fee-bips u500))
		(try! (contract-call? .bde023-market-predicting set-dao-fee-bips u500))
		(ok true)
	)
)
