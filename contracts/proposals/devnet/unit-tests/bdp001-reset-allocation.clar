;; Title: Gating
;; Author(s): mijoco.btc
;; Synopsis:
;; Description:

(impl-trait 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? .bme000-governance-token set-core-team-vesting
			(list
			;; wallets 1 5 6 
				{recipient: 'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB, start-block: burn-block-height, duration: u100}
				{recipient: 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0, start-block: burn-block-height, duration: u100} 
				{recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM, start-block: burn-block-height, duration: u100}
			)
		))
		(ok true)
	)
)
