;; Title: pyth-storage
;; Version: v3
;; Check for latest version: https://github.com/Trust-Machines/stacks-pyth-bridge#latest-version
;; Report an issue: https://github.com/Trust-Machines/stacks-pyth-bridge/issues

(impl-trait .pyth-traits-v1.storage-trait)


(define-public (read (price-identifier (buff 32)))
  (begin
    (ok {price: u1})))

