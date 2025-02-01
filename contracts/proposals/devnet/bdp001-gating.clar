;; Title: Gating
;; Author(s): Mike Cohen
;; Synopsis:
;; Description:

(impl-trait .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		;; Enable genesis extensions.
		;; [alice, bob, tom, betty, wallace];
		(try! (contract-call? .bde022-market-gating set-merkle-root-by-principal .bde023-market-predicting 0x5f24649277af2f6364faf35827dffe12b85f2f1dca5ae92733c72af91455aa64))
		(ok true)
	)
)
