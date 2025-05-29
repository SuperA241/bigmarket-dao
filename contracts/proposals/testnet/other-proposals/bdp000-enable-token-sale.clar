;; Title: allow sbtc
;; Synopsis:
;; enables prediction markets to use sbtc.

(impl-trait  'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? .bigmarket-dao set-extensions
			(list
				{extension: .bme010-0-token-sale, enabled: true}
			)
		))
		(ok true)
	)
)
