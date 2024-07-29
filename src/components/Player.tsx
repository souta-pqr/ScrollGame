import React from 'react';
import styled, { keyframes } from 'styled-components';

interface PlayerProps {
  position: { x: number; y: number };
  isInvulnerable: boolean;
}

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const PlayerSprite = styled.div<PlayerProps>`
  width: 50px;
  height: 50px;
  background-color: #ff9900;
  position: absolute;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;
  border-radius: 25px 25px 0 0;
  animation: ${props => props.isInvulnerable ? blink : 'none'} 0.5s linear infinite;
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 15px;
    width: 20px;
    height: 20px;
    background-color: #ff9900;
    border-radius: 50%;
  }
`;

const Player: React.FC<PlayerProps> = ({ position, isInvulnerable }) => {
  return <PlayerSprite position={position} isInvulnerable={isInvulnerable} />;
};

export default Player;