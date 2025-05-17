// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VotingModule", (m) => {
  const candidates = ["Alice", "Bob", "Charlie"];
  const voting = m.contract("Voting", [candidates]);

  return { voting };
});
