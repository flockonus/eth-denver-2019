const Config = {
  // gameContractAddr: '0xe502b756a4d471e4d60cecb8033fe7f3629d2900', // Rinkeby old
  gameContractAddr: '0xf9416fbe3bbdd5ed0d028d2fc760a92685310443',
  // gameContractAddr: '0x5d5e8569a1588726f30271ac7c5abbec97bb9c81', // SKALE
  networkId: 4,
  blockNativeAPIKey:
    process.env.BLOCK_NATIVE_API_KEY || '64825f22-6a27-454b-ae2d-c1f2fa8e6fab',
};

export default Config;
