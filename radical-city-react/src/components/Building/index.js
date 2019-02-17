import React from 'react';
import styled from 'styled-components';
import res from './building-res.png';
import com from './building-com.png';
import ind from './building-ind.png';

const types = [
  undefined,
  res,
  com,
  ind
];

const Building = styled.div`
  background: url(${({ type }) => types[type]}) no-repeat;
  background-size: 88px;
  width: 100px;
  height: 200px;
  margin-top: -71px;
  margin-left: 20px;
  pointer-events: none;
`;

export default Building;
