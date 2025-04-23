async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with account:", deployer.address);

  const Token = await ethers.getContractFactory("SovranWealthFund");
  const token = await Token.deploy(
    "0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6", // Main Distributor
    "0x26A8401287cE33CC4aeb5a106cd6D282a9C2f51d"  // Treasury
  );

  await token.deployed();
  console.log("SovranWealthFund deployed to:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});