(use-trait ft-token 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)
(define-trait prediction-market-trait
  (
    (dispute-resolution (uint principal uint) (response bool uint))
    (resolve-market-vote (uint uint) (response bool uint))
    (transfer-shares (uint uint principal principal uint <ft-token>) (response uint uint))
    (claim-winnings (uint <ft-token>) (response uint uint))
  )
)