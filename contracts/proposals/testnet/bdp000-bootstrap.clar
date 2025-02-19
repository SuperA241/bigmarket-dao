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
		(try! (contract-call? .bme003-0-core-proposals set-core-team-member 'STTXG1F9BN6FP0Z2BNM1MSZTKE3D445F9KDSZWZT true))
		(try! (contract-call? .bme003-0-core-proposals set-core-team-member 'ST29A6X0MP4ATG0PRGT5WSQ888TY6RC3HNMXK668X true))

		;; Set executive team members.
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'STTXG1F9BN6FP0Z2BNM1MSZTKE3D445F9KDSZWZT true))
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'ST29A6X0MP4ATG0PRGT5WSQ888TY6RC3HNMXK668X true))
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'STPBQA353JF9PC2T9NHEF0P155MNM7SMJ8KDGB09 true))
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'ST14R6BH95C8D9G28VX3R44VBHGHAFGRSZ4MAAR70 true))
		(try! (contract-call? .bme004-0-core-execute set-signals-required u2)) ;; signal 2 out of 4 team members requied.

		;; configure prediction markets
		;; allowedCreators = ["STTXG1F9BN6FP0Z2BNM1MSZTKE3D445F9KDSZWZT", "ST29A6X0MP4ATG0PRGT5WSQ888TY6RC3HNMXK668X", "ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY", "ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ"];
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-predicting 0x6b55a4646e7ea110a2b01714987c1228d54777656ea20f19d86d2ff9f5001e1f))
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-scalar 0x6b55a4646e7ea110a2b01714987c1228d54777656ea20f19d86d2ff9f5001e1f))
		(try! (contract-call? .bme023-0-market-predicting set-resolution-agent 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY))
		(try! (contract-call? .bme023-0-market-predicting set-dev-fund 'ST14R6BH95C8D9G28VX3R44VBHGHAFGRSZ4MAAR70))
		(try! (contract-call? .bme023-0-market-predicting set-dao-treasury .bme006-0-treasury))
		(try! (contract-call? .bme023-0-market-predicting set-allowed-token .wrapped-stx true))
		(try! (contract-call? .bme023-0-market-predicting set-allowed-token .sbtc true))
		(try! (contract-call? .bme023-0-market-predicting set-allowed-token .bme000-0-governance-token true))

		(try! (contract-call? .bme023-0-market-scalar set-resolution-agent 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY))
		(try! (contract-call? .bme023-0-market-scalar set-dev-fund 'ST14R6BH95C8D9G28VX3R44VBHGHAFGRSZ4MAAR70))
		(try! (contract-call? .bme023-0-market-scalar set-dao-treasury .bme006-0-treasury))
		(try! (contract-call? .bme023-0-market-scalar set-allowed-token .wrapped-stx true))
		(try! (contract-call? .bme023-0-market-scalar set-allowed-token .sbtc true))
		(try! (contract-call? .bme023-0-market-scalar set-allowed-token .bme000-0-governance-token true))

		(try! (contract-call? .bme010-0-token-sale initialize-ido))

		;; Fake sbtc mint.
		(try! (contract-call? .sbtc sbtc-mint-many
			(list
				{amount: u1000000000, recipient: 'STTXG1F9BN6FP0Z2BNM1MSZTKE3D445F9KDSZWZT}
				{amount: u1000000000, recipient: 'ST29A6X0MP4ATG0PRGT5WSQ888TY6RC3HNMXK668X}
			)
		))
		;; core team voting rights unlock over u105120 bitcoin block period 
		(try! (contract-call? .bme000-0-governance-token set-core-team-vesting
			(list
				{recipient: sender, start-block: burn-block-height, duration: u105120}
				{recipient: 'ST29A6X0MP4ATG0PRGT5WSQ888TY6RC3HNMXK668X, start-block: burn-block-height, duration: u105120} 
				{recipient: 'STPBQA353JF9PC2T9NHEF0P155MNM7SMJ8KDGB09, start-block: burn-block-height, duration: u105120} 
				{recipient: 'ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ, start-block: burn-block-height, duration: u105120}
				{recipient: 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY, start-block: burn-block-height, duration: u105120}
			)
		))
		(try! (contract-call? .bme000-0-governance-token bmg-mint-many
			(list
				{amount: (/ (* u1000 token-supply) u10000), recipient: .bme006-0-treasury}
			)
		))

		(print "BigMarket DAO has risen.")
		(ok true)
	)
)
