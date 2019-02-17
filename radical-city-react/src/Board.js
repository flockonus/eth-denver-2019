import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import Tile from './Tile';
import JoinMatch from './modals/JoinMatch';
import {createGridModel} from './utils/grid';
import {getWeb3, getGameContractInstance} from './utils/web3';

import './board.css';

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matchID: '',
      showModal: false,
      grid: createGridModel(4),
      selectedTile: null,
      // helps to position theselected tile
      lastClickPos: null,
      blockNumber: 0,
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.tileWasClicked = this.tileWasClicked.bind(this);
  }
  async componentDidMount() {
    this.web3 = await getWeb3();
    this.web3.eth.filter('latest', (error, result) => {
      this.setState({blocknumber: result});
    });
    this.contractInstance = getGameContractInstance();
    var events = this.contractInstance.allEvents('latest');
    events.watch(function(error, result) {
      console.log('event caught: ', result.event);
      console.log('full event: ', result);
    });
  }
  handleOpen() {
    console.log('opening...');
    this.setState({showModal: true});
  }
  handleClose() {
    console.log('closing...');
    this.setState({showModal: false});
  }
  createGrid() {
    const table = [];
    for (let y = 0; y < 4; y++) {
      table.push(this.createRow(y));
    }
    // debugger
    return <div>{table}</div>;
  }
  createRow(y) {
    const row = [];
    for (let x = 0; x < 4; x++) {
      const tile = this.state.grid[`${x}-${y}`];
      row.push(
        <div
          className="square"
          key={`cell${x}-${y}`}
          web3={this.props.web3}
          onClick={ev => this.tileWasClicked(tile, ev)}>
          <div className={`building zone-${tile.zone}`}>{tile.price}</div>
        </div>,
      );
    }
    return (
      <div className="board-row" key={`row-${y}`}>
        {row}
      </div>
    );
  }
  tileWasClicked(tile, ev) {
    ev.preventDefault();

    console.log('tile was clicked', tile);
    console.log(ev.clientX, ev.clientY);
    console.log(ev.screenX, ev.screenY);

    // this.state.selectedTile = tile;
    this.setState({
      selectedTile: tile,
      lastClickPos: {
        x: ev.screenX,
        y: ev.screenY,
      },
    });
  }
  tileDetails(tile) {
    if (tile === null) return;
    const lastClick = this.state.lastClickPos || {};
    const pos = {
      left: `${lastClick.x - 100}px`,
      top: `${lastClick.y - 220}px`,
    };
    function close() {
      this.setState({
        selectedTile: null,
        lastClickPos: null,
      });
    }
    return (
      <div className="TileDetails" style={pos}>
        <div className="close-btn" onClick={close.bind(this)}>
          X
        </div>
        <div>zone: {tile.zone}</div>
        <div>owner: {tile.owner}</div>
        <div>price: {tile.price}</div>
      </div>
    );
  }
  render() {
    return (
      <div className="grid-container">
        <label> Block number: {this.state.blockNumber} </label>
        {this.createGrid()}
        <JoinMatch
          showModal={this.state.showModal}
          handleClose={this.handleClose}
        />
        <Button variant="primary" onClick={this.handleOpen}>
          Join a match
        </Button>
        {this.tileDetails(this.state.selectedTile)}
      </div>
    );
  }
}
export default Board;
