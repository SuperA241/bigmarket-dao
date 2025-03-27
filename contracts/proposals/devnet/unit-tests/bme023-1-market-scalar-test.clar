;; Title: test contrcat for reading pyth price given a feed id
;; Synopsis:
;; Implements scalar prediciton markets (see also bme023-0-market-predicting).
;; Description:
;; Scalar markets differ from binary/categorical markets (see bme023-0-market-predicting)
;; in the type of categories and the mechanism for rsolution:
;; Firstly, the categories are contiguous ranges of numbers with a min and max value. The winning
;; category is decided by the range that the outcome selects. Secondly, scalar market outcomes
;; are determined by on-chain oracles. 
;; This contract uses the Pyth oracle for selecting from possible outcomes.

;; Price Feeds
;; PYTH_ORACLE 'ST20M5GABDT6WYJHXBT5CDH4501V1Q65242SPRMXH.pyth-storage-v3
;; PYTH_ORACLE 'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-storage-v3

(define-constant err-unauthorised (err u10000))

;; Resolve a market invoked by ai-agent.
;;(tuple (conf uint) (ema-conf uint) (ema-price int) (expo int) (prev-publish-time uint) (price int) (publish-time uint))
(define-read-only (parse-pyth-price (price-data (tuple (price int) (conf uint) (ema-conf uint) (expo int) 
              (ema-price int) (publish-time uint) (prev-publish-time uint))))
  (begin 
    (to-uint (get price price-data))
))