;; Title: Enable Pyth prediciton markets
;; Author(s): mijoco.btc
;; Synopsis:
;; Description:

(impl-trait  'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? .bigmarket-dao set-extensions
			(list
				{extension: .bme023-2-market-scalar, enabled: false}
				{extension: .bme023-0-market-scalar-pyth, enabled: true}
			)
		))
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-scalar-pyth 0x70a06106d0aaecb26ab15155dc1d958422d991a5367d446699f9a978e80f12f0))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-resolution-agent 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-dev-fund 'ST1EEDB05014JVXS8BF3E1G54WC5M782AC66WPHAR))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-dao-treasury .bme006-0-treasury))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-allowed-token .wrapped-stx true))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-allowed-token .bme000-0-governance-token true))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-allowed-token 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token true))
		(ok true)
	)
)
