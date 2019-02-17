const HDWalletProvider = require('truffle-hdwallet-provider');

// Private key (as exported from MetaMask)
const PRIV = process.env.PRIV;

// a provider, such as infura or alchemy (once they solved it)
const WEB3_URL = process.env.WEB3_URL;

// The creator, and initial CEO / COO
const FROM_ADDRESS = process.env.FROM_ADDRESS;

module.exports = {
  networks: {
    // https://www.rinkeby.io/
    // https://blog.abuiles.com/blog/2017/07/09/deploying-truffle-contracts-to-rinkeby/
    rinkeby: {
      provider: () => new HDWalletProvider(PRIV, WEB3_URL),
      network_id: 4,
      from: FROM_ADDRESS,
      gas: 5000000, // 5M gas limit used for deploy
      gasPrice: 10000000000, // 10gwei
    },
  },
  mocha: {
    bail: false,
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
};
