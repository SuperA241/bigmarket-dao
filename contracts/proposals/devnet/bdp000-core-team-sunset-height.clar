;; Title: set-core-team-sunset-height
;; Author: mijoco.btc
;; Synopsis:
;; sets core team sunset height.

(impl-trait .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin

		(try! (contract-call? .bde003-core-proposals-tokenised set-core-team-sunset-height (+ burn-block-height u10)))

		(ok true)
	)
)
