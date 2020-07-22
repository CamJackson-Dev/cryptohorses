 var WinnaToken = artifacts.require("./WinnaToken.sol");
 var HongKongTrack = artifacts.require("./HongKongTrack.sol");

module.exports = async function(deployer) {
  await deployer.deploy(WinnaToken);
  await deployer.deploy(HongKongTrack, WinnaToken.address);
};
