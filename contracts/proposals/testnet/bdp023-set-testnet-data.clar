;; Title: bdp023-set-market-data
;; Author: daoguy
;; Depends-On: 
;; Synopsis:
;; Update prediction market variables.
;; Description:
;; sets the testnet addresses - overriding devnet values.

(impl-trait .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		;; Enable genesis extensions.
		(try! (contract-call? .bde023-market-staked-predictions set-resolution-agent 'ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV))
		(try! (contract-call? .bde023-market-staked-predictions set-dev-fund 'ST3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNZN9J752))
		(try! (contract-call? .bde023-market-staked-predictions set-dao-treasury .bde006-treasury))
		(try! (contract-call? .bde003-core-proposals set-core-team-member 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY true))
		(try! (contract-call? .bde003-core-proposals set-core-team-member 'ST3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNZN9J752 true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY true))
		(try! (contract-call? .bde004-core-execute set-executive-team-member 'ST3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNZN9J752 true))
		(print "Bitcoin DAO opinion polls are enabled.")
		(ok true)
	)
)
