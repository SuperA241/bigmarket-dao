;; Title: Market wallet
;; Author(s): mijoco.btc
;; Synopsis:
;; Description:

(impl-trait  'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? .bme023-0-market-bitcoin set-market-wallet 0x00 0x8ae4a48cb0c3b7874460a6f5287d9dd512a18246))
		(ok true)
	)
)
