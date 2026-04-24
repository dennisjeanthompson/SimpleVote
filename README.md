# SimpleVote

A modern DAO voting app with a clean React UI, wallet integration, and smart contract governance.

## Features
- 🗳️ Create and vote on proposals
- 🔐 MetaMask wallet integration  
- ⚡ Real-time vote tracking
- 🎨 Modern Material UI dashboard

## Get Started

**Install:**
```bash
npm run setup
```

**Run locally:**
```bash
npx hardhat node
npm run deploy:local
npm run web
```

Open `http://localhost:5173` and connect MetaMask to `http://127.0.0.1:8545`.

**Deploy to Vercel:**
Push to `main` branch. Contract address must be set in `frontend/.env.production`.

## Tech
React • Vite • Material UI • Solidity • Hardhat • Ethers.js
