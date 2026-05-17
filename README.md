# crate-frontend

React 18 + TypeScript + Vite frontend for the Crate P2P beat marketplace on Stellar.

## Contract

**Testnet:** `CA7DGEWWS3VH5J2I4I7FFEB5UHK2MJSYWDKDQKXQM7GDNLI2IRATDTLG`

## Stack

- **React 18** + TypeScript
- **Vite** build tool
- **@creit.tech/stellar-wallets-kit** — Freighter wallet integration
- **@stellar/stellar-sdk** — Soroban contract bindings
- **Tailwind CSS** + custom dark theme
- **react-router-dom** v7 — client-side routing
- **IPFS via Pinata** — beat file storage

## Routes

| Path | Page |
|---|---|
| `/` | Home — hero, stats, featured beats |
| `/marketplace` | Browse and buy samples |
| `/upload` | Upload a beat (producers) |
| `/profile` | Wallet, earnings, withdrawal |
| `/sample/:id` | Sample detail + buy |

## Setup

```bash
npm install
cp .env.example .env
# Fill in VITE_CONTRACT_ID, VITE_PINATA_JWT, VITE_NETWORK
npm run dev
```

## Environment Variables

```
VITE_CONTRACT_ID=CA7DGEWWS3VH5J2I4I7FFEB5UHK2MJSYWDKDQKXQM7GDNLI2IRATDTLG
VITE_PINATA_JWT=your_pinata_jwt
VITE_NETWORK=TESTNET
```

## Design System

- Background: `#0a0a0a`
- Accent (yellow): `#facc15`
- Surface: `#111111`
- No gradients, dark professional aesthetic
