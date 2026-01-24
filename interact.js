const hre = require("hardhat");
const { CONTRACT_ADDRESS } = require("./constants");

async function main() {
    const voting = await hre.ethers.getContractAt("Voting", CONTRACT_ADDRESS);

    // 1. Create a Proposal
    console.log("Creating proposal...");
    const tx1 = await voting.createProposal("Should we adopt EIP-4844?");
    await tx1.wait();
    console.log("Proposal Created!");

    // 2. Cast a Vote
    console.log("Casting vote...");
    const tx2 = await voting.vote(0);
    await tx2.wait();
    console.log("Vote Cast Successfully!");

    // 3. Check Results
    const [desc, count] = await voting.getProposal(0);
    console.log(`Results for "${desc}": ${count} votes`);
}

main().catch(console.error);
