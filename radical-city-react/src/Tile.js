import React, { Component } from 'react';
import styled from 'styled-components';
import Bid from './modals/Bid';

const Rhombus = styled.div`
  width: 100%;
  height: 100%;
  background: purple;
`

const types = {
  INDUSTRIAL: 'industrial',
  RESIDENTIAL: 'residental',
  COMMERCIAL: 'commerical'
};

class Tile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      ownerAddr: '0xBEEF',
      type: '',
      rent: 0,
      showModal: false
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleOpen() {
    this.setState({ showModal: true });
  }
  handleClose() {
    this.setState({ showModal: false });
  }
  render() {
    return (
      <div>
        {/* <Bid showModal={this.state.showModal} handleClose={this.handleClose} /> */}
        <button className="square" /*onClick={this.handleOpen}*/>
          {this.state.rent}
        </button>
        <Rhombus />
      </div>
    );
  }
}
export default Tile;
