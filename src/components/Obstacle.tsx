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
  background-color: #FF0000; // 赤色に変更
  position: absolute;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;
  border: 2px solid #8B0000; // 暗い赤色のボーダーを追加
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.5); // 赤色のグローエフェクトを追加
`;

const Obstacle: React.FC<ObstacleProps> = ({ position, width, height }) => {
  return <ObstacleSprite position={position} width={width} height={height} />;
};

export default Obstacle;