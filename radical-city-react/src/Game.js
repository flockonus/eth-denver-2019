import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import JoinMatch from "./modals/JoinMatch";
import { createGridModel } from "./utils/grid";
import { getWeb3, getGameContractInstance } from "./utils/web3";
import Board from "./components/Board";

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
      round: 0,
      time: 0
    };
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.tileWasClicked = this.tileWasClicked.bind(this);
  }

  async componentDidMount() {
    this.startTimer();

    this.web3 = await getWeb3();
    this.contractInstance = getGameContractInstance();
    this.web3.eth.filter("latest", async (error, result) => {
      console.log("new block");
      let grid = {};
      for (let y = 0; y < dim; y++) {
        for (let x = 0; x < dim; x++) {
          const plotInfo = await promisify(cb =>
            this.contractInstance.getFullPlotInfo(1, x, y, cb)
          );
          const { owner, value, zone, income, tax } = plotInfo;
          const id = `${x}-${y}`;
          console.log(`result for ${id}: ${plotInfo}`);
          grid[id] = {
            id,
            x,
            y,
            price: value,
            owner,
            zone
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
        this.resetTimer();
      }
    });
  }
  startTimer() {
    this.setState({
      isOn: true,
      time: this.state.time,
      start: Date.now() - this.state.time
    });
    this.timer = setInterval(
      () =>
        this.setState({
          time: Math.round(Date.now() - this.state.start)
        }),
      1000
    );
  }
  stopTimer() {
    this.setState({ isOn: false });
    clearInterval(this.timer);
  }
  resetTimer() {
    this.setState({ time: 0, isOn: false });
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
          onClick={ev => this.tileWasClicked(tile, ev)}
        >
          <div className={`building zone-${tile.zone}`}>{tile.price}</div>
        </div>
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

    console.log("tile was clicked", tile);
    console.log(ev.clientX, ev.clientY);
    console.log(ev.screenX, ev.screenY);

    // this.state.selectedTile = tile;
    this.setState({
      selectedTile: tile,
      lastClickPos: {
        x: ev.screenX,
        y: ev.screenY
      }
    });
  }
  tileDetails(tile) {
    if (tile === null) return;
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
    return (
      <div className="TileDetails" style={pos}>
        <div class="close-btn" onClick={close.bind(this)}>
          X
        </div>
        <div>zone: {tile.zone}</div>
        <div>owner: {tile.owner}</div>
        <div>price: {tile.price}</div>
      </div>
    );
  }
  render() {
    const { grid } = this.state;
    const tiles = Object.values(grid);
    return (
      <div className="grid-container">
        <label>ROUND {this.state.round}</label>
        <br />
        <label>TIME LEFT {this.state.time}</label>
        <Board tiles={tiles} />
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
