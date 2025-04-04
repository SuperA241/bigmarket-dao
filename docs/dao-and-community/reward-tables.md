---
description: Breaks down rewards and how they're earned
icon: monero
---

# Reward Tables

### Activity-to-Reputation Mapping (BigMarket DAO)

#### 🔗 **On-Chain Actions**

| Action                   | Trigger Event           | Suggested Tier | BIGR Earned | Notes                              |
| ------------------------ | ----------------------- | -------------- | ----------- | ---------------------------------- |
| Stake in market          | `stake`                 | Tier 4         | 3           | Based on amount and duration       |
| Manual market creation   | `create-market`         | Tier 7         | 5           | One-time per valid market          |
| AI market creation       | `create-ai-market`      | Tier 6         | 3           | One-time per valid AI prompt       |
| Market resolution voting | `vote-on-resolution`    | Tier 5         | 1           | Per vote                           |
| Winning staker           | `claim-market-winnings` | Tier 6         | 2           | Bonus if early staker or high-risk |
| DAO proposal voting      | `vote-proposal`         | Tier 5         | 2           | Based on consistency and turnout   |
| DAO proposal submitted   | `submit-proposal`       | Tier 8         | 6           | Based on impact and discussion     |
| 💧 Liquidity provision   | `stake-liquidity`       | Tier 7         | 5           | Weighted by amount contributed     |

#### 🪄 **Off-Chain Contributions**

| Contribution Type               | Recognition Method      | Suggested Tier | BIGR Earned | Notes                              |
| ------------------------------- | ----------------------- | -------------- | ----------- | ---------------------------------- |
| Staking                         | bonus BIGR              | 4-6            | 3-5         | Based on how early to stake        |
| 🧵 Posts on X (Twitter)         | Verified / voted        | Tier 2–4       | 1–2         | Based on engagement + quality      |
| 🗞️ Content (articles/videos)   | Manual / bounty         | Tier 5–7       | 3–5         | Linked to DAO visibility           |
| 📈 Growth marketing help        | Nominated or proposal   | Tier 6–8       | 4–6         | Funnels, campaign help, dashboards |
| 🧪 Beta testing & feedback      | Form + DAO confirmation | Tier 3–5       | 1–3         | Bonus for bugs or user insights    |
| 🎨 Design contributions         | GitHub or bounty        | Tier 5–8       | 3–6         | UI, infographics, branding         |
| 🤝 Partnerships / outreach      | DAO report or proposal  | Tier 10–15     | 8–12        | Strategic value & follow-through   |
| 🧙 Community mod / Discord help | Consistent engagement   | Tier 4–7       | 2–4         | Based on cycles or nomination      |

## Reputation Tiers — BigMarket DAO

To fairly reward contribution the tiers are weighted - these weights are used in our smart contracts to fairly and transparently reward contributions.

| Tier ID | Name                   | Weight | Description                         |
| ------- | ---------------------- | ------ | ----------------------------------- |
| `1`     | Newcomer               | 1      | Joined the platform                 |
| `2`     | Community member       | 1      | Engaged in discussions              |
| `3`     | Forum participant      | 1      | Posted/commented on proposals       |
| `4`     | Contributor I          | 2      | Participated in a vote              |
| `5`     | Contributor II         | 2      | Shared feedback or minor PRs        |
| `6`     | Contributor III        | 2      | Reported bugs or community issues   |
| `7`     | Proposal author        | 3      | Authored a draft proposal           |
| `8`     | Facilitator            | 3      | Helped run voting rounds            |
| `9`     | Voter / DAO role       | 3      | Consistently votes and shows up     |
| `10`    | Project Lead I         | 5      | Leads a small initiative            |
| `11`    | Project Lead II        | 5      | Coordinates working groups          |
| `12`    | Core Maintainer        | 5      | Contributes to DAO codebase         |
| `13`    | Ecosystem Advisor I    | 8      | Technical or growth advisor         |
| `14`    | Ecosystem Advisor II   | 8      | Strategic contributor               |
| `15`    | Strategic Partner      | 8      | Runs integrations or collaborations |
| `16`    | Steward I              | 13     | Oversees subDAO or domain           |
| `17`    | Steward II             | 13     | Multi-role, multi-cycle lead        |
| `18`    | Multi-role Contributor | 13     | Cross-functional coordinator        |
| `19`    | Founder                | 21     | Founding member of the DAO          |
| `20`    | Executive DAO Lead     | 21     | Executive-level DAO leadership      |
