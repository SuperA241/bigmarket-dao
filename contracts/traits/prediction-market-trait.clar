(define-trait prediction-market-trait
  (
    (dispute-resolution (uint (buff 32) principal) (response bool uint))
    (resolve-market-vote (uint (buff 32) uint) (response bool uint))
  )
)