;; Title: pyth-oracle
;; Version: v3
;; Check for latest version: https://github.com/Trust-Machines/stacks-pyth-bridge#latest-version
;; Report an issue: https://github.com/Trust-Machines/stacks-pyth-bridge/issues

(use-trait pyth-storage-trait .pyth-traits-v1.storage-trait)
(use-trait pyth-decoder-trait .pyth-traits-v1.decoder-trait)
(use-trait wormhole-core-trait .wormhole-traits-v1.core-trait)

;; Balance insufficient for handling fee
(define-constant ERR_BALANCE_INSUFFICIENT (err u3001))

(define-public (get-price
    (price-feed-id (buff 32))
    (pyth-storage-address <pyth-storage-trait>))
  (begin
    ;; Check execution flow
    (try! (contract-call? .pyth-governance-v2 check-storage-contract pyth-storage-address))
    ;; Perform contract-call
    (contract-call? pyth-storage-address read-price-with-staleness-check price-feed-id)))

(define-public (read-price-feed-original
    (price-feed-id (buff 32))
    (pyth-storage-address <pyth-storage-trait>))
  (begin
    ;; Check execution flow
    (try! (contract-call? .pyth-governance-v2 check-storage-contract pyth-storage-address))
    ;; Perform contract-call
    (contract-call? pyth-storage-address read price-feed-id)))

(define-public (read-price-feed (price-feed-id (buff 32)) (pyth-storage-address <pyth-storage-trait>))
  (let (
    (btc-id 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43)
    (eth-id 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace)
    (stx-id 0xec7a775f46379b5e943c3526b1c8d54cd49749176b0b98e02dde68d1bd335c17)
    (sol-id 0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d)
    (price (if (is-eq price-feed-id btc-id)
              95
              (if (is-eq price-feed-id eth-id)
                  105
                  (if (is-eq price-feed-id stx-id)
                      115
                      125))))
    )
    (ok {
      price: price,
      conf: u0,
      expo: 0,
      ema-price: price,
      ema-conf: u0,
      publish-time: u0,
      prev-publish-time: u0
    })
))

(define-public (verify-and-update-price-feeds 
    (price-feed-bytes (buff 8192))
    (execution-plan {
      pyth-storage-contract: <pyth-storage-trait>,
      pyth-decoder-contract: <pyth-decoder-trait>,
      wormhole-core-contract: <wormhole-core-trait>
    }))
  (begin
    ;; Check execution flow
    (try! (contract-call? .pyth-governance-v2 check-execution-flow contract-caller (some execution-plan)))
    ;; Perform contract-call
    (let ((pyth-decoder-contract (get pyth-decoder-contract execution-plan))
          (wormhole-core-contract (get wormhole-core-contract execution-plan))
          (pyth-storage-contract (get pyth-storage-contract execution-plan))
          (decoded-prices (try! (contract-call? pyth-decoder-contract decode-and-verify-price-feeds price-feed-bytes wormhole-core-contract)))
          (updated-prices (try! (contract-call? pyth-storage-contract write decoded-prices)))
          (fee-info (contract-call? .pyth-governance-v2 get-fee-info))
          (fee-amount (* (len updated-prices) (* (get mantissa fee-info) (pow u10 (get exponent fee-info))))))
      ;; Charge fee
      (if (> fee-amount u0) 
        (unwrap! (stx-transfer? fee-amount tx-sender (get address fee-info)) ERR_BALANCE_INSUFFICIENT)
        true
      )
      
      (ok updated-prices))))

(define-public (decode-price-feeds 
    (price-feed-bytes (buff 8192))
    (execution-plan {
      pyth-storage-contract: <pyth-storage-trait>,
      pyth-decoder-contract: <pyth-decoder-trait>,
      wormhole-core-contract: <wormhole-core-trait>
    }))
  (begin
    ;; Check execution flow
    (try! (contract-call? .pyth-governance-v2 check-execution-flow contract-caller (some execution-plan)))
    ;; Perform contract-call
    (let ((pyth-decoder-contract (get pyth-decoder-contract execution-plan))
          (wormhole-core-contract (get wormhole-core-contract execution-plan))
          (decoded-prices (try! (contract-call? pyth-decoder-contract decode-and-verify-price-feeds price-feed-bytes wormhole-core-contract)))
          (fee-info (contract-call? .pyth-governance-v2 get-fee-info))
          (fee-amount (* (len decoded-prices) (* (get mantissa fee-info) (pow u10 (get exponent fee-info))))))
      ;; Charge fee
      (if (> fee-amount u0) 
        (unwrap! (stx-transfer? fee-amount tx-sender (get address fee-info)) ERR_BALANCE_INSUFFICIENT)
        true
      )
      (ok decoded-prices))))
