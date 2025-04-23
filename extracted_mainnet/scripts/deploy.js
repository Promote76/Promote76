async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  const Engine = await ethers.getContractFactory("SWFSovereignEngine");
  const engine = await Engine.deploy();
  await engine.deployed();
  console.log("SWFSovereignEngine deployed to:", engine.address);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});