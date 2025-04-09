;; Title: Gating
;; Author(s): mijoco.btc
;; Synopsis:
;; Description:

(impl-trait  'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? .bme030-0-reputation-token mint 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 u1 u1000))
		(try! (contract-call? .bme030-0-reputation-token mint 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 u2 u10))
		(try! (contract-call? .bme030-0-reputation-token mint 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG u1 u1000))
		(try! (contract-call? .bme030-0-reputation-token mint 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG u2 u10))
		(try! (contract-call? .bme030-0-reputation-token transfer-many
			(list
				{token-id:u1, amount: u1, sender: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC}
				{token-id:u1, amount: u1, sender: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG, recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC}
				{token-id:u2, amount: u1, sender: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC}
				{token-id:u2, amount: u1, sender: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG, recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC}
			)
		))
		(ok true)
	)
)
