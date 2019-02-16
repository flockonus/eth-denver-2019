import React, {Component} from 'react';

const types = {
  INDUSTRIAL: 'industrial',
  RESIDENTIAL: 'residental',
  COMMERCIAL: 'commerical',
};

class Tile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      ownerAddr: '0xBEEF',
      type: '',
      rent: 0,
    };
  }
  onClick() {
    return;
  }
  render() {
    return (
      <div>
        <button className="square" onClick={this.props.onClick}>
          {this.state.rent}
        </button>
      </div>
    );
  }
}
export default Tile;
