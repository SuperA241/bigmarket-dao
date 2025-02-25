;; Title: BDP000 Bootstrap
;; Description:
;; Sets up and configure the DAO

(impl-trait  .proposal-trait.proposal-trait)

(define-constant token-supply u10000000000000)

(define-public (execute (sender principal))
	(begin
		;; Enable genesis extensions.
		(try! (contract-call? .bigmarket-dao set-extensions
			(list
				{extension: .bme000-0-governance-token, enabled: true}
				{extension: .bme001-0-proposal-voting, enabled: true}
				{extension: .bme003-0-core-proposals, enabled: true}
				{extension: .bme004-0-core-execute, enabled: true}
				{extension: .bme006-0-treasury, enabled: true}
				{extension: .bme010-0-token-sale, enabled: true}
				{extension: .bme021-0-market-voting, enabled: true}
				{extension: .bme022-0-market-gating, enabled: true}
				{extension: .bme023-0-market-predicting, enabled: true}
				{extension: .bme023-0-market-scalar, enabled: true}
			)
		))
		;; Set core team members.
		(try! (contract-call? .bme003-0-core-proposals set-core-team-member 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY true))
		(try! (contract-call? .bme003-0-core-proposals set-core-team-member 'ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ true))

		;; Set executive team members.
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'ST31A25YBK50KFJ2QS0EQK9FNXEQJD4PR0828789R true))
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'ST2ZGXYF58V9D2HXDTP3N02DC3F8G2251PPGRXDQD true))
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY true))
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ true))
		(try! (contract-call? .bme004-0-core-execute set-signals-required u2)) ;; signal 2 out of 4 team members requied.

		;; configure prediction markets
		;; allowedCreators = ["ST31A25YBK50KFJ2QS0EQK9FNXEQJD4PR0828789R", "ST2ZGXYF58V9D2HXDTP3N02DC3F8G2251PPGRXDQD", "ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY", "ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ"];
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-predicting 0x70a06106d0aaecb26ab15155dc1d958422d991a5367d446699f9a978e80f12f0))
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-scalar 0x70a06106d0aaecb26ab15155dc1d958422d991a5367d446699f9a978e80f12f0))
		(try! (contract-call? .bme023-0-market-predicting set-resolution-agent 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY))
		(try! (contract-call? .bme023-0-market-predicting set-dev-fund 'ST18V03KSFR84AG69JEPG6SM7GA1CBJR6PSXS1Y8M))
		(try! (contract-call? .bme023-0-market-predicting set-dao-treasury .bme006-0-treasury))
		(try! (contract-call? .bme023-0-market-predicting set-allowed-token .wrapped-stx true))
		(try! (contract-call? .bme023-0-market-predicting set-allowed-token .bme000-0-governance-token true))

		(try! (contract-call? .bme023-0-market-scalar set-resolution-agent 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY))
		(try! (contract-call? .bme023-0-market-scalar set-dev-fund 'ST18V03KSFR84AG69JEPG6SM7GA1CBJR6PSXS1Y8M))
		(try! (contract-call? .bme023-0-market-scalar set-dao-treasury .bme006-0-treasury))
		(try! (contract-call? .bme023-0-market-scalar set-allowed-token .wrapped-stx true))
		(try! (contract-call? .bme023-0-market-scalar set-allowed-token .bme000-0-governance-token true))

		(try! (contract-call? .bme010-0-token-sale initialize-ido))

		;; core team voting rights unlock over u105120 bitcoin block period 
		(try! (contract-call? .bme000-0-governance-token set-core-team-vesting
			(list
				{recipient: sender, start-block: burn-block-height, duration: u105120}
				{recipient: 'ST2ZGXYF58V9D2HXDTP3N02DC3F8G2251PPGRXDQD, start-block: burn-block-height, duration: u105120} 
				{recipient: 'ST4MRSK0XMGX05VNWNNTQQE8D8RN5J91SP5VWWCV, start-block: burn-block-height, duration: u105120} 
				{recipient: 'ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ, start-block: burn-block-height, duration: u105120}
				{recipient: 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY, start-block: burn-block-height, duration: u105120}
			)
		))
		(try! (contract-call? .bme000-0-governance-token bmg-mint-many
			(list
				{amount: (/ (* u1500 token-supply) u10000), recipient: .bme006-0-treasury}
			)
		))

		(print "BigMarket DAO has risen.")
		(ok true)
	)
)
