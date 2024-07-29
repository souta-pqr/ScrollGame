import React from 'react';
import styled from 'styled-components';

interface ObstacleProps {
  position: { x: number; y: number };
  width: number;
  height: number;
}

const ObstacleSprite = styled.div<ObstacleProps>`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  background-color: #663300;
  position: absolute;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;
`;

const Obstacle: React.FC<ObstacleProps> = ({ position, width, height }) => {
  return <ObstacleSprite position={position} width={width} height={height} />;
};

export default Obstacle;