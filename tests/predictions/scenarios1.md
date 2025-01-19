the market resolves yes then what does Alice get back?
alice pays 2% to the dev fund when she stakes and 2% to the dao when she claims. Run it for this scenario and also when Bob stakes 100STX on no.

Let's run the scenarios while accounting for:

1. **Alice paying 2% to the dev fund when she stakes.**
2. **Alice paying 2% to the DAO when she claims.**

We'll also handle the case where Bob stakes on **No** to see how the calculations adjust.

---

### **Constants and Assumptions:**

- **DEV-FEE-BIPS:** \( 200 \) (2% dev fee on staking).
- **DAO-FEE-BIPS:** \( 200 \) (2% DAO fee on claiming).
- **Alice stakes 100 STX on Yes.**
- **Bob stakes 100 STX on No** (for the second scenario).
- **Winning outcome is Yes.**

---

### **Scenario 1: Alice Stakes 100 STX on Yes (No Bob)**

#### 1. **When Alice Stakes:**

- Dev fee:
  \[
  \text{dev-fee} = \frac{\text{stake} \times \text{DEV-FEE-BIPS}}{10000}
  \]
  Substituting:
  \[
  \text{dev-fee} = \frac{100 \times 200}{10000} = 2 \, \text{STX}
  \]

- Net stake:
  \[
  \text{user-stake-after-fee} = \text{stake} - \text{dev-fee}
  \]
  Substituting:
  \[
  \text{user-stake-after-fee} = 100 - 2 = 98 \, \text{STX}
  \]

  Alice's stake in the **Yes pool** is \( 98 \, \text{STX} \).

#### 2. **When Alice Claims (Winning Outcome is Yes):**

- Total pool = \( 98 \, \text{STX} \) (Yes) + \( 0 \, \text{STX} \) (No) = \( 98 \, \text{STX} \).
- DAO fee:
  \[
  \text{dao-fee} = \frac{\text{total-pool} \times \text{DAO-FEE-BIPS}}{10000}
  \]
  Substituting:
  \[
  \text{dao-fee} = \frac{98 \times 200}{10000} = 1.96 \, \text{STX}
  \]

- Remaining pool after DAO fee:
  \[
  \text{post-dao-pool} = \text{total-pool} - \text{dao-fee}
  \]
  Substituting:
  \[
  \text{post-dao-pool} = 98 - 1.96 = 96.04 \, \text{STX}
  \]

- Alice’s share (since she owns the entire pool):
  \[
  \text{user-share} = \frac{\text{user-stake-after-fee} \times \text{post-dao-pool}}{\text{winning-pool}}
  \]
  Substituting:
  \[
  \text{user-share} = \frac{98 \times 96.04}{98} = 96.04 \, \text{STX}
  \]

#### **Alice’s Final Return:**

- Alice initially staked \( 100 \, \text{STX} \).
- She paid \( 2 \, \text{STX} \) to the dev fund and \( 1.96 \, \text{STX} \) to the DAO.
- Final return: \( 96.04 \, \text{STX} \).

---

### **Scenario 2: Alice Stakes on Yes, Bob Stakes on No**

#### 1. **When Alice Stakes:**

- Dev fee:
  \[
  \text{dev-fee} = \frac{100 \times 200}{10000} = 2 \, \text{STX}
  \]
- Net stake:
  \[
  \text{alice-stake-after-fee} = 100 - 2 = 98 \, \text{STX}
  \]

#### 2. **When Bob Stakes:**

- Dev fee:
  \[
  \text{dev-fee} = \frac{100 \times 200}{10000} = 2 \, \text{STX}
  \]
- Net stake:
  \[
  \text{bob-stake-after-fee} = 100 - 2 = 98 \, \text{STX}
  \]

- Total Yes pool: \( 98 \, \text{STX} \).
- Total No pool: \( 98 \, \text{STX} \).

#### 3. **When Alice Claims (Winning Outcome is Yes):**

- Total pool:
  \[
  \text{total-pool} = \text{Yes pool} + \text{No pool} = 98 + 98 = 196 \, \text{STX}
  \]

- DAO fee:
  \[
  \text{dao-fee} = \frac{\text{total-pool} \times \text{DAO-FEE-BIPS}}{10000}
  \]
  Substituting:
  \[
  \text{dao-fee} = \frac{196 \times 200}{10000} = 3.92 \, \text{STX}
  \]

- Remaining pool after DAO fee:
  \[
  \text{post-dao-pool} = \text{total-pool} - \text{dao-fee}
  \]
  Substituting:
  \[
  \text{post-dao-pool} = 196 - 3.92 = 192.08 \, \text{STX}
  \]

- Alice’s share:
  \[
  \text{user-share} = \frac{\text{alice-stake-after-fee} \times \text{post-dao-pool}}{\text{Yes pool}}
  \]
  Substituting:
  \[
  \text{user-share} = \frac{98 \times 192.08}{98} = 192.08 \, \text{STX}
  \]

#### **Alice’s Final Return:**

- Alice initially staked \( 100 \, \text{STX} \).
- She paid \( 2 \, \text{STX} \) to the dev fund and \( 3.92 \, \text{STX} \) (half of \( 3.92 \)) as her portion of the DAO fee.
- Alice receives \( 192.08 \, \text{STX} \).

#### **Bob’s Return:**

Bob loses his stake, so he gets \( 0 \, \text{STX} \).

---

### **Summary of Returns:**

| Scenario              | Alice’s Return | Bob’s Return |
| --------------------- | -------------- | ------------ |
| Alice only stakes Yes | 96.04 STX      | N/A          |
| Alice and Bob stake   | 192.08 STX     | 0 STX        |
