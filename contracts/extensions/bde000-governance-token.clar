;; Title: BDE000 Governance Token
;; Author: mijoco.btc (based upon work of Marvin Janssen)
;; Depends-On: 
;; Synopsis:
;; This extension defines the governance token of Bitcoin DAO.
;; Description:
;; The governance token is a simple SIP010-compliant fungible token
;; with some added functions to make it easier to manage by
;; Bitcoin DAO proposals and extensions.

(impl-trait .governance-token-trait.governance-token-trait)
(impl-trait .sip010-ft-trait.sip010-ft-trait)
(impl-trait .extension-trait.extension-trait)
 
(define-fungible-token bdg-token u10000000000000)
(define-fungible-token bdg-token-locked)

(define-constant core-team-max-vesting u1500000000000) ;; 15% of total supply (10,000,000 BDG)

(define-constant err-unauthorised (err u3000))
(define-constant err-not-token-owner (err u3001))
(define-constant err-not-core-team (err u3002))
(define-constant err-no-vesting-schedule (err u3003))
(define-constant err-nothing-to-claim (err u3004))
(define-constant err-core-vesting-limit (err u3005))
(define-constant err-cliff-not-reached (err u3006))
(define-constant err-recipients-are-locked (err u3007))
(define-constant err-transfers-blocked (err u3008))

(define-data-var token-name (string-ascii 32) "BitcoinDAO Governance Token")
(define-data-var token-symbol (string-ascii 10) "BDG")
(define-data-var token-uri (optional (string-utf8 256)) none)
(define-data-var token-decimals uint u6)
(define-data-var core-team-size uint u0)

(define-data-var token-price uint u100000)
(define-data-var transfers-active bool false)

(define-map core-team-vesting-tracker principal uint) ;; Tracks vested amount per recipient

;; ---- Vesting Storage ----
(define-data-var claim-made bool false)
(define-data-var current-key uint u0)
(define-map core-team-vesting {current-key: uint, recipient: principal}
  {total-amount: uint, start-block: uint, duration: uint, claimed: uint}
)

;; --- Authorisation check

(define-public (is-dao-or-extension)
	(ok (asserts! (or (is-eq tx-sender .bitcoin-dao) (contract-call? .bitcoin-dao is-extension contract-caller)) err-unauthorised))
)

;; ---- Vesting Methods ----

;; --- Vesting logic and sale
(define-public (set-transfers-active (new-transfers-active bool))
  (begin
    (try! (is-dao-or-extension))
    (var-set transfers-active new-transfers-active)
    (ok true)
  )
)
(define-read-only (get-transfers-active) (var-get transfers-active))

(define-public (set-token-price (new-token-price uint))
  (begin
    (try! (is-dao-or-extension))
    (var-set token-price new-token-price)
    (ok true)
  )
)
(define-public (set-core-team-vesting (core-team (list 200 {recipient: principal, start-block: uint, duration: uint})))
  (begin
	(try! (is-dao-or-extension))
	(asserts! (not (var-get claim-made)) err-recipients-are-locked)
	(var-set current-key (+ u1 (var-get current-key)))
	(var-set core-team-size (len core-team))
	(as-contract (fold set-core-team-vesting-iter core-team (ok true)))
  )
)
(define-private (set-core-team-vesting-iter (item {recipient: principal, start-block: uint, duration: uint}) (previous-result (response bool uint)))
	(begin
		(try! previous-result)
		;;(asserts! (as-contract (contract-call? .bde004-core-execute is-executive-team-member (get recipient item))) err-not-core-team)
		(let (
				(amount (/ core-team-max-vesting (var-get core-team-size)))
			)
			(map-set core-team-vesting {current-key: (var-get current-key), recipient: (get recipient item)}
				{total-amount: amount, start-block: (get start-block item), duration: (get duration item), claimed: u0})
			(map-set core-team-vesting-tracker (get recipient item) amount)
			(print {event: "set-core-team-vesting", amount: amount, start-block: (get start-block item), duration: (get duration item), current-key: (var-get current-key)})
			(ok true)
		)
	)
)

