i need these to be crystal clear so lets redifine and run the numbers ok?

The rules - 1. when user stakes the pay 2% of stake to dev fund and rest to yes/no pool. 2. when user claims (if chose right) the claim pay 2% to the DAO and receive the percentage relative to the total pool (less fees)

1. Alice stake 100STX on YES, market resolves yes
2. Alice stakes 100STX on yes, Bob 100STX on NO market resolves yes
3. Alice 100STX on YES, Bob 50STX on YES, TOM 200STX on NO, ANNIE 20STX on NO market resolves NO

Let's calculate each scenario according to the rules you've defined:

---

### **Rules Recap**

1. **Staking:** When a user stakes, they pay **2% of their stake to the dev fund**. The remaining amount goes to the chosen pool (Yes or No).
2. **Claiming:** When a user claims (if they chose correctly):
   - They pay **2% of their claim amount to the DAO**.
   - They receive their percentage share of the **remaining pool** (after the DAO fee).

---

### **Scenario 1: Alice stakes 100 STX on YES, market resolves YES**

#### **Staking Phase**

- **Dev Fee (2%):**
  \[
  \text{dev-fee} = \frac{100 \times 2}{100} = 2 \, \text{STX}
  \]
- **Contribution to Yes Pool:**
  \[
  \text{yes-pool} = 100 - 2 = 98 \, \text{STX}
  \]

- **Final Pool:**
  - Yes Pool: \( 98 \, \text{STX} \).
  - No Pool: \( 0 \, \text{STX} \).

#### **Claiming Phase**

- **Total Pool:**
  \[
  \text{total-pool} = \text{yes-pool} + \text{no-pool} = 98 + 0 = 98 \, \text{STX}
  \]

- **DAO Fee (2%):**
  \[
  \text{dao-fee} = \frac{98 \times 2}{100} = 1.96 \, \text{STX}
  \]

- **Remaining Pool After DAO Fee:**
  \[
  \text{remaining-pool} = 98 - 1.96 = 96.04 \, \text{STX}
  \]

- **Alice’s Share (100% of the pool):**
  \[
  \text{alice-share} = \text{remaining-pool} = 96.04 \, \text{STX}
  \]

#### **Outcome:**

- Alice staked 100 STX, paid 2 STX to the dev fund, 1.96 STX to the DAO, and received **96.04 STX**.

---

### **Scenario 2: Alice stakes 100 STX on YES, Bob stakes 100 STX on NO, market resolves YES**

#### **Staking Phase**

- **Alice’s Dev Fee (2%):**
  \[
  \text{alice-dev-fee} = \frac{100 \times 2}{100} = 2 \, \text{STX}
  \]

  - Contribution to Yes Pool:
    \[
    \text{alice-contribution} = 100 - 2 = 98 \, \text{STX}
    \]

- **Bob’s Dev Fee (2%):**
  \[
  \text{bob-dev-fee} = \frac{100 \times 2}{100} = 2 \, \text{STX}
  \]

  - Contribution to No Pool:
    \[
    \text{bob-contribution} = 100 - 2 = 98 \, \text{STX}
    \]

- **Final Pool:**
  - Yes Pool: \( 98 \, \text{STX} \).
  - No Pool: \( 98 \, \text{STX} \).

#### **Claiming Phase**

- **Total Pool:**
  \[
  \text{total-pool} = \text{yes-pool} + \text{no-pool} = 98 + 98 = 196 \, \text{STX}
  \]

- **DAO Fee (2%):**
  \[
  \text{dao-fee} = \frac{196 \times 2}{100} = 3.92 \, \text{STX}
  \]

- **Remaining Pool After DAO Fee:**
  \[
  \text{remaining-pool} = 196 - 3.92 = 192.08 \, \text{STX}
  \]

- **Alice’s Share (100% of the Yes Pool):**
  \[
  \text{alice-share} = \frac{\text{alice-contribution} \times \text{remaining-pool}}{\text{yes-pool}}
  \]
  Substituting:
  \[
  \text{alice-share} = \frac{98 \times 192.08}{98} = 192.08 \, \text{STX}
  \]

#### **Outcome:**

- Alice staked 100 STX, paid 2 STX to the dev fund, 3.92 STX to the DAO, and received **192.08 STX**.
- Bob staked 100 STX and received **0 STX**.

---

### **Scenario 3: Alice stakes 100 STX on YES, Bob stakes 50 STX on YES, Tom stakes 200 STX on NO, Annie stakes 20 STX on NO, market resolves NO**

#### **Staking Phase**

- **Alice’s Dev Fee (2%):**
  \[
  \text{alice-dev-fee} = \frac{100 \times 2}{100} = 2 \, \text{STX}
  \]

  - Contribution to Yes Pool:
    \[
    \text{alice-contribution} = 100 - 2 = 98 \, \text{STX}
    \]

- **Bob’s Dev Fee (2%):**
  \[
  \text{bob-dev-fee} = \frac{50 \times 2}{100} = 1 \, \text{STX}
  \]

  - Contribution to Yes Pool:
    \[
    \text{bob-contribution} = 50 - 1 = 49 \, \text{STX}
    \]

- **Tom’s Dev Fee (2%):**
  \[
  \text{tom-dev-fee} = \frac{200 \times 2}{100} = 4 \, \text{STX}
  \]

  - Contribution to No Pool:
    \[
    \text{tom-contribution} = 200 - 4 = 196 \, \text{STX}
    \]

- **Annie’s Dev Fee (2%):**
  \[
  \text{annie-dev-fee} = \frac{20 \times 2}{100} = 0.4 \, \text{STX}
  \]

  - Contribution to No Pool:
    \[
    \text{annie-contribution} = 20 - 0.4 = 19.6 \, \text{STX}
    \]

- **Final Pool:**
  - Yes Pool: \( 98 + 49 = 147 \, \text{STX} \).
  - No Pool: \( 196 + 19.6 = 215.6 \, \text{STX} \).

#### **Claiming Phase**

- **Total Pool:**
  \[
  \text{total-pool} = \text{yes-pool} + \text{no-pool} = 147 + 215.6 = 362.6 \, \text{STX}
  \]

- **DAO Fee (2%):**
  \[
  \text{dao-fee} = \frac{362.6 \times 2}{100} = 7.252 \, \text{STX}
  \]

- **Remaining Pool After DAO Fee:**
  \[
  \text{remaining-pool} = 362.6 - 7.252 = 355.348 \, \text{STX}
  \]

- **Tom’s Share:**
  \[
  \text{tom-share} = \frac{\text{tom-contribution} \times \text{remaining-pool}}{\text{no-pool}}
  \]
  Substituting:
  \[
  \text{tom-share} = \frac{196 \times 355.348}{215.6} = 322.47 \, \text{STX}
  \]

- **Annie’s Share:**
  \[
  \text{annie-share} = \frac{\text{annie-contribution} \times \text{remaining-pool}}{\text{no-pool}}
  \]
  Substituting:
  \[
  \text{annie-share} = \frac{19.6 \times 355.348}{215.6} = 32.88 \, \text{STX}
  \]

#### **Outcome:**

- Alice and Bob lose their stakes, receiving **0 STX**.
- Tom receives **322.47 STX**.
- Annie receives **32.88 STX**.
