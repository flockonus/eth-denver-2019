import React, {Component} from 'react';
import {getWeb3} from './utils/web3';
import Ethereum from './Ethereum';
import Board from './Board';
import assistInstance from './utils/blocknative';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      network: -1,
      blockNumber: 0,
      timer: 0,
      web3: '',
    };
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      assistInstance
        .onboard()
        .then(async success => {
          this.web3 = await getWeb3();
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }
  render() {
    return <Board web3={this.state.web3} />;
  }
}
export default App;
