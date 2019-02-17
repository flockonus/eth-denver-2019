import React from 'react';
import styled from 'styled-components';
import Building from './Building';

const Rhombus = styled.button`
  width: 100px;
  height: 100px;
  background: #351788;
  border: 0.5px solid #4c27a4;
  outline: none;
  cursor: pointer;

  &:active {
    outline: none !important;
    border: none !important;
  }

  &:hover {
    background: #5a2eb4;
  }
`;

const Unrotator = styled.div`
  pointer-events: none;
  transform: rotateZ(45deg);
`;

const Unsquisher = styled.div`
  transform: scaleY(2);
`;

const Tile = ({ id, tile }) => (
  <Rhombus id={id}>
    <Unrotator>
      <Unsquisher>
        <Building type={tile.zone} />
      </Unsquisher>
    </Unrotator>
  </Rhombus>
);

export default Tile;
