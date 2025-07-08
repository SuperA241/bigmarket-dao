;; Title: BDP-001 Buy Proposal
;; Description:
;; Called by a market contract at resolution to do some action in response to the outcome
;; of the market. For example if the outcome says the price of STX will fall over the forthcoming 
;; week the market will sell STX and conversely buy STX. The actual actions of the proposal depend
;; on the execute method that is called by the base dao.

(impl-trait  'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-data-var resolved-market-id (optional uint) none)
(define-data-var resolved-outcome (optional uint) none)

(define-public (execute (sender principal))
  (begin
    ;; check sender is the DAO
    (asserts! (is-eq sender .bigmarket-dao) (err u5000))
    ;; do something with the outcome (e.g., distribute winnings or update state)
    (ok true)
  )
)

(define-public (set-resolution (market-id uint) (outcome uint))
  (begin
    ;; ideally, only the market contract can call this
    (asserts! (is-eq contract-caller 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.bme024-0-market-scalar-pyth) (err u5001))
    (var-set resolved-market-id (some market-id))
    (var-set resolved-outcome (some outcome))
    (ok true)
  )
)
