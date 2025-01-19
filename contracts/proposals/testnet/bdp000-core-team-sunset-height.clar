;; Title: set-core-team-sunset-height
;; Author: Mike Cohen
;; Synopsis:
;; sets core team sunset height.

(impl-trait .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin

		(try! (contract-call? .bitcoin-dao set-extensions
			(list
				{extension: .bde021-market-resolution-voting, enabled: true}
				{extension: .bde022-market-gating, enabled: true}
			)
		))
		(try! (contract-call? .bde003-core-proposals set-core-team-sunset-height (+ burn-block-height u10)))

		(ok true)
	)
)
