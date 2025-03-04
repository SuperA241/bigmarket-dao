;; Title: allow sbtc
;; Synopsis:
;; enables prediction markets to use sbtc.

(impl-trait  'ST31A25YBK50KFJ2QS0EQK9FNXEQJD4PR0828789R.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? 'ST31A25YBK50KFJ2QS0EQK9FNXEQJD4PR0828789R.bme023-0-market-predicting set-allowed-token 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token true))
		(try! (contract-call? 'ST31A25YBK50KFJ2QS0EQK9FNXEQJD4PR0828789R.bme023-0-market-scalar set-allowed-token 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token true))
		(ok true)
	)
)
