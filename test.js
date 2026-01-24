const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  it("Should allow creating proposals and voting", async function () {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    await voting.createProposal("Test Proposal");
    await voting.vote(0);

    const [desc, count] = await voting.getProposal(0);
    
    expect(desc).to.equal("Test Proposal");
    expect(count).to.equal(1n);
  });
});
