;; Title: BDE023 binary market preditions
;; Author: Mike Cohen
;; Depends-On: 
;; Synopsis:
;; Implements a simple binary prediciton market.
;; Description:
;; Enables market creation and binary yes/no operation
;; the contract is part of the dao and parameters are controlled by
;; dao proposals. Market resolution can be disputed by anyone with a 
;; stake in the market and disputes are resolved by dao / community
;; voting

(use-trait ft-token .sip010-ft-trait.sip010-ft-trait)
(impl-trait .prediction-market-trait.prediction-market-trait)

;; ---------------- CONSTANTS & TYPES ----------------
;; Market Types (0 => binary yesy/no market)
(define-constant MARKET_TYPE u0)

(define-constant RESOLUTION_OPEN u0)
(define-constant RESOLUTION_RESOLVING u1)
(define-constant RESOLUTION_DISPUTED u2)
(define-constant RESOLUTION_RESOLVED u3)

(define-constant err-unauthorised (err u10000))
(define-constant err-invalid-market-type (err u10001))
(define-constant err-amount-too-low (err u10002))
(define-constant err-wrong-market-type (err u10003))
(define-constant err-already-concluded (err u10004))
(define-constant err-market-not-found (err u10005))
(define-constant err-user-not-winner-or-claimed (err u10006))
(define-constant err-user-balance-unknown (err u10008))
(define-constant err-market-not-concluded (err u10009))
(define-constant err-insufficient-balance (err u10011))
(define-constant err-insufficient-contract-balance (err u10012))
(define-constant err-user-share-is-zero (err u10013))
(define-constant err-dao-fee-bips-is-zero (err u10014))
(define-constant err-disputer-must-have-stake (err u10015))
(define-constant err-dispute-window-elapsed (err u10016))
(define-constant err-market-not-resolving (err u10017))
(define-constant err-market-not-open (err u10018))
(define-constant err-dispute-window-not-elapsed (err u10019))
(define-constant err-market-wrong-state (err u10020))
(define-constant err-invalid-token (err u10021))
(define-constant err-max-market-fee-bips-exceeded (err u10022))

(define-data-var market-counter uint u0)
(define-data-var dispute-window-length uint u3)
(define-data-var resolution-agent principal tx-sender)
(define-data-var dev-fee-bips uint u200)
(define-data-var dao-fee-bips uint u200)
(define-data-var market-fee-bips-max uint u500)
(define-data-var market-create-fee uint u0)
(define-data-var dev-fund principal tx-sender)
(define-data-var dao-treasury principal tx-sender)
(define-data-var creation-gated bool false)

;; Data structure for each Market
;; market-id: internal numeric ID
;; creator: who created the market
;; market-type: 0 => stake-based, 1 => shares-based
;; yes-pool/no-pool: total amount staked (or pooled) on Yes/No
;; concluded: whether the market is concluded
;; outcome: true => Yes won, false => No won (only valid if concluded = true)
(define-map markets
  uint
  {
		market-data-hash: (buff 32),
    token: principal,
    creator: principal,
    market-type: uint,
    yes-pool: uint,
    no-pool: uint,
    concluded: bool,
    outcome: bool,
    market-fee-bips: uint,
    resolution-state: uint, ;; "open", "resolving", "disputed", "concluded"
    resolution-burn-height: uint
  }
)

;; For stake-based, we simply track how much each user staked on Yes/No.
;; For shares-based, you'd track how many shares the user holds.
(define-map stake-balances
  { market-id: uint, user: principal }
  {
    yes-amount: uint,
    no-amount: uint
  }
)
(define-map allowed-tokens principal bool)

;; ---------------- PUBLIC FUNCTIONS ----------------
(define-public (is-dao-or-extension)
	(ok (asserts! (or (is-eq tx-sender .bitcoin-dao) (contract-call? .bitcoin-dao is-extension contract-caller)) err-unauthorised))
)

