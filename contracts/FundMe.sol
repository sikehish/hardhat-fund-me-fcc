// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// https://docs.soliditylang.org/en/v0.8.17/style-guide.html#order-of-layout
//Look into natspec and documentation https://docs.soliditylang.org/en/v0.8.17/natspec-format.html

//VVI https://hardhat.org/tutorial/debugging-with-hardhat-network

// https://www.geeksforgeeks.org/difference-between-sha-256-and-keccak-256/
// https://medium.com/coinmonks/ethereum-solidity-memory-vs-storage-which-to-use-in-local-functions-72b593c3703a
// https://www.geeksforgeeks.org/storage-vs-memory-in-solidity/
// https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html

//OPCodes in EVM: https://ethereum.org/en/developers/docs/evm/opcodes/  https://github.com/crytic/evm-opcodes

//REMEMBER: reading and saving data in storage variables costs quite some Gas. Thus we need to implement Gas Optimizations using storage knowledge
//However reading and writing data to memory variables is cheaper

//ALSO: internal/pvt variables are cheaper gas wise than public
// https://ethereum.stackexchange.com/questions/139088/why-gas-prices-vary-according-to-state-visibility-public-external-private-inter

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

//Error codes are cheaper than strings

//Error format(best practice in sol): error ContractName__CustomErrorName();

contract FundMe {
    using PriceConverter for uint256;

    //Convention for storage variables: append 's_' else 'i_' for immutbale and capslock for Constant

    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // https://codedamn.com/news/solidity/payable-function-in-solidity-example-how-to-use-it
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    // function getVersion() public view returns (uint256){
    //     // ETH/USD price feed address of Sepolia Network.
    //     AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    //     return priceFeed.version();
    // }

    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // https://solidity-by-example.org/sending-ether/
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        //NOTE: Mappings cannot be written as memory variables as they are stored in storage
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly

//Functions order:
// constructor
// receive
// fallback
// external
// public
// internal
// private
// view/pure
