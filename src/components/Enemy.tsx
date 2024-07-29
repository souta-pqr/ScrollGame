import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const EnemySprite = styled.div<{ position: { x: number; y: number } }>`
  width: 40px;
  height: 40px;
  background-color: #ff0000;
  position: absolute;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;
  border-radius: 20px;
`;

const Enemy: React.FC = () => {
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 90 });

  useEffect(() => {
    const moveEnemy = setInterval(() => {
      setPosition(prev => ({
        x: prev.x - 2,
        y: window.innerHeight - 90,
      }));
    }, 50);

    return () => clearInterval(moveEnemy);
  }, []);

  return <EnemySprite className="enemy" position={position} />;
};

export default Enemy;