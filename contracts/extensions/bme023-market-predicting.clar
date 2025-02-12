;; Title: BME023 Market Predicting
;; Synopsis:
;; Implements binary and categorical prediciton markets.
;; Description:
;; Market creation allows a new binary or categorical market to be set up.
;; Off chain market data is verifiable via the markets data hash.
;; Markets run in a specific token (stx, sbtc, bmg etc) the market is created
;; with an allowed token. Allowed tokens are controlled by the DAO.
;; Market creation can be gated via market proof and a market creator can
;; set their own fee up to a max fee amount determined by the DAO.
;; Anyone with the required token can stake as many times as they wish and for any choice 
;; of outcome. Resolution process begins via a call gated to the DAO controlled resolution agent 
;; address. The resolution can be challenged by anyone with a stake in the market
;; If a challenge is made the dispute resolution process begins which requires a DAO vote
;; to resolve - the outcome of the vote resolve the market and sets the outcome. 
;; If the dispute window passes without challenge or once the vote concludes the market is fully
;; resolved and claims can then be made.

(use-trait ft-token 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)
(impl-trait .prediction-market-trait.prediction-market-trait)

;; ---------------- CONSTANTS & TYPES ----------------
;; Market Types (1 => categorical market)
(define-constant MARKET_TYPE u1)

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
(define-constant err-user-not-staked (err u10008))
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
(define-constant err-category-not-found (err u10023))
(define-constant err-too-few-categories (err u10024))
(define-constant err-element-expected (err u10025))
(define-constant err-winning-stake-not-zero (err u10026))
(define-constant err-losing-stake-is-zero (err u10027))

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
;; outcome: winning category
(define-map markets
  uint
  {
		market-data-hash: (buff 32),
    token: principal,
    treasury: principal,
    creator: principal,
    market-fee-bips: uint,
    resolution-state: uint, ;; "open", "resolving", "disputed", "concluded"
    resolution-burn-height: uint,
    categories: (list 10 (string-ascii 32)), ;; List of available categories
    stakes: (list 10 uint), ;; Total staked per category
    outcome: (optional uint),
    concluded: bool
  }
)

(define-map stake-balances
  { market-id: uint, user: principal }
  (list 10 uint)
)
(define-map allowed-tokens principal bool)

;; ---------------- access control ----------------
(define-public (is-dao-or-extension)
	(ok (asserts! (or (is-eq tx-sender .bigmarket-dao) (contract-call? .bigmarket-dao is-extension contract-caller)) err-unauthorised))
)

;; ---------------- getters / setters ----------------
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

(define-read-only (get-market-data (market-id uint))
	(map-get? markets market-id)
)

(define-read-only (get-stake-balances (market-id uint) (user principal))
	(map-get? stake-balances { market-id: market-id, user: user })
)


;; ---------------- public functions ----------------

