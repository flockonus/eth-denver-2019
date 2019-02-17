import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Tile from "./Tile";
import JoinMatch from "./modals/JoinMatch";
import { createGridModel } from "./utils/grid";

import "./board.css";

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matchID: "",
      showModal: false,
      grid: createGridModel(4),
      selectedTile: null,
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.tileWasClicked = this.tileWasClicked.bind(this);
  }
  handleOpen() {
    console.log("opening...");
    this.setState({ showModal: true });
  }
  handleClose() {
    console.log("closing...");
    this.setState({ showModal: false });
  }
  createGrid() {
    const table = [];
    for (let y = 0; y < 4; y++) {
      table.push(this.createRow(y))
    }
    // debugger
    return (<div>{table}</div>);
  }
  createRow(y) {
    const row = []
    for (let x=0; x < 4; x++) {
      const tile = this.state.grid[`${x}-${y}`];
      row.push(
        <div
          className="square"
          key={`cell${x}-${y}`}
          web3={this.props.web3}
          onClick={() => this.tileWasClicked(tile)}
        >
          <div className={`building zone-${tile.zone}`}>
            {tile.price}
          </div>
        </div>
      );
    }
    return (<div className="board-row" key={`row-${y}`}>{row}</div>);
  }
  tileWasClicked(tile) {
    console.log('tileWasClicked', tile);
    // this.state.selectedTile = tile;
    this.setState({
      selectedTile: tile,
    });
  }
  render() {
    console.log('re render Board');
    return (
      <div>
        {this.createGrid()}
        <JoinMatch
          showModal={this.state.showModal}
          handleClose={this.handleClose}
        />
        <Button variant="primary" onClick={this.handleOpen}>
          Join a match
        </Button>
        <div className="TileDetails">
          
        </div>
      </div>
    );
  }
}
export default Board;
