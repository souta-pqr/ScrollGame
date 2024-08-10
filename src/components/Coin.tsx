import React from 'react';
import styled, { keyframes } from 'styled-components';

interface CoinProps {
  position: { x: number; y: number };
}

const shine = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const rotate = keyframes`
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
  100% { transform: rotateY(360deg); }
`;

const CoinSprite = styled.div<CoinProps>`
  width: 20px;
  height: 20px;
  background-color: gold;
  position: absolute;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;
  border-radius: 50%;
  animation: ${shine} 1s ease-in-out infinite, ${rotate} 2s linear infinite;
`;

const Coin: React.FC<CoinProps> = ({ position }) => {
  return <CoinSprite position={position} />;
};

export default Coin;