// VVI https://hardhat.org/tutorial/debugging-with-hardhat-network

//Tests are of two types here: Unit(which are done locally)
//And Staging tests, which are done on testnet

//Unit tests can be donewith local hardhat network or forked hardhat network
//Units tests are performed on development chains
const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { devChains } = require("../../helper-hardhat-config");

//FundMe describe is for the entire fundMe contract which consists of individual descirbe for different funcs
!devChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1");
      //OR   const sendValue = "1000000000000000000"; //1 ETH or 10^9 GWEI 10^18 WEI
      beforeEach(async () => {
        //deploy fundme contract using hardhat deploy

        deployer = (await getNamedAccounts()).deployer;
        //OR const accounts = await ethers.getSigners() -->will return the accounts in networks section
        //but will return 10 fake accounts in case of hardhat
        //const deployer = accounts[0]
        await deployments.fixture(["all"]); //will run all the files in deploy folder with matching tags
        fundMe = await ethers.getContract("FundMe", deployer);
        //or  await deployments.get("MyContract"); https://ethereum.stackexchange.com/questions/139409/hardhat-deploy-typeerror-ethers-getcontract-is-not-a-function
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", async () => {
        it("sets the aggregator address correctly", async () => {
          const res = await fundMe.getPriceFeed();
          assert.equal(res, mockV3Aggregator.address);
        });
      });

      describe("fund", async () => {
        it("fails if you dont send enough ETH", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
          await expect(fundMe.fund()).to.be.reverted;
        });
        it("updated the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue });
          const res = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(res.toString(), sendValue.toString());
        });
        it("Adds funder to array of funders", async () => {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });

      describe("withdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue });
          const signers = await ethers.getSigners();
          const ind = signers.findIndex((el) => el.address == deployer);
          console.log(`Index of the deployer is ${ind}`);
          //
        });

        it("withdraw ETH from a single founder", async () => {
          //NOTE: getBalance will return BigNumber
          //Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //Act
          const txRes = await fundMe.withdraw();
          const txReceipt = await txRes.wait(1);
          //   console.log(txReceipt);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("cheaper withdraw ETH from a single founder", async () => {
          //NOTE: getBalance will return BigNumber
          //Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //Act
          const txRes = await fundMe.cheaperWithdraw();
          const txReceipt = await txRes.wait(1);
          //   console.log(txReceipt);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("allows us to withdraw ETH with multiple founders", async () => {
          //Arrange
          const accounts = await ethers.getSigners();
          //We're going from 1 to 6 as deployer is at index 1 in hardhat n/w acc to hardhat.config
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //Act
          const txRes = await fundMe.withdraw();
          const txReceipt = await txRes.wait(1);
          //   console.log(txReceipt);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          console.log(
            "Ending Fund Me: ",
            endingFundMeBalance,
            endingFundMeBalance.toString()
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          //Make sure the funders are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted; //Cuz funders is set to empty array of size 0
          for (i = 1; i < 6; i++) {
            // deployer is at index 1 as we menioend in hardhat.config that 31337:1 else itll be at ind 0
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("Only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners();
          let attacker = accounts[1]; //deployer is at index 1 in hardhat n/w (as per hardhat config)
          // If we wouldnt have mentioned it in the hardhat.config then deployer index would be 0
          let attackerConnectedContract = await fundMe.connect(attacker);
          assert.equal(await fundMe.getOwner(), attacker.address);
          attacker = accounts[2];
          attackerConnectedContract = await fundMe.connect(attacker);
          // await expect(attackerConnectedContract.withdraw()).to.be.reverted;
          await expect(
            attackerConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });
      });
    });
