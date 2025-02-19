;; Title: BDP000 account gating
;; Description:
;; GENERATE TESTNET MERKLE ROOTS FOR MARKET CREATION

(impl-trait  .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		;; ["STTXG1F9BN6FP0Z2BNM1MSZTKE3D445F9KDSZWZT", "ST29A6X0MP4ATG0PRGT5WSQ888TY6RC3HNMXK668X", "ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY", "ST105HCS1RTR7D61EZET8CWNEF24ENEN3V6ARBYBJ"];
		(try! (contract-call? .bme022-0-market-gating set-merkle-root-by-principal .bme023-0-market-predicting 0x32052e1600fb0b2cf53566c79b129a1c0aea9b5f254de08ad26eb7fbfbaffbf3))

		(print "Merkle root for account gating updated.")
		(ok true)
	)
)
