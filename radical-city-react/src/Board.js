import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Tile from "./Tile";
import JoinMatch from "./modals/JoinMatch";

import "./board.css";

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matchID: "",
      showModal: false
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }
  handleOpen() {
    console.log("opening...");
    this.setState({ showModal: true });
  }
  handleClose() {
    console.log("closing...");
    this.setState({ showModal: false });
  }
  render() {
    return (
      <div>
        <h1> Radical Cities </h1>
        <div className="board-row">
          <Tile />
          <Tile />
          <Tile />
          <Tile />
        </div>
        <div className="board-row">
          <Tile />
          <Tile />
          <Tile />
          <Tile />
        </div>
        <div className="board-row">
          <Tile />
          <Tile />
          <Tile />
          <Tile />
        </div>
        <div className="board-row">
          <Tile />
          <Tile />
          <Tile />
          <Tile />
        </div>
        <JoinMatch
          showModal={this.state.showModal}
          handleClose={this.handleClose}
        />
        <Button variant="primary" onClick={this.handleOpen}>
          Join a match
        </Button>
      </div>
    );
  }
}
export default Board;
