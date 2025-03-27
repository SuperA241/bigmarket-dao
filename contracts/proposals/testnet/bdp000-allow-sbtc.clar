;; Title: allow sbtc
;; Synopsis:
;; enables prediction markets to use sbtc.

(impl-trait  .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? .bme023-0-market-scalar-pyth set-allowed-token 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token true))
		(ok true)
	)
)