(define-public (set-allowed-token (token principal) (enabled bool))
	(begin
		(try! (is-dao-or-extension))
		(print {event: "allowed-token", token: token, enabled: enabled})
		(ok (map-set allowed-tokens token enabled))
	)
)
(define-read-only (is-allowed-token (token principal))
	(default-to false (map-get? allowed-tokens token))
)

(define-public (set-dispute-window-length (length uint))
  (begin
    (try! (is-dao-or-extension))
    (var-set dispute-window-length length)
    (ok true)
  )
)

(define-public (set-creation-gated (gated bool))
  (begin
    (try! (is-dao-or-extension))
    (var-set creation-gated gated)
    (ok true)
  )
)

(define-public (set-resolution-agent (new-agent principal))
  (begin
    (try! (is-dao-or-extension))
    (var-set resolution-agent new-agent)
    (ok true)
  )
)

(define-public (set-dev-fee-bips (new-fee uint))
  (begin
		(asserts! (<= new-fee u1000) err-max-market-fee-bips-exceeded)
    (try! (is-dao-or-extension))
    (var-set dev-fee-bips new-fee)
    (ok true)
  )
)

(define-public (set-dao-fee-bips (new-fee uint))
  (begin
		(asserts! (<= new-fee u1000) err-max-market-fee-bips-exceeded)
    (try! (is-dao-or-extension))
    (var-set dao-fee-bips new-fee)
    (ok true)
  )
)

(define-public (set-market-fee-bips-max (new-fee uint))
  (begin
		(asserts! (<= new-fee u1000) err-max-market-fee-bips-exceeded)
    (try! (is-dao-or-extension))
    (var-set market-fee-bips-max new-fee)
    (ok true)
  )
)

(define-public (set-market-create-fee (new-fee uint))
  (begin
    (try! (is-dao-or-extension))
    (var-set market-create-fee new-fee)
    (ok true)
  )
)

(define-public (set-dev-fund (new-dev-fund principal))
  (begin
    (try! (is-dao-or-extension))
    (var-set dev-fund new-dev-fund)
    (ok true)
  )
)

(define-public (set-dao-treasury (new-dao-treasury principal))
  (begin
    (try! (is-dao-or-extension))
    (var-set dao-treasury new-dao-treasury)
    (ok true)
  )
)

(define-public (create-market (mtype uint) (fee-bips (optional uint)) (token <ft-token>) (market-data-hash (buff 32)) (proof (list 10 (tuple (position bool) (hash (buff 32))))))
    (let (
        (sender tx-sender)
        (new-id (var-get market-counter))
        (market-fee-bips (default-to u0 fee-bips))
      )
		  (asserts! (<= market-fee-bips (var-get market-fee-bips-max)) err-max-market-fee-bips-exceeded)
      ;; ensure the trading token is allowed 
		  (asserts! (is-allowed-token (contract-of token)) err-invalid-token)
      (asserts! (is-eq mtype MARKET_TYPE) err-invalid-market-type)
      ;; ensure user pays creation fee if required
      (if (and (not (is-eq tx-sender (var-get resolution-agent))) (> (var-get market-create-fee) u0))
        (try! (stx-transfer? (var-get market-create-fee) tx-sender .bde006-treasury))
        true
      )
      ;; ensure the user is allowed to create if gating by merkle proof is required
      (if (var-get creation-gated) (try! (as-contract (contract-call? .bde022-market-gating can-access-by-account sender proof))) true)

      ;; all checks pass - insert market data
      (map-set markets
        new-id
        {
          market-data-hash: market-data-hash,
          token: (contract-of token),
          creator: tx-sender,
          market-type: mtype,
          yes-pool: u0,
          no-pool: u0, 
          concluded: false,
          outcome: false,
          market-fee-bips: market-fee-bips,
          resolution-state: RESOLUTION_OPEN,
          resolution-burn-height: u0,
        }
      )
      ;; Increment the counter
      (print {event: "create-market", market-id: new-id, market-fee-bips: market-fee-bips, token: token, market-data-hash: market-data-hash, market-type: MARKET_TYPE, creator: tx-sender})
      (var-set market-counter (+ new-id u1))
      (ok new-id)
  )
)

(define-read-only (get-market-data (market-id uint))
	(map-get? markets market-id)
)

