import assistInstance from './blocknative';
import Config from '../config/';
import game from '../abi/City.json';

let web3;
let gameContractInstance;

export async function getWeb3() {
  if (!web3) {
    let state = await assistInstance.getState();
    web3 = state.web3Instance;
  }
  return web3;
}

export function getGameContractInstance() {
  if (!web3) {
    return;
  }
  if (!gameContractInstance) {
    let gameContract = web3.eth.contract(game.abi);
    gameContractInstance = gameContract.at(Config.gameContractAddr);
  }
  return gameContractInstance;
}
