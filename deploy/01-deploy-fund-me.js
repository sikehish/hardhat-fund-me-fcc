// https://stackoverflow.com/questions/40294870/module-exports-vs-export-default-in-node-js-and-es6
// https://docs.soliditylang.org/en/v0.8.17/style-guide.html#order-of-layout

const { network } = require("hardhat");
const { networkConfig, devChains } = require("../helper-hardhat-config");
const verify = require("../utils/verify");

// https://stackoverflow.com/questions/2665812/what-is-mocking

//2 ways:

//Method 1:
//hre is the hardhat runtime env
// function deployFunc(hre){
//     console.log("Hi")
// }
// module.exports.default=deployFunc

// Method 2:
module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // if chainId is X use address Y
  // if chainId is Z use address A

  let ethUdPriceFeedAddress;

  if (devChains.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUdPriceFeedAddress = ethUsdAggregator.address;
    //get OR deployments.get will get us the most recent deployment
  } else ethUdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];

  //if the contract doesnt exist we deploy a minimal versionfor our local testing

  //when going for localhost or hardhat network we want to use a mock
  //but what happens whenwe want to change/switch chains as the adress of ETH/USD contract varies from chain to chain
  //we need to modularize or parameterize the address in priceconverter.sol

  //helper-hardhat-config.js is inspired by aave , in which they have different varaibles for different networks

  const args = [ethUdPriceFeedAddress];

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args, //FundMe contract constructor args -> in this case its priceFeed address
    log: true,
    waitConfirmations: network.config.blockConfirmations,
  });

  if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, args);
  }

  log("--------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
