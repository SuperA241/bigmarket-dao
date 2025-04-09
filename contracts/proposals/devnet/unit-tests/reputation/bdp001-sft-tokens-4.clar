;; Title: Gating
;; Author(s): mijoco.btc
;; Synopsis:
;; Description:

(impl-trait  'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
	;; 5 1001s from alice to bob
		(try! (contract-call? .bme030-0-reputation-token transfer u2 u5 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG))
	;; 1000 1000s from bob to alice
		(try! (contract-call? .bme030-0-reputation-token transfer u1 u1000 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5))
		(ok true)
	)
)
