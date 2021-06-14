const MessageList = artifacts.require("./MessageList.sol");

module.exports = function(deployer) {
  deployer.deploy(MessageList);
};