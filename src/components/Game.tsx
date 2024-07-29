import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import Player from './Player';
import Enemy from './Enemy';
import Background from './Background';
import Obstacle from './Obstacle';
import { Heart, Star, Clock } from 'lucide-react';

const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const HUD = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
  font-size: 24px;
  animation: ${fadeIn} 0.5s ease-in;
  z-index: 1000;
`;

const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 5px;
  background-color: #4CAF50;
  transition: width 0.3s ease;
  z-index: 1000;
`;

const MessageOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  font-size: 24px;
  animation: ${fadeIn} 0.5s ease-in;
  z-index: 1000;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 18px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background-color: #45a049;
  }
`;

const ParallaxLayer = styled.div<{ speed: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${props => 10 - props.speed};
  transition: transform 0.1s linear;
`;

const Grass = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background-color: #4CAF50;
`;

const Flower = styled.div`
  position: absolute;
  bottom: 20px;
  width: 20px;
  height: 20px;
  background-color: #FF69B4;
  border-radius: 50%;
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 2px;
    height: 15px;
    background-color: #228B22;
    transform: translateX(-50%);
  }
`;

const Tree = styled.div`
  position: absolute;
  bottom: 20px;
  width: 40px;
  height: 80px;
  background-color: #8B4513;
  &::before {
    content: '';
    position: absolute;
    top: -40px;
    left: -30px;
    width: 100px;
    height: 80px;
    background-color: #228B22;
    border-radius: 50%;
  }
`;

const Rock = styled.div`
  position: absolute;
  bottom: 20px;
  width: 40px;
  height: 30px;
  background-color: #808080;
  border-radius: 50% 50% 20% 20%;
`;

const Game: React.FC = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: window.innerHeight - 100 });
  const [playerVelocity, setPlayerVelocity] = useState({ x: 0, y: 0 });
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
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
  const [message, setMessage] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'over' | 'won'>('playing');
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [firstStart, setFirstStart] = useState(true);
  
  const lastCollisionTime = useRef(0);

  // 新しい装飾要素の状態
  const [flowers] = useState([
    { x: window.innerWidth * 0.1, y: 0 },
    { x: window.innerWidth * 0.4, y: 0 },
    { x: window.innerWidth * 0.7, y: 0 },
    { x: window.innerWidth * 0.9, y: 0 },
  ]);
  const [trees] = useState([
    { x: window.innerWidth * 0.2, y: 0 },
    { x: window.innerWidth * 0.5, y: 0 },
    { x: window.innerWidth * 0.8, y: 0 },
  ]);
  const [rocks] = useState([
    { x: window.innerWidth * 0.15, y: 0 },
    { x: window.innerWidth * 0.55, y: 0 },
    { x: window.innerWidth * 0.85, y: 0 },
  ]);

  const resetGame = useCallback(() => {
    setPlayerPosition({ x: 50, y: window.innerHeight - 100 });
    setPlayerVelocity({ x: 0, y: 0 });
    setLives(3);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setIsJumping(false);
    setIsInvulnerable(false);
    setGameState('playing');
    setStartTime(Date.now());
    setElapsedTime(0);
    lastCollisionTime.current = 0;
    setGameStarted(true);
  }, []);

  const handleCollision = useCallback(() => {
    const currentTime = Date.now();
    if (!isInvulnerable && currentTime - lastCollisionTime.current > 1000) {
      setLives(prev => {
        const newLives = Math.max(prev - 1, 0);
        if (newLives === 0) {
          setGameState('over');
          setGameOver(true);
        }
        return newLives;
      });
      setScore(prev => Math.max(prev - 50, 0));
      setPlayerPosition({ x: 50, y: window.innerHeight - 100 });
      setPlayerVelocity({ x: 0, y: 0 });
      setIsJumping(false);
      setIsInvulnerable(true);
      lastCollisionTime.current = currentTime;
      setTimeout(() => setIsInvulnerable(false), 1000);
      setMessage('Ouch! -50 points');
      setTimeout(() => setMessage(''), 1000);
    }
  }, [isInvulnerable]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowRight') {
        setPlayerVelocity(prev => ({ ...prev, x: 5 }));
      } else if (e.key === 'ArrowLeft') {
        setPlayerVelocity(prev => ({ ...prev, x: -5 }));
      } else if (e.key === ' ' && !isJumping) {
        setIsJumping(true);
        setPlayerVelocity(prev => ({ ...prev, y: -20 }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
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
  }, [isJumping, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gravity = 0.8;
    const gameLoop = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));

      setPlayerPosition(prev => {
        let newX = prev.x + playerVelocity.x;
        let newY = prev.y + playerVelocity.y;

        setPlayerVelocity(prevVel => ({ ...prevVel, y: prevVel.y + gravity }));

        if (newY > window.innerHeight - 100) {
          newY = window.innerHeight - 100;
          setPlayerVelocity(prevVel => ({ ...prevVel, y: 0 }));
          setIsJumping(false);
        }

        if (newX < 0) newX = 0;
        if (newX > window.innerWidth - 50) {
          newX = window.innerWidth - 50;
          setGameState('won');
          setGameWon(true);
        }

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
          return prev;
        }

        setScore(prev => prev + 1);

        return { x: newX, y: newY };
      });

    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [lives, playerPosition, playerVelocity, obstacles, holes, handleCollision, gameState, startTime]);

  const startGame = () => {
    setGameStarted(true);
    setFirstStart(false);
    setStartTime(Date.now());
    setGameState('playing');
  };

  const progress = (playerPosition.x / (window.innerWidth - 50)) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <GameContainer>
      <Background />
      {gameStarted && (
        <>
          <ParallaxLayer speed={1} style={{ transform: `translateX(-${playerPosition.x * 0.1}px)` }}>
            {trees.map((tree, index) => (
              <Tree key={index} style={{ left: tree.x }} />
            ))}
          </ParallaxLayer>
          <ParallaxLayer speed={2} style={{ transform: `translateX(-${playerPosition.x * 0.2}px)` }}>
            {rocks.map((rock, index) => (
              <Rock key={index} style={{ left: rock.x }} />
            ))}
          </ParallaxLayer>
          <ParallaxLayer speed={3} style={{ transform: `translateX(-${playerPosition.x * 0.3}px)` }}>
            {flowers.map((flower, index) => (
              <Flower key={index} style={{ left: flower.x }} />
            ))}
          </ParallaxLayer>
          <Grass />
          <ProgressBar style={{ width: `${progress}%` }} />
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
          <HUD>
            <div>{Array(lives).fill(0).map((_, i) => <Heart key={i} color="red" fill="red" />)}</div>
            <div><Star /> {score}</div>
            <div><Clock /> {formatTime(elapsedTime)}</div>
          </HUD>
          </>
      )}
      {message && <MessageOverlay>{message}</MessageOverlay>}
      {!gameStarted && firstStart && (
        <MessageOverlay>
          <div>Welcome to the Game!</div>
          <div>Jump over the red obstacles to avoid losing points.</div>
          <div>Use arrow keys to move and space to jump.</div>
          <Button onClick={startGame}>Start Game</Button>
        </MessageOverlay>
      )}
      {(gameOver || gameWon) && (
        <MessageOverlay>
          <div>{gameOver ? 'Game Over!' : 'You Win!'}</div>
          <div>Final Score: {score}</div>
          <div>Time: {formatTime(elapsedTime)}</div>
          <Button onClick={resetGame}>Play Again</Button>
        </MessageOverlay>
      )}
    </GameContainer>
  );
};

export default Game;