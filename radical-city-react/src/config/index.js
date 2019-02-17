const Config = {
  // gameContractAddr: '0xe502b756a4d471e4d60cecb8033fe7f3629d2900', // Rinkeby old
  // gameContractAddr: '0xf9416fbe3bbdd5ed0d028d2fc760a92685310443', // rinkeby new
  // gameContractAddr: '0x45269e73Ba7E35c8E364D9a36E496Ac8eb67c166', // SKALE
  // gameContractAddr: '0x459b36Af59BC202C86A5Affa40Fc0238E157dbe1',
  gameContractAddr: '0xF67E0106cd3ed305Ae54f7b1b2A1379A8D7Eb764',
  networkId: 4,
  blockNativeAPIKey:
    process.env.BLOCK_NATIVE_API_KEY || '64825f22-6a27-454b-ae2d-c1f2fa8e6fab',
};

export default Config;
