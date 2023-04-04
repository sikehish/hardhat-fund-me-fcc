const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log(`Got contract FundMe at ${fundMe.address}`);
  console.log("Funding contract...");
  const txRes = await fundMe.fund({
    value: ethers.utils.parseEther("0.1"),
  });
  await txRes.wait(1);
  console.log("Funded!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//Commands:
//yarn hardhat node (you get the deployed contracts)
//yarn hardhat run scripts/fund.js --network localhost

// https://ethereum.stackexchange.com/questions/119694/learning-hardhat-what-is-the-difference-between-deploying-to-localhost-and-hard
