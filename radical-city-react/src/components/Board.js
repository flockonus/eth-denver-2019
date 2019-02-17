import React from 'react';
import styled from 'styled-components';
import Tile from './Tile';

const Squisher = styled.div`
  transform: scaleY(0.5);
  margin: auto;
`;

const Rotator = styled.div`
  display: grid;
  grid-template: repeat(4, 100px) / repeat(4, 100px);
  grid-auto-flow: row;
  transform: rotateZ(-45deg);
  margin: auto;
  width: 400px;
  height: 400px;
`;

const Board = ({ tiles }) => (
  <Squisher>
    <Rotator>
      {tiles.map((tile, index) => (
        <Tile tile={tile} key={index} id={index} />
      ))}
    </Rotator>
  </Squisher>
);

export default Board;
