(use-trait proposal-trait  'ST11804SFNTNRKZQBWB1R3F5YHEXSTXXEWZDXTMH6.proposal-trait.proposal-trait)
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
