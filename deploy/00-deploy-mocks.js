//we dont deploy mocks for rinkeby or polygon or other testnets/maonnets  cuz they have the price feeds
//We do this for networks like localhost or hardhat where we dont have priceFeed contracts

const { network } = require("hardhat");
const {
  devChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // Constructor of MockV3Aggregator.sol
  // constructor(
  //     uint8 _decimals,
  //     int256 _initialAnswer
  //   ) public {
  //     decimals = _decimals;
  //     updateAnswer(_initialAnswer);
  //   }

  //log is basically console.log

  // if(chainId == "31337")) OR
  if (devChains.includes(network.name)) {
    log("Local Network detected: Deploying mocks...");
    await deploy("MockV3Aggregator", {
      //   contract: "MockV3Aggregator", -It works w/o this
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER],
      log: true,
    });
    log("Mocks deployed!");
    log("------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
