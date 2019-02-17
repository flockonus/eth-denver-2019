import Config from '../config';
import assist from 'bnc-assist';
import {getWeb3} from './web3';

const assistInstance = assist.init({
  dappId: Config.blockNativeAPIKey,
  networkId: Config.networkId,
});

export default assistInstance;
