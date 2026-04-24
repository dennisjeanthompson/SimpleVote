# Simple DAO Voting Contract

A web-ready DAO voting experience built around a simple Solidity governance contract.
This version adds a modern React + MUI frontend, MetaMask wallet integration, and a clear local deployment flow.

## What’s included
- Smart contract for proposal creation and one-vote-per-address voting
- `deploy.js` updates the frontend environment automatically after deployment
- React frontend with Material UI for a polished governance dashboard
- Wallet connect, proposal creation, and voting interaction

## Tech Stack
- Solidity ^0.8.19
- Hardhat
- Ethers.js v6
- React + Vite
- Material UI

## Quick setup

From the repository root:

```bash
npm install
cd frontend
npm install
```

## Run locally

1. Start a local Hardhat node:

```bash
npx hardhat node
```

2. Deploy the contract to the local network and update the frontend:

```bash
npm run deploy:local
```

3. Start the frontend app:

```bash
npm run web
```

4. Open the URL printed by Vite, then connect MetaMask to the local network at `http://127.0.0.1:8545`.

## Notes
- The frontend uses `frontend/.env` to load `VITE_CONTRACT_ADDRESS`
- If the contract address is still `0x000...0`, rerun `npm run deploy:local`
- When MetaMask is connected, you can create proposals and vote on them from the dashboard

## Commands
- `npm test` — run Hardhat tests
- `npm run compile` — compile the smart contract
- `npm run deploy` — deploy to the default Hardhat network and update frontend env
- `npm run deploy:local` — deploy to `localhost`
- `npm run web` — start the frontend UI
- `npm run setup` — install both root and frontend dependencies

