//helper-hardhat-config.js is inspired by aave , in which they have different varaibles for different networks

exports.networkConfig = {
  //Rinkeby
  4: {
    name: "rinkeby",
    ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  },
  137: {
    name: "polygon",
    ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  },
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
};

exports.DECIMALS = 8;
exports.INITIAL_ANSWER = 200000000000;
exports.devChains = ["hardhat", "localhost"];

//OR
// module.exports = {
//   networkConfig,
//   devChains,
//   DECIMALS,
//   INITIAL_ANSWER,
// };
