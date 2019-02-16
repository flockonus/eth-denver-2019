import React, {Component} from 'react';

class Ethereum extends Component {
  render() {
    const {isConnected, network, blockNumber} = this.props;
    return (
      <div>
        <h2>Is connected?:</h2>
        <br /> {isConnected ? 'Connected to local node' : 'Not Connected'}
        <br />
        <br />
        <h2> network: </h2>
        <br /> {network === '4' ? 'Rinkeby' : 'wrong network'}
        <br />
        <br />
        <h2>Node block number:</h2>
        <br /> {blockNumber}
      </div>
    );
  }
}
export default Ethereum;