(define-read-only (get-stake-balances (market-id uint) (user principal))
	(map-get? stake-balances { market-id: market-id, user: user })
)

;; ---------------- STAKE-BASED FUNCTIONS ----------------
;; For stake-based markets, users predict an amount on "Yes" or "No".
;; The final pot is distributed to winners after resolution.
(define-public (predict-yes-stake (market-id uint) (amount uint) (token <ft-token>))
  (predict-stake market-id amount true token))

(define-public (predict-no-stake (market-id uint) (amount uint) (token <ft-token>))
  (predict-stake market-id amount false token))

(define-private (predict-stake (market-id uint) (amount uint) (yes bool) (token <ft-token>))
  (let (
        ;; Ensure amount is valid and transfer STX
        (amount-less-fee (try! (process-stake-transfer amount token)))
        ;; Fetch and unwrap market data
        (md (unwrap! (map-get? markets market-id) err-market-not-found))
      )
    ;; Ensure correct token
    (asserts! (is-eq (get token md) (contract-of token)) err-invalid-token)
    ;; Ensure correct market type
    (asserts! (is-eq (get market-type md) MARKET_TYPE) err-wrong-market-type)
    ;; Ensure market is not concluded
    (asserts! (not (get concluded md)) err-already-concluded)
    ;; Ensure resolution process has not started 
    (asserts! (is-eq (get resolution-state md) RESOLUTION_OPEN) err-market-not-open)

    ;; Update the appropriate pool
    (map-set markets market-id
      (merge md
        (if yes
            { yes-pool: (+ (get yes-pool md) amount-less-fee), no-pool: (get no-pool md) }
            { yes-pool: (get yes-pool md), no-pool: (+ (get no-pool md) amount-less-fee) }
        )
      )
    )

    ;; Update user balance
    (let (
          (current-bal (default-to 
                          { yes-amount: u0, no-amount: u0 } 
                          (map-get? stake-balances { market-id: market-id, user: tx-sender }))
          )
        )
      ;; Update or set balance
      (map-set stake-balances { market-id: market-id, user: tx-sender }
        (if yes
            {
              yes-amount: (+ (get yes-amount current-bal) amount-less-fee),
              no-amount: (get no-amount current-bal)
            }
            {
              yes-amount: (get yes-amount current-bal),
              no-amount: (+ (get no-amount current-bal) amount-less-fee)
            }
        )
      )
    )
    (print {event: "market-stake", market-id: market-id, market-type: MARKET_TYPE, amount: amount, yes: yes, voter: tx-sender})
    (ok true)
  )
)

;; Resolve a market invoked by ai-agent.
(define-public (resolve-market (market-id uint) (outcome bool))
  (let (
        (md (unwrap! (map-get? markets market-id) err-market-not-found))
    )
    (asserts! (is-eq tx-sender (var-get resolution-agent)) err-unauthorised)
    (asserts! (is-eq (get resolution-state md) RESOLUTION_OPEN) err-market-not-open)

    (map-set markets market-id
      (merge md
        { outcome: outcome, resolution-state: RESOLUTION_RESOLVING, resolution-burn-height: burn-block-height }
      )
    )
    (print {event: "resolve-market", market-id: market-id, market-type: MARKET_TYPE, outcome: outcome, resolver: (var-get resolution-agent), resolution-state: RESOLUTION_RESOLVING})
    (ok true)
  )
)

(define-public (resolve-market-undisputed (market-id uint))
  (let (
        (md (unwrap! (map-get? markets market-id) err-market-not-found))
    )
    (asserts! (> burn-block-height (+ (get resolution-burn-height md) (var-get dispute-window-length))) err-dispute-window-not-elapsed)
    ;; anyone can call this ? (asserts! (is-eq tx-sender (var-get resolution-agent)) err-unauthorised)
    (asserts! (is-eq (get resolution-state md) RESOLUTION_RESOLVING) err-market-not-open)

    (map-set markets market-id
      (merge md
        { concluded: true, resolution-state: RESOLUTION_RESOLVED, resolution-burn-height: burn-block-height }
      )
    )
    (print {event: "resolve-market-undisputed", market-id: market-id, market-type: MARKET_TYPE, resolution-burn-height: burn-block-height, resolution-state: RESOLUTION_RESOLVED})
    (ok true)
  )
)

