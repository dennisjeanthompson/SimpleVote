const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Voting Contract...");

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log(`✅ Voting Contract deployed to: ${address}`);

  const envPath = path.resolve(__dirname, "frontend", ".env");
  const envContent = `VITE_CONTRACT_ADDRESS=${address}\n`;
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Frontend environment updated at ${envPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
