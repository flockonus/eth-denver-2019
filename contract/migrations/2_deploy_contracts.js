const City = artifacts.require('City');

module.exports = function(deployer) {
  deployer.deploy(City);
};
