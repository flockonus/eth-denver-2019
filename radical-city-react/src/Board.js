import React, {Component} from 'react';
import Tile from './Tile';

import './board.css';

class Board extends Component {
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
      </div>
    );
  }
}
export default Board;
