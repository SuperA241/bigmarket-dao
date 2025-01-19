;;;; ----------------------------------------------------
;;;; my-prediction-market.clar
;;;; ----------------------------------------------------
;;;; A single Clarity contract that manages multiple Yes/No
;;;; prediction markets with two fee types: 2% Dev + 2% DAO.
;;;; 
;;;; Supports:
;;;; 1) Simple Stake-Based Markets
;;;; 2) (Optional) Placeholder for Shares-Based Markets
;;;; ----------------------------------------------------

;; ---------------- CONSTANTS & TYPES ----------------

(define-constant DEV-FEE-BIPS u200)           ;; 2% (200 basis points)
(define-constant DAO-FEE-BIPS u200)           ;; 2% (200 basis points)

;; For demonstration, set addresses for Dev & DAO recipients
;; In production, replace with real mainnet principal addresses.
(define-constant DEV-RECIPIENT 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP)
(define-constant DAO-RECIPIENT 'STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6)
;;(define-constant DEV-RECIPIENT 'ST3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNZN9J752)
;;(define-constant DAO-RECIPIENT 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY)

;; Market Types (0 => Stake-based, 1 => Shares-based)
(define-constant MARKET_TYPE_STAKE u0)
(define-constant MARKET_TYPE_SHARES u1)

(define-constant err-unauthorised (err u10000))
(define-constant err-invalid-market-type (err u10001))
(define-constant err-amount-too-low (err u10002))
(define-constant err-wrong-market-type (err u10003))
(define-constant err-already-concluded (err u10004))
(define-constant err-market-not-found (err u10005))
(define-constant err-user-not-winner (err u10006))
(define-constant err-not-participant-or-invalid-market (err u10007))
(define-constant err-user-balance-unknown (err u10008))
(define-constant err-market-not-concluded (err u10009))
(define-constant err-not-implemented (err u10010))
(define-constant err-insufficient-balance (err u10011))
(define-constant err-insufficient-contract-balance (err u10012))
(define-constant err-user-share-is-zero (err u10013))
(define-constant err-dao-fee-is-zero (err u10014))

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
		metadata-hash: (buff 32),
    creator: principal,
    market-type: uint,
    yes-pool: uint,
    no-pool: uint,
    concluded: bool,
    outcome: bool
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
(define-data-var market-counter uint u0)

;; ---------------- PUBLIC FUNCTIONS ----------------
(define-public (is-dao-or-extension)
	(ok (asserts! (or (is-eq tx-sender .bitcoin-dao) (contract-call? .bitcoin-dao is-extension contract-caller)) err-unauthorised))
)

;; Creates a new Yes/No prediction market. `mtype` can be 0 (stake-based) 
;; or 1 (shares-based). Returns the new market-id.
(define-public (create-market (mtype uint) (metadata-hash (buff 32)))
  (begin
    (asserts! (or (is-eq mtype MARKET_TYPE_STAKE) (is-eq mtype MARKET_TYPE_SHARES)) err-invalid-market-type)

    (let ((new-id (var-get market-counter)))
      (map-set markets
        new-id
        {
          metadata-hash: metadata-hash,
          creator: tx-sender,
          market-type: mtype,
          yes-pool: u0,
          no-pool: u0,
          concluded: false,
          outcome: false
        }
      )
      ;; Increment the counter
      (print {event: "create", market-id: new-id, metadata-hash: metadata-hash, market-type: mtype, creator: tx-sender})
      (var-set market-counter (+ new-id u1))
      (ok new-id)
    )
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
(define-public (predict-yes-stake (market-id uint) (amount uint))
  (predict-stake market-id amount true))

(define-public (predict-no-stake (market-id uint) (amount uint))
  (predict-stake market-id amount false))

(define-private (predict-stake (market-id uint) (amount uint) (yes bool))
  (let (
        ;; Ensure amount is valid and transfer STX
        (amount-less-fee (try! (process-stake-transfer amount)))
        ;; Fetch and unwrap market data
        (md (unwrap! (map-get? markets market-id) err-market-not-found))
      )
    ;; Ensure correct market type
    (asserts! (is-eq (get market-type md) MARKET_TYPE_STAKE) err-wrong-market-type)
    ;; Ensure market is not concluded
    (asserts! (not (get concluded md)) err-already-concluded)

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
    (print {event: "stake", market-id: market-id, amount: amount, yes: yes, voter: tx-sender})
    (ok true)
  )
)

;; Resolve a market. This function is restricted to the contract owner for now.
(define-public (resolve-market (market-id uint) (is-won bool))
  (let (
        (owner DEV-RECIPIENT)
        (md (unwrap! (map-get? markets market-id) err-market-not-found))
    )
		(try! (is-dao-or-extension))
    (asserts! (is-eq tx-sender owner) err-unauthorised)
    (asserts! (not (get concluded md)) err-already-concluded)

    (map-set markets market-id
      (merge md
        { concluded: true, outcome: is-won }
      )
    )
    (print {event: "resolve", market-id: market-id, is-won: is-won, resolver: owner})
    (ok true)
  )
)

;; Allows a user who participated in a stake-based market to claim their share
;; of the pot if they are on the winning side after resolution. 
;; Deducts a 2% DAO fee from the final pot.
(define-public (claim-winnings (market-id uint))
  (begin
    ;; Fetch market and user data
    (let ((market-data (unwrap! (map-get? markets market-id) err-market-not-found))
          (user-bal (unwrap! (map-get? stake-balances { market-id: market-id, user: tx-sender }) err-user-balance-unknown)))

      ;; Check if market is concluded
      (asserts! (is-eq (get concluded market-data) true) err-market-not-concluded)

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
        (asserts! (> user-stake u0) err-user-not-winner)

        ;; Claim winnings
        (claim-winnings-internal market-id user-stake winning-pool total-pool yes-won)
      )
    )
  )
)

;; ---------------- SHARES-BASED PLACEHOLDER ----------------
;; Placeholder function to be expanded to real CPMM (x * y = k).

(define-public (buy-shares (market-id uint) (amount uint) (yes-side bool))
  (begin
    (asserts! false err-not-implemented)
    (ok false)
  )
)

;; ---------------- PRIVATE FUNCTIONS ----------------
(define-private (process-stake-transfer (amount uint))
  (let (
        (sender-balance (stx-get-balance tx-sender))
        (fee (calculate-fee amount DEV-FEE-BIPS))
        (transfer-amount (- amount fee))
       )
    (begin
      ;; Ensure amount is valid
      (asserts! (>= amount u5000) err-amount-too-low)
      ;; Check tx-sender's balance
      (asserts! (>= sender-balance amount) err-insufficient-balance)
      ;; Transfer STX to the contract
      (try! (stx-transfer? transfer-amount tx-sender .bde023-market-staked-predictions))
      ;; Transfer the fee to the dev fund
      (try! (stx-transfer? fee tx-sender DEV-RECIPIENT))
      ;; Verify the contract received the correct amount
      (asserts! (>= (stx-get-balance .bde023-market-staked-predictions) transfer-amount) err-insufficient-contract-balance)

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
  (yes-won bool))
  (let (
        (original-sender tx-sender)
        (user-share (/ (* user-stake total-pool) winning-pool))
        (dao-fee (/ (* user-share DAO-FEE-BIPS) u10000))
        (user-share-net (- user-share dao-fee))
    )
    (begin
      ;; Ensure inputs are valid
      (asserts! (> user-share-net u0) err-user-share-is-zero)
      (asserts! (> dao-fee u0) err-dao-fee-is-zero)

      ;; Perform transfers
      (as-contract
        (begin
          ;; Transfer user share, capped by initial contract balance
          (try! (stx-transfer? user-share-net tx-sender original-sender))
          (try! (stx-transfer? dao-fee tx-sender DAO-RECIPIENT))
        )
      )

      ;; Zero out user stake
      (map-set stake-balances { market-id: market-id, user: tx-sender }
        {
          yes-amount: u0,
          no-amount: u0
        })

      ;; Log and return user share
      (print {event: "claim", market-id: market-id, is-won: yes-won, claimer: tx-sender, user-stake: user-stake, user-share: user-share-net, dao-fee: dao-fee, winning-pool: winning-pool, total-pool: total-pool})
      (ok user-share-net)
    )
  )
)
