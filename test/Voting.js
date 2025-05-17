const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { Contract } = require("ethers");
const { ethers } = require("hardhat");
const { Edu_AU_VIC_WA_NT_Arrows } = require("next/font/google");

describe("Voting", function () {
  async function votingFixtures() {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(["A", "B", "C"]);
    await voting.waitForDeployment();

    const [owner, user] = await ethers.getSigners();

    return { voting, owner, user };
  };

  it("Should deploy contract with 3 candidate", async function () {
    const { voting } = await loadFixture(votingFixtures);

    const candidates = await voting.getCandidates();
    expect(candidates.length).to.equal(3);
    expect(candidates[0].name).to.equal("A")
  });

  it("Should allow user to vote", async function () {
    const { voting, owner, user } = await loadFixture(votingFixtures);
    await voting.connect(user).vote(0);
    
    const candidates = await voting.getCandidates();
    expect(candidates[0].voteCount).to.equal(1n);
    expect(await voting.hasVoted(user.address)).to.equal(true);
  });

  it("Should not allow double voting", async function () {
    const { voting } = await loadFixture(votingFixtures);
    const [_, voter] = await ethers.getSigners()

    await voting.connect(voter).vote(0);
    await expect(voting.connect(voter).vote(1)).to.be.revertedWith("You already voted");
  });

  it("Should only allow owner to end voting", async function() {
    const { voting } = await loadFixture(votingFixtures);
    const [owner, other] = await ethers.getSigners();

    await expect(voting.connect(other).endVoting()).to.be.revertedWith("Only owner can end voting");
    await voting.connect(owner).endVoting();

    expect(await voting.votingActive()).to.equal(false);
  });
});
