;; Title: bdp010-enable-market-creation
;; Synopsis:
;; disables gating of market creation.

(impl-trait  'ST31A25YBK50KFJ2QS0EQK9FNXEQJD4PR0828789R.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? .bme024-0-market-scalar-pyth set-creation-gated true))
		(try! (contract-call? .bme024-0-market-predicting set-creation-gated true))
		(ok true)
	)
)
