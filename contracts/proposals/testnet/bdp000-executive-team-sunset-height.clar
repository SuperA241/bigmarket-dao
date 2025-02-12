;; Title: BDP000 Core Sunset Height
;; Synopsis:
;; sets core team sunset height.

(impl-trait 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin

		(try! (contract-call? .bme004-core-execute set-executive-team-sunset-height (+ burn-block-height u10)))

		(ok true)
	)
)
