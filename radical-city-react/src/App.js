import React, {Component} from 'react';
import {getWeb3} from './utils/web3';
import Ethereum from './Ethereum';
import Board from './Board';

const web3 = getWeb3();
const filter = web3.eth.filter('latest');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      network: -1,
      blockNumber: 0,
        timer: 0,
    };
    this.web3 = web3;
  }

  componentDidMount() {
    if (this.web3 && this.web3.isConnected()) {
      this.setState({isConnected: true});
    }
    this.web3.version.getNetwork((err, netId) => {
      this.setState({network: netId});
    });
    filter.watch((error, result) => {
      web3.eth.getBlock(result, true, (error, block) => {
        this.setState({blockNumber: block.number});
      });
    });
  }
  render() {
    return (
      // <Ethereum
      // isConnected={this.state.isConnected}
      // network={this.state.network}
      // blockNumber={this.state.blockNumber}
      // />
      <Board web3={this.state.web3} />
    );
  }
}
export default App;
