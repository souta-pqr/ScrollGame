import React from 'react';
import styled, { keyframes } from 'styled-components';

interface EnemyProps {
  position: { x: number; y: number };
}

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const EnemySprite = styled.div<EnemyProps>`
  width: 40px;
  height: 40px;
  background-color: #ff0000;
  position: absolute;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;
  border-radius: 20px;
  animation: ${float} 2s ease-in-out infinite;
`;

const Enemy: React.FC<EnemyProps> = ({ position }) => {
  return <EnemySprite className="enemy" position={position} />;
};

export default Enemy;