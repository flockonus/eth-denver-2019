import assistInstance from './blocknative';

let web3;

export async function getWeb3() {
  if (!web3) {
    let state = await assistInstance.getState();
    web3 = state.web3Instance;
  }
  return web3;
}

export function getNetworkID(web3) {
  web3.version.getNetwork((err, netId) => {
    switch (netId) {
      case '1':
        console.log('This is mainnet');
        break;
      case '2':
        console.log('This is the deprecated Morden test network.');
        break;
      case '3':
        console.log('This is the ropsten test network.');
        break;
      case '4':
        console.log('This is the Rinkeby test network.');
        break;
      case '42':
        console.log('This is the Kovan test network.');
        break;
      default:
        console.log('This is an unknown network.');
    }
    return netId;
  });
}
