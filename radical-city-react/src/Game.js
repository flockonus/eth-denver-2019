import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import JoinMatch from "./modals/JoinMatch";
import { createGridModel } from "./utils/grid";
import { getWeb3, getGameContractInstance } from "./utils/web3";
import Board from "./components/Board";
import Countdown from "react-countdown-now";

const dim = 4;

const promisify = inner =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err);
      }

      resolve(res);
    })
  );
const renderer = ({ hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a completed state
    //TODO: fire off a async call
    return;
  } else {
    // Render a countdown
    return (
      <span>
        {hours}:{minutes}:{seconds}
      </span>
    );
  }
};
class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matchID: "",
      showModal: false,
      grid: createGridModel(dim),
      selectedTile: null,
      // helps to position theselected tile
      lastClickPos: null,
      // temp. hold the bid
      bid: {},
      round: 0,
      time: 0,
      round: 0,
    };

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.tileWasClicked = this.tileWasClicked.bind(this);
  }

  async componentDidMount() {
    this.web3 = await getWeb3();
    this.contractInstance = getGameContractInstance();
    this.web3.eth.filter("latest", async (error, result) => {
      console.log("new block");
      let grid = {};
      for (let y = 0; y < dim; y++) {
        for (let x = 0; x < dim; x++) {
          const plotInfo = await promisify(cb =>
            // returns (address owner, uint32 value, uint8 zone, uint32 income, uint32 tax) {
            this.contractInstance.getFullPlotInfo(1, x, y, cb)
          );
          const [ owner, value, zone, income, tax ] = plotInfo;
          const id = `${x}-${y}`;
          // console.log(`result for ${id}:`, plotInfo);
          grid[id] = {
            id,
            x,
            y,
            owner,
            price: value.toNumber(),
            zone: zone.toNumber(),
            income: income.toNumber(),
            tax: tax.toNumber(),
          };
        }
      }
      console.log("setting grid: ", grid);
      this.setState({ grid });
    });

    const events = this.contractInstance.allEvents({
      fromBlock: 0,
      toBlock: "latest"
    });
    events.watch(async (err, event) => {
      console.log("new event received: ", event.event);
      if (event.name === "PlotSet") {
        const { round, owner, x, y, zone } = event.returnValues;
        const grid = Object.assign({}, this.state.grid);
        grid[`${x}-${y}`] = {
          owner,
          zone
        };
        this.setState({ grid, round });
      } else if (event.name === "NewRound") {
        const { round } = event.returnValues;
        this.setState({ round });
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
      },
      bid: {},
    });
  }
  close() {
    // dismiss all variables from here
    this.setState({
      selectedTile: null,
      lastClickPos: null,
      bid: {},
    });
  }
  // display tile details pop-over
  tileDetails(tile) {
    if (tile === null) return;
    const ctx = this;
    // const tileBid = Object.assign({}, tile);
    const lastClick = this.state.lastClickPos || {};
    const pos = {
      left: `${lastClick.x - 100}px`,
      top: `${lastClick.y - 220}px`
    };
    // TODO confirm this multiplier
    if (ctx.state.bid.value === undefined) {
      ctx.state.bid.value = Math.ceil((tile.price + 1) * 1.2);
    }
    function onBidChange(ev) {
      console.log("onBidChange", ev.target.value);
      // bad practice?
      ctx.state.bid.value = parseInt(ev.target.value, 10) || '';
      ctx.setState({
        bid: ctx.state.bid,
      })
    }
    console.log('>>>', ctx.state.bid.zone);
    
    if (ctx.state.bid.zone === undefined) {
      ctx.state.bid.zone = tile.zone;
    }
    function onZoneChange(ev) {
      ctx.state.bid.zone = ev.target.value;
      // if (ev.target.value.toLowerCase() === 'i') ctx.state.bid.zone = 3; // industrial
      // else if (ev.target.value.toLowerCase() === 'c') ctx.state.bid.zone = 2; // commercial
      // else ctx.state.bid.zone = 1; // default new zone to residential
      ctx.setState({
        bid: ctx.state.bid,
      })
      console.log("onZoneChange", ctx.state.bid.zone);
    }
    async function sendBid() {
      console.log("sendBid", ctx.state.bid.value, ctx.state.bid.zone);
      const tx = await promisify(cb =>
        // function bid(uint gameId, uint8 x, uint8 y, uint8 zone, uint32 price) external {
        ctx.contractInstance.bid(
          1,
          tile.x,
          tile.y,
          ctx.state.bid.zone,
          ctx.state.bid.value,
          cb
        )
      );
      console.log('tx sent', tx);
      ctx.close();
    }
    return (
      <div className="TileDetails" style={pos}>
        <div className="close-btn" onClick={ctx.close.bind(ctx)}>
          X
        </div>
        <div>zone: {tile.zone}</div>
        <div>owner: {tile.owner}</div>
        <div>income: {tile.income}</div>
        <div>tax: {tile.tax}</div>
        <div>price: {tile.price}</div>
        <div>
          BID:<input
            size="2"
            type="number"
            placeholder="BID VALUE"
            value={ctx.state.bid.value}
            onChange={ev => onBidChange(ev)}
          />
          ZONE:<input
            size="2"
            type="number"
            placeholder="ZONE"
            value={ctx.state.bid.zone}
            onChange={ev => onZoneChange(ev)}
          />
          <button onClick={() => sendBid()}>BID</button>
        </div>
      </div>
    );
  }
  async finishBidding() {
    console.log("finishBidding");
    const tx = await promisify(cb =>
      // function finishBidding(uint8 gameId, uint8 round) public returns (bool) {
      this.contractInstance.finishBidding(
        1, // gameId
        1, // round
        cb
      )
    );
    console.log('tx sent', tx);
  }
  render() {
    const { grid } = this.state;
    const tiles = Object.values(grid);
    return (
      <div className="grid-container">
        <label>ROUND {this.state.round}</label>
        <br />
        <div>
          TIME LEFT <br />
          <Countdown date={Date.now() + 300000} renderer={renderer} />
          <br/>
          <button onClick={this.finishBidding.bind(this)}>Finish Bidding</button>
        </div>
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
