const hre = require("hardhat");

async function main() {
  const Ledger = await hre.ethers.getContractFactory("EvidenceLedger");
  const ledger = await Ledger.deploy();
  await ledger.waitForDeployment();
  const address = await ledger.getAddress();
  console.log("EvidenceLedger deployed to:", address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});