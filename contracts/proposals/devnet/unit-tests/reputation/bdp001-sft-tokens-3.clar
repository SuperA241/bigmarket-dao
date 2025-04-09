;; Title: Gating
;; Author(s): mijoco.btc
;; Synopsis:
;; Description:

(impl-trait  'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? .bme030-0-reputation-token burn 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 u1 u500))
		(try! (contract-call? .bme030-0-reputation-token burn 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG u2 u5))
		(ok true)
	)
)
