;; Title: BDP000 Bootstrap
;; Description:
;; Sets up and configure the DAO

(impl-trait  'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.proposal-trait.proposal-trait)

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
				{extension: .bme010-0-liquidity-contribution, enabled: true}
				{extension: .bme021-0-market-voting, enabled: true}
				{extension: .bme022-0-market-gating, enabled: true}
				{extension: .bme023-0-market-predicting, enabled: true}
				{extension: .bme023-0-market-scalar-pyth, enabled: true}
				{extension: .bme023-0-market-scalar-dia, enabled: true}
				{extension: .bme023-0-market-bitcoin, enabled: true}
				{extension: .bme030-0-reputation-token, enabled: true}
			)
		))

		;; Set core team members.
		(try! (contract-call? .bme003-0-core-proposals set-core-team-member 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM true))
		(try! (contract-call? .bme003-0-core-proposals set-core-team-member 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 true))

		;; Set executive team members.
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM true))
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 true))
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG true))
		(try! (contract-call? .bme004-0-core-execute set-executive-team-member 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC true))
		(try! (contract-call? .bme004-0-core-execute set-signals-required u1)) ;; signal from 3 out of 4 team members requied.

		;; configure prediction markets
		;; const allowedCreators = ["ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"];
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-predicting 0x26067618f71da1da6fa33c9b7f8d989b87f71ade892e1c55ce3b46ac79a7e64e))
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-scalar-dia 0x26067618f71da1da6fa33c9b7f8d989b87f71ade892e1c55ce3b46ac79a7e64e))
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-scalar-pyth 0x26067618f71da1da6fa33c9b7f8d989b87f71ade892e1c55ce3b46ac79a7e64e))
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-bitcoin 0x26067618f71da1da6fa33c9b7f8d989b87f71ade892e1c55ce3b46ac79a7e64e))
		
		(try! (contract-call? .bme023-0-market-predicting set-resolution-agent 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG))
		(try! (contract-call? .bme023-0-market-predicting set-dev-fund 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC))
		(try! (contract-call? .bme023-0-market-predicting set-dao-treasury .bme006-0-treasury))
		(try! (contract-call? .bme023-0-market-predicting set-creation-gated true))
		(try! (contract-call? .bme023-0-market-predicting set-allowed-token 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapped-stx true))
		(try! (contract-call? .bme023-0-market-predicting set-allowed-token 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc true))
		(try! (contract-call? .bme023-0-market-predicting set-market-fee-bips-max u300))
		(try! (contract-call? .bme023-0-market-predicting set-market-create-fee u100000000))
		(try! (contract-call? .bme023-0-market-predicting set-dev-fee-bips u100))
		(try! (contract-call? .bme023-0-market-predicting set-dao-fee-bips u150))
		(try! (contract-call? .bme023-0-market-predicting set-dispute-window-length u24))

		(try! (contract-call? .bme023-0-market-scalar-dia set-resolution-agent 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG))
		(try! (contract-call? .bme023-0-market-scalar-dia set-dev-fund 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC))
		(try! (contract-call? .bme023-0-market-scalar-dia set-dao-treasury .bme006-0-treasury))
		(try! (contract-call? .bme023-0-market-scalar-dia set-creation-gated true))
		(try! (contract-call? .bme023-0-market-scalar-dia set-allowed-token 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapped-stx true))
		(try! (contract-call? .bme023-0-market-scalar-dia set-allowed-token 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc true))
		(try! (contract-call? .bme023-0-market-scalar-dia set-market-fee-bips-max u300))
		(try! (contract-call? .bme023-0-market-scalar-dia set-market-create-fee u100000000))
		(try! (contract-call? .bme023-0-market-scalar-dia set-dev-fee-bips u100))
		(try! (contract-call? .bme023-0-market-scalar-dia set-dao-fee-bips u150))
		(try! (contract-call? .bme023-0-market-scalar-dia set-dispute-window-length u24))

		(try! (contract-call? .bme023-0-market-scalar-pyth set-resolution-agent 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-dev-fund 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-dao-treasury .bme006-0-treasury))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-creation-gated true))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-allowed-token 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapped-stx true))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-allowed-token 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc true))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-market-fee-bips-max u300))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-market-create-fee u100000000))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-dev-fee-bips u100))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-dao-fee-bips u150))
		(try! (contract-call? .bme023-0-market-scalar-pyth set-dispute-window-length u24))

		(try! (contract-call? .bme023-0-market-bitcoin set-resolution-agent 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG))
		(try! (contract-call? .bme023-0-market-bitcoin set-dev-fund 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC))
		(try! (contract-call? .bme023-0-market-bitcoin set-dao-treasury .bme006-0-treasury))
		(try! (contract-call? .bme023-0-market-bitcoin set-creation-gated true))
		(try! (contract-call? .bme023-0-market-bitcoin set-market-fee-bips-max u300))
		(try! (contract-call? .bme023-0-market-bitcoin set-market-create-fee u1000000))
		(try! (contract-call? .bme023-0-market-bitcoin set-dev-fee-bips u100))
		(try! (contract-call? .bme023-0-market-bitcoin set-dao-fee-bips u150))
		(try! (contract-call? .bme023-0-market-bitcoin set-dispute-window-length u24))

		(try! (contract-call? .bme021-0-market-voting set-voting-duration u24))
		;;(try! (contract-call? .bme010-0-token-sale initialize-ido))

		;;(try! (contract-call? .bme023-0-market-predicting set-allowed-token .bme000-0-governance-token true))
		(try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc sbtc-mint-many
			(list
				{amount: u1000000000000000, recipient: .bme023-0-market-bitcoin}
				{amount: u1000000000000000, recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM}
				{amount: u1000000000000000, recipient: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5}
				{amount: u1000000000000000, recipient: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG}
				{amount: u1000000000000000, recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC}
				{amount: u1000000000000000, recipient: 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND}
				{amount: u1000000000000000, recipient: 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP}
			)
		))

		;; core team voting rights unlock over u105120 bitcoin
		;; core team voting rights unlock over u105120 bitcoin block period
		(try! (contract-call? .bme000-0-governance-token set-core-team-vesting
			(list
				{recipient: sender, start-block: burn-block-height, duration: u105120}
				{recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM, start-block: burn-block-height, duration: u105120} 
				{recipient: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, start-block: burn-block-height, duration: u105120} 
				{recipient: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG, start-block: burn-block-height, duration: u105120}
				{recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC, start-block: burn-block-height, duration: u105120}
			)
		))
		(try! (contract-call? .bme000-0-governance-token bmg-mint-many
			(list
				{amount: u1000000000, recipient: sender}
				{amount: u1000000000, recipient: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5}
				{amount: u1000000000, recipient: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG}
				{amount: u1000000000, recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC}
				;;{amount: u1000000000, recipient: .bme006-0-treasury}
				{amount: (/ (* u1500 token-supply) u10000), recipient: .bme006-0-treasury}
			)
		))

		(try! (contract-call? .bme030-0-reputation-token set-launch-height))

		;; Entry levels (weight: 1)
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u1 u1))
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u2 u1))
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u3 u1))

		;; Contributor levels (weight: 2)
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u4 u2))
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u5 u2))
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u6 u2))

		;; Active community (weight: 3)
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u7 u3))
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u8 u3))
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u9 u3))

		;; Project leads (weight: 5)
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u10 u5))
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u11 u5))
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u12 u5))

		;; Strategic contributors (weight: 8)
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u13 u8))
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u14 u8))
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u15 u8))

		;; Core stewards (weight: 13)
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u16 u13))
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u17 u13))
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u18 u13))

		;; Founders / exec level (weight: 21)
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u19 u21))
		(try! (contract-call? .bme030-0-reputation-token set-tier-weight u20 u21))

		(print "BigMarket DAO has risen.")
		(ok true)
	)
)
