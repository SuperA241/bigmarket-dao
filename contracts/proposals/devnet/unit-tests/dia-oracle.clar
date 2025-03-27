(define-map test-values
  (string-ascii 32) ;; Key, e.g., "STX/USD/0", "STX/USD/1"
  (tuple (value uint) (timestamp uint))
)

;; Set a test value for a given key
(define-public (set-value (key (string-ascii 32)) (price uint) (timestamp uint))
  (begin
    (map-set test-values key { value: price, timestamp: timestamp })
    (print {event: "set-value", key: key, price: price, timestamp: timestamp})
    (ok true)
  )
)

;; Get the value for a given key (mimics DIA's `get-value`)
(define-read-only (get-value (key (string-ascii 32)))
  (ok (default-to { value: u0, timestamp: u0 } (map-get? test-values key)))
)

(begin 
    (map-set test-values "STX/USD/0" { value: u95, timestamp: u1739355000 })
    (map-set test-values "STX/USD/1" { value: u105, timestamp: u1739355100 })
    (map-set test-values "STX/USD/2" { value: u115, timestamp: u1739355200 })
    (map-set test-values "STX/USD/3" { value: u125, timestamp: u1739355200 })
) 