;; concludes a market that has been disputed. This method has to be called at least
;; dispute-window-length blocks after the dispute was raised - the voting window.
;; a proposal with 0 votes will close the market with the outcome false
(define-public (resolve-market-vote (market-id uint) (meta-data-hash (buff 32)) (outcome bool))
  (let (
        (md (unwrap! (map-get? markets market-id) err-market-not-found))
    )
    (try! (is-dao-or-extension))
    (asserts! (is-eq meta-data-hash (get market-data-hash md)) err-market-not-found)
    (asserts! (or (is-eq (get resolution-state md) RESOLUTION_DISPUTED) (is-eq (get resolution-state md) RESOLUTION_RESOLVING)) err-market-wrong-state)
    ;; logic here could be either disputed or (resolving AND dispute window has timed out)?
    ;; (asserts! (> burn-block-height (+ (get resolution-burn-height md) (var-get dispute-window-length))) err-dispute-window-not-elapsed)

    (map-set markets market-id
      (merge md
        { concluded: true, outcome: outcome, resolution-state: RESOLUTION_RESOLVED }
      )
    )
    (print {event: "resolve-market-vote", market-id: market-id, market-type: MARKET_TYPE, resolver: contract-caller, outcome: outcome, resolution-state: RESOLUTION_RESOLVED})
    (ok true)
  )
)

;; Allows a user with a stake in market to contest the resolution
;; the call is made via the voting contract 'create-market-vote' function
(define-public (dispute-resolution (market-id uint) (data-hash (buff 32)) (disputer principal))
  (let (
        (md (unwrap! (map-get? markets market-id) err-market-not-found)) 
        (market-data-hash (get market-data-hash md)) 
        (stake-data (unwrap! (map-get? stake-balances { market-id: market-id, user: disputer }) err-disputer-must-have-stake)) 
        (caller-stake (+ (get yes-amount stake-data) (get no-amount stake-data)))
    )
    ;; user call create-market-vote in the voting contract to start a dispute
    (try! (is-dao-or-extension))

    (asserts! (is-eq data-hash market-data-hash) err-market-not-found) 
    (asserts! (is-eq (get resolution-state md) RESOLUTION_RESOLVING) err-market-not-resolving) 
    (asserts! (<= burn-block-height (+ (get resolution-burn-height md) (var-get dispute-window-length))) err-dispute-window-elapsed)

    (map-set markets market-id
      (merge md { resolution-state: RESOLUTION_DISPUTED }))
    (print {event: "dispute-resolution", market-id: market-id, market-type: MARKET_TYPE, disputer: disputer, resolution-state: RESOLUTION_DISPUTED})
    (ok true)
  )
)

;; of the pot if they are on the winning side after resolution. 
;; Deducts a 2% DAO fee from the final pot.
(define-public (claim-winnings (market-id uint) (token <ft-token>))
  (begin
    ;; Fetch market and user data
    (let ((market-data (unwrap! (map-get? markets market-id) err-market-not-found))
          (user-bal (unwrap! (map-get? stake-balances { market-id: market-id, user: tx-sender }) err-user-balance-unknown)))

      ;; Ensure correct token
      (asserts! (is-eq (get token market-data) (contract-of token)) err-invalid-token)
      ;; Check if market is concluded
      (asserts! (is-eq (get resolution-state market-data) RESOLUTION_RESOLVED) err-market-not-concluded)
      (asserts! (get concluded market-data) err-market-not-concluded)

      ;; Determine user stake and winning pool
      (let ((yes-won (get outcome market-data))
            (user-stake (if (get outcome market-data)
                            (get yes-amount user-bal)
                            (get no-amount user-bal)))
            (winning-pool (if (get outcome market-data)
                              (get yes-pool market-data)
                              (get no-pool market-data)))
            (total-pool (+ (get yes-pool market-data) (get no-pool market-data))))
        
        ;; Ensure user has a stake on the winning side
        (asserts! (> user-stake u0) err-user-not-winner-or-claimed)

        ;; Claim winnings
        (claim-winnings-internal market-id user-stake winning-pool total-pool yes-won token)
      )
    )
  )
)

