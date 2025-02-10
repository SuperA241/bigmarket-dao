;; Title: BDE021 Poll Gating
;; Author: Mike Cohen
;; Efficient verification of access control using merkle roots.

;; Define the SIP-009 and SIP-010 traits
(use-trait nft-trait .sip009-nft-trait.nft-trait)
(use-trait ft-trait .sip010-ft-trait.sip010-ft-trait)
(impl-trait .extension-trait.extension-trait)

;; ---------------- CONSTANTS & ERRORS ----------------
(define-constant err-unauthorised (err u2200))
(define-constant err-token-contract-invalid (err u2202))
(define-constant err-token-ownership-invalid (err u2203))
(define-constant err-not-nft-owner (err u2207))
(define-constant err-not-ft-owner (err u2208))
(define-constant err-expecting-valid-merkle-proof (err u2211))
(define-constant err-expecting-merkle-root-for-poll (err u2212))
(define-constant err-expecting-an-owner (err u2213))
(define-constant err-account-proof-invalid (err u2214))
(define-constant err-ownership-proof-invalid (err u2215))

;; ---------------- DATA STORAGE ----------------
(define-map merkle-roots (buff 32) { merkle-root: (buff 32) })

;; ---------------- ACCESS CONTROL ----------------
(define-public (is-dao-or-extension)
    (ok (asserts! (or (is-eq tx-sender .bitcoin-dao) 
                       (contract-call? .bitcoin-dao is-extension contract-caller)) err-unauthorised))
)

(define-public (set-merkle-root (hashed-id (buff 32)) (root (buff 32)))
  (begin
    (try! (is-dao-or-extension))
    (map-set merkle-roots hashed-id { merkle-root: root })
    (print {event: "merkle-root-set", hashed-id: hashed-id, root: root})
    (ok true)
  )
)

(define-public (set-merkle-root-by-principal (contract-id principal) (root (buff 32)))
  (let ((principal-contract (unwrap! (principal-destruct? contract-id) err-token-contract-invalid))
        (contract-name-option (get name principal-contract)))
    (asserts! (is-some contract-name-option) err-expecting-an-owner)
    (let ((contract-key (sha256 (concat (get hash-bytes principal-contract) (unwrap! contract-name-option err-expecting-an-owner)))))
      (try! (is-dao-or-extension))
      (map-set merkle-roots contract-key { merkle-root: root })
      (print {event: "merkle-root-set-by-principal", contract-id: contract-id, contract-key: contract-key, root: root})
      (ok true)
    )
  )
)

(define-read-only (get-merkle-root (hashed-id (buff 32)))
  (match (map-get? merkle-roots hashed-id)
    some-root (ok (get merkle-root some-root))
    none (err err-expecting-merkle-root-for-poll)
  )
)

;; ---------------- MERKLE PROOF VERIFICATION ----------------
(define-private (calculate-hash (hash1 (buff 32)) (hash2 (buff 32)) (position bool))
  (if position (sha256 (concat hash2 hash1)) (sha256 (concat hash1 hash2)))
)

(define-private (process-proof-step (proof-step (tuple (position bool) (hash (buff 32)))) (current (buff 32)))
  (let ((position (get position proof-step))
        (hash (get hash proof-step)))
    (calculate-hash current hash position)
  )
)

(define-private (verify-merkle-proof (leaf (buff 32)) (proof (list 10 (tuple (position bool) (hash (buff 32))))) (root (buff 32)))
  (let ((calculated-root (fold process-proof-step proof leaf)))
    (ok (is-eq calculated-root root))
  )
)

;; ---------------- TOKEN OWNERSHIP VERIFICATION ----------------
(define-private (verify-nft-ownership (nft-contract <nft-trait>) (voter principal) (token-id uint))
  (let ((owner (contract-call? nft-contract get-owner token-id)))
    (asserts! (is-some owner) err-not-nft-owner)
    (ok (is-eq (unwrap! owner err-expecting-an-owner) voter))
  )
)

(define-private (verify-ft-balance (ft-contract <ft-trait>) (voter principal) (quantity uint))
  (let ((balance (unwrap! (contract-call? ft-contract get-balance voter) err-not-ft-owner)))
    (ok (>= balance quantity))
  )
)

;; ---------------- ACCESS VALIDATION ----------------
(define-public (can-access-by-ownership
    (market-data-hash (buff 32)) 
    (nft-contract (optional <nft-trait>)) 
    (ft-contract (optional <ft-trait>)) 
    (token-id (optional uint)) 
    (proof (list 10 (tuple (position bool) (hash (buff 32))))) 
    (quantity uint)
  )
  (let ((is-nft (is-some nft-contract))
        (root (unwrap! (map-get? merkle-roots market-data-hash) err-expecting-merkle-root-for-poll))
        (contract-id (if is-nft
                         (unwrap! (to-consensus-buff? (as-contract (unwrap! nft-contract err-token-contract-invalid))) err-token-contract-invalid)
                         (unwrap! (to-consensus-buff? (as-contract (unwrap! ft-contract err-token-contract-invalid))) err-token-contract-invalid)))
        (leaf (sha256 contract-id))
        (proof-valid (unwrap! (verify-merkle-proof leaf proof (get merkle-root root)) err-expecting-valid-merkle-proof))
        (ownership-valid (if is-nft
                            (unwrap! (verify-nft-ownership (unwrap! nft-contract err-token-contract-invalid) tx-sender (unwrap! token-id err-token-contract-invalid)) err-not-nft-owner)
                            (unwrap! (verify-ft-balance (unwrap! ft-contract err-token-contract-invalid) tx-sender quantity) err-not-ft-owner))))
    
    ;; Ensure both conditions are satisfied
    (asserts! proof-valid err-ownership-proof-invalid)
    (asserts! ownership-valid err-token-ownership-invalid)
    (ok true)
  )
)

(define-public (can-access-by-account
    (sender principal) 
    (proof (list 10 (tuple (position bool) (hash (buff 32))))) 
  )
  (let ((principal-contract (unwrap! (principal-destruct? tx-sender) err-token-contract-invalid))
        (contract-key (sha256 (get hash-bytes principal-contract)))
        (root (unwrap! (map-get? merkle-roots contract-key) err-expecting-merkle-root-for-poll))
        (leaf (sha256 (get hash-bytes (unwrap! (principal-destruct? sender) err-token-contract-invalid))))
        (proof-valid (unwrap! (verify-merkle-proof leaf proof (get merkle-root root)) err-expecting-valid-merkle-proof)))
    
    (asserts! proof-valid err-account-proof-invalid)
    (print {event: "access-by-account", contract-key: contract-key, sender: sender, proof-valid: proof-valid})
    (ok true)
  )
)

;; --- Extension callback
(define-public (callback (sender principal) (memo (buff 34)))
  (begin
    (print {event: "callback-invoked", sender: sender, memo: memo})
    (ok true)
  )
)
