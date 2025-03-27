(use-trait proposal-trait 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)
(define-trait voting-trait
  (
    (add-proposal (<proposal-trait>
                  (tuple 
                    (start-burn-height uint)
                    (end-burn-height uint)
                    (custom-majority (optional uint))
                    (proposer principal)))
                  (response bool uint))
  )
)
