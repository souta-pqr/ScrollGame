import React from 'react';
import styled from 'styled-components';

interface EnemyProps {
  position: { x: number; y: number };
}

const EnemySprite = styled.div<EnemyProps>`
  width: 40px;
  height: 40px;
  background-color: #ff0000;
  position: absolute;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;
  border-radius: 20px;
`;

const Enemy: React.FC<EnemyProps> = ({ position }) => {
  return <EnemySprite className="enemy" position={position} />;
};

export default Enemy;