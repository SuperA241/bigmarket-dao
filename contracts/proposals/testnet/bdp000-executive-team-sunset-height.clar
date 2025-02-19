;; Title: BDP000 Core Sunset Height
;; Synopsis:
;; sets core team sunset height.

(impl-trait  .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin

		(try! (contract-call? .bme004-0-core-execute set-executive-team-sunset-height (+ burn-block-height u10)))

		(ok true)
	)
)
