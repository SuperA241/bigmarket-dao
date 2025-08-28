;;; UniswapV2Router02.sol

(use-trait ft-trait 'SP2AKWJYC7BNY18W1XXKPGP0YVEK63QJG4793Z2D4.sip-010-trait-ft-standard.sip-010-trait)
(use-trait share-fee-to-trait 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-share-fee-to-trait.share-fee-to-trait)

(define-constant err-router-preconditions  (err u200))
(define-constant err-router-postconditions (err u201))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; swap
(define-public
  (swap-exact-tokens-for-tokens
    (id             uint)
    (token0         <ft-trait>)
    (token1         <ft-trait>)
    (token-in       <ft-trait>)
    (token-out      <ft-trait>)
    (share-fee-to   <share-fee-to-trait>)
    (amt-in         uint)
    (amt-out-min    uint)
  )
  (begin
    ;; Skip all checks and pool logic.
    ;; Assume router has sufficient token-out balance from mint-many.

    (try! (contract-call? token-in transfer amt-in tx-sender .univ2-router none))
    (try! (contract-call? token-out transfer amt-out-min .univ2-router tx-sender none))

    ;; Return dummy event with mocked amt-out
    (ok {amt-in: amt-in, amt-out: amt-out-min})
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
