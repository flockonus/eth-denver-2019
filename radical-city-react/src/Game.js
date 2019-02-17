import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import JoinMatch from "./modals/JoinMatch";
import { createGridModel } from "./utils/grid";
import { getWeb3, getGameContractInstance } from "./utils/web3";
import Board from "./components/Board";

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matchID: "",
      showModal: false,
      grid: createGridModel(4),
      selectedTile: null,
      // helps to position theselected tile
      lastClickPos: null,
      round: 0
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.tileWasClicked = this.tileWasClicked.bind(this);
  }
  async componentDidMount() {
    this.web3 = await getWeb3();
    this.contractInstance = getGameContractInstance();
    const events = this.contractInstance.allEvents("latest");
    events.watch((err, event) => {
      console.log("new event received: ", event.name);
      if (event.name === "PlotSet") {
        const { round, owner, x, y, zone } = event.returnValues;
        const grid = Object.assign({}, this.state.grid);
        grid[`${x}-${y}`] = {
          owner,
          zone
        };
        this.setState({ grid, round });
      } else if (event.name === "NewRound") {
      }
    });
  }
  handleOpen() {
    console.log("opening...");
    this.setState({ showModal: true });
  }
  handleClose() {
    console.log("closing...");
    this.setState({ showModal: false });
  }
  tileWasClicked(tile, ev) {
    console.log("tile was clicked", tile);
    this.setState({
      selectedTile: tile,
      lastClickPos: {
        x: ev.screenX,
        y: ev.screenY
      }
    });
  }
  // display tile details pop-over
  tileDetails(tile) {
    if (tile === null) return;
    const ctx = this;
    const lastClick = this.state.lastClickPos || {};
    const pos = {
      left: `${lastClick.x - 100}px`,
      top: `${lastClick.y - 220}px`
    };
    function close() {
      this.setState({
        selectedTile: null,
        lastClickPos: null
      });
    }
    // TODO confirm this multiplier
    let bid = Math.ceil((tile.price + 1) * 1.2);
    function onBidChange(ev) {
      console.log('onBidChange', ev.target.value);
    }
    async function sendBid() {
      console.log('sendBid', bid);
      // function bid(uint gameId, uint8 x, uint8 y, uint8 zone, uint32 price) external {
      const tx = await ctx.contractInstance.bid(
        1,
        tile.x,
        tile.y,
        tile.zone,
        bid
      )
      console.log('tx', tx);
      
    }
    return (
      <div className="TileDetails" style={pos}>
        <div className="close-btn" onClick={close.bind(this)}>
          X
        </div>
        <div>zone: {tile.zone}</div>
        <div>owner: {tile.owner}</div>
        <div>price: {tile.price}</div>
        <div>
          <input type="text" name="bidVal" value={bid} onChange={(ev) => onBidChange(ev)}></input>
          <button onClick={() => sendBid()}>BID</button>
        </div>
      </div>
    );
  }
  render() {
    const { grid } = this.state;
    const tiles = Object.values(grid);
    return (
      <div className="grid-container">
        <label>ROUND {this.state.round}</label>
        <Board tiles={tiles} tileClicked={this.tileWasClicked} />
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
export default Game;
