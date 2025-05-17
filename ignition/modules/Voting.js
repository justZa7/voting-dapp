// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VotingModuleV2", (m) => {
  const candidates = ["Hidup Blonde", "Hidup Joe koe we", "Hidup Windah Basudara"];
  const voting = m.contract("Voting", [candidates]);

  return { voting };
});
