import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import Player from './Player';
import Enemy from './Enemy';
import Background from './Background';
import Obstacle from './Obstacle';

const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 18px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;

const Game: React.FC = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: window.innerHeight - 100 });
  const [playerVelocity, setPlayerVelocity] = useState({ x: 0, y: 0 });
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [obstacles] = useState([
    { x: window.innerWidth * 0.3, y: window.innerHeight - 80, width: 30, height: 30 },
    { x: window.innerWidth * 0.6, y: window.innerHeight - 80, width: 30, height: 30 },
  ]);
  const [holes] = useState([
    { x: window.innerWidth * 0.45, y: window.innerHeight - 10, width: 100, height: 10 },
    { x: window.innerWidth * 0.75, y: window.innerHeight - 10, width: 100, height: 10 },
  ]);
  const [isJumping, setIsJumping] = useState(false);
  const [isInvulnerable, setIsInvulnerable] = useState(false);
  
  const lastCollisionTime = useRef(0);

  const resetGame = useCallback(() => {
    setPlayerPosition({ x: 50, y: window.innerHeight - 100 });
    setPlayerVelocity({ x: 0, y: 0 });
    setLives(3);
    setGameOver(false);
    setGameWon(false);
    setIsJumping(false);
    setIsInvulnerable(false);
    lastCollisionTime.current = 0;
  }, []);

  const handleCollision = useCallback(() => {
    const currentTime = Date.now();
    if (!isInvulnerable && currentTime - lastCollisionTime.current > 1000) {
      setLives(prev => Math.max(prev - 1, 0));
      setPlayerPosition({ x: 50, y: window.innerHeight - 100 });
      setPlayerVelocity({ x: 0, y: 0 });
      setIsJumping(false);
      setIsInvulnerable(true);
      lastCollisionTime.current = currentTime;
      setTimeout(() => setIsInvulnerable(false), 1000);
    }
  }, [isInvulnerable]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setPlayerVelocity(prev => ({ ...prev, x: 5 }));
      } else if (e.key === 'ArrowLeft') {
        setPlayerVelocity(prev => ({ ...prev, x: -5 }));
      } else if (e.key === ' ' && !isJumping) {
        setIsJumping(true);
        setPlayerVelocity(prev => ({ ...prev, y: -15 }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        setPlayerVelocity(prev => ({ ...prev, x: 0 }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isJumping]);

  useEffect(() => {
    const gravity = 0.8;

    const gameLoop = setInterval(() => {
      setPlayerPosition(prev => {
        let newX = prev.x + playerVelocity.x;
        let newY = prev.y + playerVelocity.y;

        // Apply gravity
        setPlayerVelocity(prevVel => ({ ...prevVel, y: prevVel.y + gravity }));

        // Ground collision
        if (newY > window.innerHeight - 100) {
          newY = window.innerHeight - 100;
          setPlayerVelocity(prevVel => ({ ...prevVel, y: 0 }));
          setIsJumping(false);
        }

        // Wall collisions
        if (newX < 0) newX = 0;
        if (newX > window.innerWidth - 50) newX = window.innerWidth - 50;

        // Check obstacle collisions
        let collision = false;
        for (let obstacle of obstacles) {
          if (
            newX < obstacle.x + obstacle.width &&
            newX + 50 > obstacle.x &&
            newY < obstacle.y + obstacle.height &&
            newY + 50 > obstacle.y
          ) {
            collision = true;
            break;
          }
        }

        // Check hole collisions
        for (let hole of holes) {
          if (
            newX < hole.x + hole.width &&
            newX + 50 > hole.x &&
            newY + 50 >= hole.y
          ) {
            collision = true;
            break;
          }
        }

        // Check enemy collision
        const enemy = document.querySelector('.enemy') as HTMLElement;
        if (enemy) {
          const enemyRect = enemy.getBoundingClientRect();
          if (
            newX < enemyRect.right &&
            newX + 50 > enemyRect.left &&
            newY < enemyRect.bottom &&
            newY + 50 > enemyRect.top
          ) {
            collision = true;
          }
        }

        if (collision) {
          handleCollision();
          return prev; // Don't update position if collision occurred
        }

        return { x: newX, y: newY };
      });

      if (lives === 0) {
        setGameOver(true);
        clearInterval(gameLoop);
      }
      if (playerPosition.x >= window.innerWidth - 50) {
        setGameWon(true);
        clearInterval(gameLoop);
      }
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [lives, playerPosition, playerVelocity, obstacles, holes, handleCollision]);

  return (
    <GameContainer>
      <Background />
      <Player position={playerPosition} isInvulnerable={isInvulnerable} />
      {obstacles.map((obstacle, index) => (
        <Obstacle 
          key={index} 
          position={{ x: obstacle.x, y: obstacle.y }}
          width={obstacle.width}
          height={obstacle.height}
        />
      ))}
      {holes.map((hole, index) => (
        <div key={index} style={{
          position: 'absolute',
          left: hole.x,
          top: hole.y,
          width: hole.width,
          height: hole.height,
          backgroundColor: 'black'
        }} />
      ))}
      <Enemy />
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'white' }}>Lives: {lives}</div>
      {(gameOver || gameWon) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '24px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div>{gameOver ? 'Game Over!' : 'You Win!'}</div>
          <Button onClick={resetGame}>Play Again</Button>
        </div>
      )}
    </GameContainer>
  );
};

export default Game;