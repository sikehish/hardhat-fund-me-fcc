const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log(`Got contract FundMe at ${fundMe.address}`);
  console.log("Withdrawing from contract...");
  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait(1);
  console.log("Got it back!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//Commands:
//yarn hardhat node (you get the deployed contracts)
//yarn hardhat run scripts/withdraw.js --network localhost

// https://ethereum.stackexchange.com/questions/119694/learning-hardhat-what-is-the-difference-between-deploying-to-localhost-and-hard
