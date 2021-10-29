// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const eth = "0x2ef73f60F33b167dC018C6B1DCC957F4e4c7e936";

  // We get the contract to deploy
  const DAO = await hre.ethers.getContractFactory("DAO");
  const Vault = await hre.ethers.getContractFactory("Vault");
  const Execution = await hre.ethers.getContractFactory("Execution");
  const Voting = await hre.ethers.getContractFactory("Voting");

  const dao = await DAO.deploy("Our new DAO");
  await dao.deployed();
  const vault = await Vault.deploy(eth);
  await vault.deployed();
  const execution = await Execution.deploy(eth);
  await execution.deployed();
  const voting = await Voting.deploy(dao.address);
  await voting.deployed();

  await execution.setVaultAddress(vault.address);
  await execution.setVotingAddress(voting.address);

  await voting.setExecutionAddress(execution.address);

  console.log("Conguratulations!");
  console.log("DAO deployed to:", dao.address);
  console.log("Vault deployed to:", vault.address);
  console.log("Execution deployed to:", execution.address);
  console.log("Voting deployed to:", voting.address);

  const voteToken = "0x8f68C0cFBBD4c0B0e878EEd7E0D53e6aCD4232A1"; // DAO token
  dao.setVoteToken(voteToken);

  await hre.run("verify:verify", {
    address: dao.address,
    constructorArguments: ["Our new DAO"],
  });
  console.log("DAO verified");

  await hre.run("verify:verify", {
    address: vault.address,
    constructorArguments: [eth],
  });
  console.log("Vault verified");

  await hre.run("verify:verify", {
    address: execution.address,
    constructorArguments: [eth],
  });
  console.log("Execution verified");

  await hre.run("verify:verify", {
    address: voting.address,
    constructorArguments: [dao.address],
  });
  console.log("Voting verified");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