(define-public (create-market (categories (list 10 (string-ascii 32))) (fee-bips (optional uint)) (token <ft-token>) (market-data-hash (buff 32)) (proof (list 10 (tuple (position bool) (hash (buff 32))))) (treasury principal))
    (let (
        (sender tx-sender)
        (new-id (var-get market-counter))
        (market-fee-bips (default-to u0 fee-bips))
      )
		  (asserts! (> (len categories) u1) err-too-few-categories)
		  (asserts! (<= market-fee-bips (var-get market-fee-bips-max)) err-max-market-fee-bips-exceeded)
      ;; ensure the trading token is allowed 
		  (asserts! (is-allowed-token (contract-of token)) err-invalid-token)
      ;; ensure user pays creation fee if required
      (if (and (not (is-eq tx-sender (var-get resolution-agent))) (> (var-get market-create-fee) u0))
        (try! (stx-transfer? (var-get market-create-fee) tx-sender (var-get dao-treasury)))
        true
      )
      ;; ensure the user is allowed to create if gating by merkle proof is required
      (if (var-get creation-gated) (try! (as-contract (contract-call? .bme022-market-gating can-access-by-account sender proof))) true)

      ;; all checks pass - insert market data
      (map-set markets
        new-id
        {
          market-data-hash: market-data-hash,
          token: (contract-of token),
          treasury: treasury,
          creator: tx-sender,
          market-fee-bips: market-fee-bips,
          resolution-state: RESOLUTION_OPEN,
          resolution-burn-height: u0,
          categories: categories,
          stakes: (list u0 u0 u0 u0 u0 u0 u0 u0 u0 u0),
          outcome: none,
          concluded: false
        }
      )
      ;; Increment the counter
      (print {event: "create-market", market-id: new-id, market-type: MARKET_TYPE, categories: categories, market-fee-bips: market-fee-bips, token: token, market-data-hash: market-data-hash, creator: tx-sender})
      (var-set market-counter (+ new-id u1))
      (ok new-id)
  )
)
(define-public (predict-category (market-id uint) (amount uint) (category (string-ascii 32)) (token <ft-token>))
  (let (
        (amount-less-fee (try! (process-stake-transfer amount token)))
        (md (unwrap! (map-get? markets market-id) err-market-not-found))
        (current-stakes (get stakes md))
        (index (unwrap! (index-of? (get categories md) category) err-category-not-found))
        (current-stake (unwrap! (element-at? current-stakes index) err-category-not-found))
        (current-stake-balances (default-to (list u0 u0 u0 u0 u0 u0 u0 u0 u0 u0) (map-get? stake-balances {market-id: market-id, user: tx-sender})))
        (current-user-stake (unwrap! (element-at? current-stake-balances index) err-category-not-found))
      ) 
    ;; Ensure correct token
    (asserts! (is-eq (get token md) (contract-of token)) err-invalid-token)
    ;; Ensure market is not concluded
    (asserts! (not (get concluded md)) err-already-concluded)
    ;; Ensure resolution process has not started 
    (asserts! (is-eq (get resolution-state md) RESOLUTION_OPEN) err-market-not-open)

    (map-set markets market-id
      (merge md {stakes: (unwrap! (replace-at? current-stakes index (+ current-stake amount-less-fee)) err-category-not-found)})
    )

    (map-set stake-balances {market-id: market-id, user: tx-sender}
        (unwrap! (replace-at? current-stake-balances index (+ current-user-stake amount-less-fee)) err-category-not-found)
    )

    (print {event: "market-stake", market-id: market-id, market-type: MARKET_TYPE, index: index, category: category, amount: amount-less-fee, voter: tx-sender})
    (ok index)
  )
)