(define-public (core-claim)
  (let
    (
      	(vesting (unwrap! (map-get? core-team-vesting {current-key: (var-get current-key), recipient: tx-sender}) err-no-vesting-schedule))
      	(current-block burn-block-height)
		(start-block (get start-block vesting))
		(duration (get duration vesting))
		(total-amount (get total-amount vesting))
		(claimed (get claimed vesting))
		(elapsed (if (> current-block start-block) (- current-block start-block) u0))
		(vested (if (> elapsed duration) total-amount (/ (* total-amount elapsed) duration)))
		(claimable (- vested claimed))
		(midpoint (+ start-block (/ duration u2)))
    )
    
	(asserts! (> burn-block-height midpoint) err-cliff-not-reached) 
	(asserts! (> claimable u0) err-nothing-to-claim) 
	(try! (as-contract (ft-mint? bdg-token claimable tx-sender)))

    (map-set core-team-vesting {current-key: (var-get current-key), recipient: tx-sender}
        (merge vesting {claimed: (+ claimed claimable)}))
	(var-set claim-made true)
    (print {event: "core-claim", claimed: claimed, recipient: tx-sender, claimable: claimable, elapsed: elapsed, vested: vested})
    (ok claimable)
  )
)

(define-read-only (get-vesting-schedule (who principal))
  (map-get? core-team-vesting {current-key: (var-get current-key), recipient: who})
)

;; --- Internal DAO functions

;; governance-token-trait

(define-public (bdg-transfer (amount uint) (sender principal) (recipient principal))
	(begin
		(try! (is-dao-or-extension))
		(ft-transfer? bdg-token amount sender recipient)
	)
)

(define-public (bdg-lock (amount uint) (owner principal))
	(begin
		(try! (is-dao-or-extension))
		(try! (ft-burn? bdg-token amount owner))
		(ft-mint? bdg-token-locked amount owner)
	)
)

(define-public (bdg-unlock (amount uint) (owner principal))
	(begin
		(try! (is-dao-or-extension))
		(try! (ft-burn? bdg-token-locked amount owner))
		(ft-mint? bdg-token amount owner)
	)
)

(define-public (bdg-mint (amount uint) (recipient principal))
	(begin
		(try! (is-dao-or-extension))
		(ft-mint? bdg-token amount recipient)
	)
)

(define-public (bdg-burn (amount uint) (owner principal))
	(begin
		(try! (is-dao-or-extension))
		(ft-burn? bdg-token amount owner)
		
	)
)

;; Other

(define-public (set-name (new-name (string-ascii 32)))
	(begin
		(try! (is-dao-or-extension))
		(ok (var-set token-name new-name))
	)
)

(define-public (set-symbol (new-symbol (string-ascii 10)))
	(begin
		(try! (is-dao-or-extension))
		(ok (var-set token-symbol new-symbol))
	)
)

(define-public (set-decimals (new-decimals uint))
	(begin
		(try! (is-dao-or-extension))
		(ok (var-set token-decimals new-decimals))
	)
)

(define-public (set-token-uri (new-uri (optional (string-utf8 256))))
	(begin
		(try! (is-dao-or-extension))
		(ok (var-set token-uri new-uri))
	)
)

(define-private (bdg-mint-many-iter (item {amount: uint, recipient: principal}))
	(ft-mint? bdg-token (get amount item) (get recipient item))
)

(define-public (bdg-mint-many (recipients (list 200 {amount: uint, recipient: principal})))
	(begin
		(try! (is-dao-or-extension))
		(ok (map bdg-mint-many-iter recipients))
	)
)

;; --- Public functions

;; sip010-ft-trait

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
	(begin
		(asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) err-not-token-owner)
		(asserts! (var-get transfers-active) err-transfers-blocked)
		(ft-transfer? bdg-token amount sender recipient)
	)
)

(define-read-only (get-name)
	(ok (var-get token-name))
)

(define-read-only (get-symbol)
	(ok (var-get token-symbol))
)

(define-read-only (get-decimals)
	(ok (var-get token-decimals))
)

(define-read-only (get-balance (who principal))
	(ok (+ (ft-get-balance bdg-token who) (ft-get-balance bdg-token-locked who)))
)

(define-read-only (get-total-supply)
	(ok (+ (ft-get-supply bdg-token) (ft-get-supply bdg-token-locked)))
)

(define-read-only (get-token-uri)
	(ok (var-get token-uri))
)

;; governance-token-trait

(define-read-only (bdg-get-balance (who principal))
	(get-balance who)
)

(define-read-only (bdg-has-percentage-balance (who principal) (factor uint))
	(ok (>= (* (unwrap-panic (get-balance who)) factor) (* (unwrap-panic (get-total-supply)) u1000)))
)

(define-read-only (bdg-get-locked (owner principal))
	(ok (ft-get-balance bdg-token-locked owner))
)

;; --- Extension callback

(define-public (callback (sender principal) (memo (buff 34)))
	(ok true)
)
