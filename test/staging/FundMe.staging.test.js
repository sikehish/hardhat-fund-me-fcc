//These tests are run on the testnet rught before deploying on mainnet

const { ethers, getNamedAccounts, network } = require("hardhat");
const { devChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

devChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe,
        deployer,
        sendValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        // await deployments.fixture(["all"]); -> We dont write this as we're assuming that the contracts are already deployed on testnet
        //We dont use mocks as on testnet we dont need mocks ex: sepolia(tetnet)'s got a price feed provided by chainlink for eth/usd conversion
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("allows people to fund and withdraw", async () => {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), "0");
      });
    });
