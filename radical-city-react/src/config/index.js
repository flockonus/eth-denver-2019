const Config = {
  // gameContractAddr: '0xe502b756a4d471e4d60cecb8033fe7f3629d2900', // Rinkeby old
  // gameContractAddr: '0xf9416fbe3bbdd5ed0d028d2fc760a92685310443', // rinkeby new
  gameContractAddr: '0x057FC007E4F1EBfe03c48DEDf4e4C090bf7a64de', // SKALE
  networkId: 4,
  blockNativeAPIKey:
    process.env.BLOCK_NATIVE_API_KEY || '64825f22-6a27-454b-ae2d-c1f2fa8e6fab',
};

export default Config;
