// require("@nomiclabs/hardhat-waffle");
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

module.exports = {
  // https://hardhat.org/hardhat-runner/docs/advanced/multiple-solidity-versions
  solidity: {
    compilers: [
      {
        version: "0.8.18",
      },
      {
        version: "0.6.6",
      },
    ],
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY, //in order to get currency in USD
    token: "MATIC", //default is ETH
  },
  namedAccounts: {
    // https://github.com/wighawag/hardhat-deploy#1-namedaccounts-ability-to-name-addresses
    deployer: {
      default: 0,
      31337: 1, //on harhdat network, its at index 1 in accounts array OR second acc
    },
    user: {
      default: 1,
    },
  },
};
