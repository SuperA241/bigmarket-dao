;; Title: set-core-team-sunset-height
;; Synopsis:
;; sets core team sunset height.

(impl-trait  .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin

		(try! (contract-call? .bme003-0-core-proposals set-core-team-sunset-height (+ burn-block-height u10)))

		(ok true)
	)
)