;; Resolve a market invoked by ai-agent.
(define-public (resolve-market (market-id uint) (category (string-ascii 32)))
  (let (
        (md (unwrap! (map-get? markets market-id) err-market-not-found))
        (index (unwrap! (index-of? (get categories md) category) err-category-not-found))
    )
    (asserts! (is-eq tx-sender (var-get resolution-agent)) err-unauthorised)
    (asserts! (is-eq (get resolution-state md) RESOLUTION_OPEN) err-market-wrong-state)

    (map-set markets market-id
      (merge md
        { outcome: (some index), resolution-state: RESOLUTION_RESOLVING, resolution-burn-height: burn-block-height }
      )
    )
    (print {event: "resolve-market", market-id: market-id, market-type: MARKET_TYPE, outcome: index, category: category, resolver: (var-get resolution-agent), resolution-state: RESOLUTION_RESOLVING})
    (ok index)
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
(define-public (resolve-market-vote (market-id uint) (meta-data-hash (buff 32)) (outcome uint))
  (let (
        (md (unwrap! (map-get? markets market-id) err-market-not-found))
    )
    (try! (is-dao-or-extension))
    (asserts! (< outcome (len (get categories md))) err-market-not-found)
    (asserts! (is-eq meta-data-hash (get market-data-hash md)) err-market-not-found)
    (asserts! (or (is-eq (get resolution-state md) RESOLUTION_DISPUTED) (is-eq (get resolution-state md) RESOLUTION_RESOLVING)) err-market-wrong-state)

    (map-set markets market-id
      (merge md
        { concluded: true, outcome: (some outcome), resolution-state: RESOLUTION_RESOLVED }
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
    )
    ;; user call create-market-vote in the voting contract to start a dispute
    (try! (is-dao-or-extension))

    ;; prevent market getting locked in unresolved state
    (asserts! (<= burn-block-height (+ (get resolution-burn-height md) (var-get dispute-window-length))) err-dispute-window-elapsed)

    (asserts! (is-eq data-hash market-data-hash) err-market-not-found) 
    (asserts! (is-eq (get resolution-state md) RESOLUTION_RESOLVING) err-market-not-resolving) 
    (asserts! (<= burn-block-height (+ (get resolution-burn-height md) (var-get dispute-window-length))) err-dispute-window-elapsed)

    (map-set markets market-id
      (merge md { resolution-state: RESOLUTION_DISPUTED }))
    (print {event: "dispute-resolution", market-id: market-id, market-type: MARKET_TYPE, disputer: disputer, resolution-state: RESOLUTION_DISPUTED})
    (ok true)
  )
)

;; Claim winnings (for users who staked on the correct category)
(define-public (claim-winnings (market-id uint) (token <ft-token>))
  (let 
    (
      (market-data (unwrap! (map-get? markets market-id) err-market-not-found))
      (user-stake-list (unwrap! (map-get? stake-balances { market-id: market-id, user: tx-sender }) err-user-not-staked))
      (index-won (unwrap! (get outcome market-data) err-market-wrong-state))
      (user-stake (unwrap! (element-at? user-stake-list index-won) err-user-not-staked))
      (stake-list (get stakes market-data))
      (winning-pool (unwrap! (element-at? stake-list index-won) err-market-wrong-state))
      (total-pool (fold + stake-list u0))
    )

    ;; Ensure correct token
    (asserts! (is-eq (get token market-data) (contract-of token)) err-invalid-token)
    ;; Check if market is concluded
    (asserts! (is-eq (get resolution-state market-data) RESOLUTION_RESOLVED) err-market-not-concluded)
    (asserts! (get concluded market-data) err-market-not-concluded)
    ;; Determine user stake and winning pool
    (asserts! (> user-stake u0) err-user-not-winner-or-claimed)
    (asserts! (> winning-pool u0) err-amount-too-low)

      ;; Claim winnings
    (claim-winnings-internal market-id user-stake winning-pool total-pool index-won token)
  )
)

;; needed for markets with no winner - in this case, tokens accrued are transferred to the dao treasury
(define-public (transfer-losing-stakes (market-id uint) (token <ft-token>))
  (let (
        (md (unwrap! (map-get? markets market-id) err-market-not-found))
        (stakes (get stakes md))
        (winning-index (unwrap! (get outcome md) err-market-not-concluded))
        (balance (fold + stakes u0))
    )
    ;; Ensure market is concluded and winning category is empty
    (asserts! (is-eq (get token md) (contract-of token)) err-invalid-token)
    (asserts! (is-eq (get resolution-state md) RESOLUTION_RESOLVED) err-market-not-concluded)
    (asserts! (is-eq u0 (unwrap! (element-at? stakes winning-index) err-element-expected)) err-winning-stake-not-zero)
    (asserts! (> balance u0) err-losing-stake-is-zero)
    (as-contract
      (begin
        (if (> balance u0)
          (try! (contract-call? token transfer balance tx-sender (var-get dao-treasury) none))
          true
        )
      )
    )
    (print {event: "transfer-losing-stakes", market-id: market-id, balance: balance})
    (ok true)
  )
)

(define-private (claim-winnings-internal 
  (market-id uint) 
  (user-stake uint) 
  (winning-pool uint) 
  (total-pool uint) 
  (index-won uint) (token <ft-token>))
  (let (
        (md (unwrap! (map-get? markets market-id) err-market-not-found))
        (original-sender tx-sender)
        (treasury (get treasury md))
        (market-fee-bips (get market-fee-bips md))
        (user-share (if (> winning-pool u0) (/ (* user-stake total-pool) winning-pool) u0))
        (daofee (/ (* user-share (var-get dao-fee-bips)) u10000))
        (marketfee (/ (* user-share market-fee-bips) u10000))
        (user-share-net (- user-share (+ daofee marketfee)))
    )
    (begin
      ;; Ensure inputs are valid
      (asserts! (> winning-pool u0) err-amount-too-low)
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
            (try! (contract-call? token transfer marketfee tx-sender treasury none))
            true
          )
        )
      )

      ;; Zero out user stake
      (map-set stake-balances { market-id: market-id, user: tx-sender } (list u0 u0 u0 u0 u0 u0 u0 u0 u0 u0))

      ;; Log and return user share
      (print {event: "claim-winnings", market-id: market-id, market-type: MARKET_TYPE, index-won: index-won, claimer: tx-sender, user-stake: user-stake, user-share: user-share-net, marketfee: marketfee, daofee: daofee, winning-pool: winning-pool, total-pool: total-pool})
      (ok user-share-net)
    )
  )
)

(define-private (process-stake-transfer (amount uint) (token <ft-token>))
  (let (
        ;;(sender-balance (stx-get-balance tx-sender))
        (sender-balance (unwrap! (contract-call? token get-balance tx-sender) err-insufficient-balance))
        (fee (calculate-fee amount (var-get dev-fee-bips)))
        (transfer-amount (- amount fee))
       )
    (begin
      ;; Ensure amount is valid
      (asserts! (>= amount u100) err-amount-too-low)
      ;; Check tx-sender's balance
      (asserts! (>= sender-balance amount) err-insufficient-balance)
      
      (try! (contract-call? token transfer transfer-amount tx-sender .bme023-market-predicting none))
      (try! (contract-call? token transfer fee tx-sender (var-get dev-fund) none))

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
