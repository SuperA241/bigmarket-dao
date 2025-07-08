;; Title: bdp023-set-market-data
;; Synopsis:
;; Update prediction market variables.
;; Description:
;; sets the testnet addresses - overriding devnet values.

(impl-trait  'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		;; Enable genesis extensions.
		(try! (contract-call? .bme024-0-market-predicting set-resolution-agent 'ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV))
		(try! (contract-call? .bme024-0-market-predicting set-dev-fund 'ST3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNZN9J752))
		(try! (contract-call? .bme024-0-market-predicting set-dao-treasury .bme006-0-treasury))
		(try! (contract-call? .bme003-0-core-proposals set-core-team-member 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY true))
		(try! (contract-call? .bme003-0-core-proposals set-core-team-member 'ST3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNZN9J752 true))
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY true))
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'ST3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNZN9J752 true))
		(print "BigMarket DAO opinion polls are enabled.")
		(ok true)
	)
)