;; ---------------- PRIVATE FUNCTIONS ----------------
(define-private (process-stake-transfer (amount uint) (token <ft-token>))
  (let (
        ;;(sender-balance (stx-get-balance tx-sender))
        (sender-balance (unwrap! (contract-call? token get-balance tx-sender) err-insufficient-balance))
        (fee (calculate-fee amount (var-get dev-fee-bips)))
        (transfer-amount (- amount fee))
       )
    (begin
      ;; Ensure amount is valid
      (asserts! (>= amount u5000) err-amount-too-low)
      ;; Check tx-sender's balance
      (asserts! (>= sender-balance amount) err-insufficient-balance)
      ;; Transfer STX to the contract
      ;;(try! (stx-transfer? transfer-amount tx-sender .bde023-market-predicting))
      (try! (contract-call? token transfer transfer-amount tx-sender .bde023-market-predicting none))
      ;; Transfer the fee to the dev fund
      ;;(try! (stx-transfer? fee tx-sender (var-get dev-fund)))
      (try! (contract-call? token transfer fee tx-sender (var-get dev-fund) none))
      ;; Verify the contract received the correct amount
      ;;(asserts! (>= (stx-get-balance .bde023-market-predicting) transfer-amount) err-insufficient-contract-balance)

      (ok transfer-amount)
    )
  )
)

(define-private (calculate-fee (amount uint) (fee-bips uint))
  (let ((fee (/ (* amount fee-bips) u10000)))
    fee
  )
)



(define-private (take-fee (amount uint) (fee-bips uint))
  (let (
        (fee (/ (* amount fee-bips) u10000))
       )
    fee
  )
)

(define-private (claim-winnings-internal 
  (market-id uint) 
  (user-stake uint) 
  (winning-pool uint) 
  (total-pool uint) 
  (yes bool) (token <ft-token>))
  (let (
        (md (unwrap! (map-get? markets market-id) err-market-not-found))
        (original-sender tx-sender)
        (creator (get creator md))
        (market-fee-bips (get market-fee-bips md))
        (user-share (/ (* user-stake total-pool) winning-pool))
        (daofee (/ (* user-share (var-get dao-fee-bips)) u10000))
        (marketfee (/ (* user-share market-fee-bips) u10000))
        (user-share-net (- user-share (+ daofee marketfee)))
    )
    (begin
      ;; Ensure inputs are valid
      (asserts! (> user-share-net u0) err-user-share-is-zero)
      (asserts! (> daofee u0) err-dao-fee-bips-is-zero)

      ;; Perform transfers
      (as-contract
        (begin
          ;; Transfer user share, capped by initial contract balance

          ;;(try! (stx-transfer? user-share-net tx-sender original-sender))
          ;;(try! (stx-transfer? daofee tx-sender (var-get dao-treasury)))

          (if (> user-share-net u0) 
            (try! (contract-call? token transfer user-share-net tx-sender original-sender none))
            true
          )
          (if (> daofee u0)
            (try! (contract-call? token transfer daofee tx-sender (var-get dao-treasury) none))
            true
          )
          (if (> marketfee u0) 
            (try! (contract-call? token transfer marketfee tx-sender creator none))
            true
          )

        )
      )

      ;; Zero out user stake
      (map-set stake-balances { market-id: market-id, user: tx-sender }
        {
          yes-amount: u0,
          no-amount: u0
        })

      ;; Log and return user share
      (print {event: "claim-winnings", market-id: market-id, market-type: MARKET_TYPE, yes: yes, claimer: tx-sender, user-stake: user-stake, user-share: user-share-net, marketfee: marketfee, daofee: daofee, winning-pool: winning-pool, total-pool: total-pool})
      (ok user-share-net)
    )
  )
)
