import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import Player from './Player';
import Enemy from './Enemy';
import Background from './Background';
import Obstacle from './Obstacle';
import Coin from './Coin';
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
`;

const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 5px;
  background-color: #4CAF50;
  transition: width 0.3s ease;
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

const Platform = styled.div`
  position: absolute;
  background-color: #8B4513;
  width: 200px;
  height: 20px;
`;

const Game: React.FC = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: window.innerHeight - 150 });
  const [playerVelocity, setPlayerVelocity] = useState({ x: 0, y: 0 });
  const [enemyPosition, setEnemyPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isInvulnerable, setIsInvulnerable] = useState(false);
  const [message, setMessage] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'over' | 'won'>('playing');
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [firstStart, setFirstStart] = useState(true);
  const [coins, setCoins] = useState<{ x: number; y: number }[]>([]);

  const lastCollisionTime = useRef(0);
  const gameLoopRef = useRef<number | null>(null);

  const obstacles = useMemo(() => [
    { x: window.innerWidth * 0.2, y: window.innerHeight - 80, width: 30, height: 30 },
    { x: window.innerWidth * 0.6, y: window.innerHeight - 80, width: 30, height: 30 },
    { x: window.innerWidth * 0.8, y: window.innerHeight - 200, width: 30, height: 30 },
    { x: window.innerWidth * 0.3, y: window.innerHeight - 500, width: 30, height: 30 },
    { x: window.innerWidth * 0.5, y: window.innerHeight - 400, width: 30, height: 30 },
    { x: window.innerWidth * 0.7, y: window.innerHeight - 500, width: 30, height: 30 },
  ], []);

  const holes = useMemo(() => [
    { x: window.innerWidth * 0.45, y: window.innerHeight - 10, width: 100, height: 10 },
    { x: window.innerWidth * 0.75, y: window.innerHeight - 10, width: 100, height: 10 },
    { x: window.innerWidth * 0.2, y: window.innerHeight - 10, width: 100, height: 10 },
  ], []);

  const platforms = useMemo(() => [
    { x: 0, y: window.innerHeight - 150 },
    { x: window.innerWidth * 0.2, y: window.innerHeight - 250 },
    { x: window.innerWidth * 0.4, y: window.innerHeight - 350 },
    { x: window.innerWidth * 0.6, y: window.innerHeight - 300 },
    { x: window.innerWidth * 0.8, y: window.innerHeight - 400 },
    { x: window.innerWidth * 0.1, y: window.innerHeight - 500 },
    { x: window.innerWidth * 0.5, y: window.innerHeight - 550 },
    { x: window.innerWidth * 0.9, y: window.innerHeight - 600 },
    { x: window.innerWidth * 0.3, y: window.innerHeight - 650 },
    { x: window.innerWidth * 0.7, y: window.innerHeight - 700 },
  ], []);

  const resetGame = useCallback(() => {
    setPlayerPosition({ x: 50, y: window.innerHeight - 150 });
    setPlayerVelocity({ x: 0, y: 0 });
    setEnemyPosition({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
    setLives(3);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setIsJumping(false);
    setIsMoving(false);
    setIsInvulnerable(false);
    setGameState('playing');
    setStartTime(Date.now());
    setElapsedTime(0);
    lastCollisionTime.current = 0;
    setGameStarted(true);
    generateCoins();
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
      setPlayerPosition({ x: 50, y: window.innerHeight - 150 });
      setPlayerVelocity({ x: 0, y: 0 });
      setIsJumping(false);
      setIsInvulnerable(true);
      lastCollisionTime.current = currentTime;
      setTimeout(() => setIsInvulnerable(false), 1000);
      setMessage('Ouch! -50 points');
      setTimeout(() => setMessage(''), 1000);
    }
  }, [isInvulnerable]);

  const generateCoins = useCallback(() => {
    const newCoins = platforms.map(platform => ({
      x: platform.x + Math.random() * 150,
      y: platform.y - 30,
    }));
    setCoins(newCoins);
  }, [platforms]);

  const collectCoin = useCallback((index: number) => {
    setCoins(prev => prev.filter((_, i) => i !== index));
    setScore(prev => prev + 100);
    setMessage('+100 points!');
    setTimeout(() => setMessage(''), 1000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowRight') {
        setPlayerVelocity(prev => ({ ...prev, x: 5 }));
        setIsMoving(true);
      } else if (e.key === 'ArrowLeft') {
        setPlayerVelocity(prev => ({ ...prev, x: -5 }));
        setIsMoving(true);
      } else if (e.key === ' ' && !isJumping) {
        setIsJumping(true);
        setPlayerVelocity(prev => ({ ...prev, y: -15 }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        setPlayerVelocity(prev => ({ ...prev, x: 0 }));
        setIsMoving(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isJumping, gameState]);

  const updateGameState = useCallback(() => {
    if (gameState !== 'playing') return;

    const gravity = 0.5;
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

      let onPlatform = false;
      platforms.forEach(platform => {
        if (
          newX < platform.x + 200 &&
          newX + 50 > platform.x &&
          newY + 50 >= platform.y &&
          newY + 50 <= platform.y + 20 &&
          playerVelocity.y >= 0
        ) {
          newY = platform.y - 50;
          setPlayerVelocity(prevVel => ({ ...prevVel, y: 0 }));
          setIsJumping(false);
          onPlatform = true;
        }
      });

      if (!isJumping && !onPlatform && newY < window.innerHeight - 100) {
        setIsJumping(true);
      }

      if (newX < 0) newX = 0;
      if (newX > window.innerWidth - 50) {
        newX = window.innerWidth - 50;
        setGameState('won');
        setGameWon(true);
      }

      let collision = false;
      obstacles.forEach(obstacle => {
        if (
          newX < obstacle.x + obstacle.width &&
          newX + 50 > obstacle.x &&
          newY < obstacle.y + obstacle.height &&
          newY + 50 > obstacle.y
        ) {
          collision = true;
        }
      });

      holes.forEach(hole => {
        if (
          newX < hole.x + hole.width &&
          newX + 50 > hole.x &&
          newY + 50 >= hole.y
        ) {
          collision = true;
        }
      });

      if (
        newX < enemyPosition.x + 40 &&
        newX + 50 > enemyPosition.x &&
        newY < enemyPosition.y + 40 &&
        newY + 50 > enemyPosition.y
      ) {
        collision = true;
      }

      if (collision) {
        handleCollision();
        return prev;
      }

      coins.forEach((coin, index) => {
        if (
          newX < coin.x + 20 &&
          newX + 50 > coin.x &&
          newY < coin.y + 20 &&
          newY + 50 > coin.y
        ) {
          collectCoin(index);
        }
      });

      return { x: newX, y: newY };
    });

    setEnemyPosition(prev => ({
      x: prev.x - 2,
      y: prev.y + Math.sin(Date.now() / 500) * 2
    }));

    if (enemyPosition.x < -40) {
      setEnemyPosition({
        x: window.innerWidth,
        y: Math.random() * (window.innerHeight - 200) + 100
      });
    }

    gameLoopRef.current = requestAnimationFrame(updateGameState);
  }, [gameState, playerVelocity, obstacles, holes, enemyPosition, coins, handleCollision, collectCoin, platforms, startTime, isJumping]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(updateGameState);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, updateGameState]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setFirstStart(false);
    setStartTime(Date.now());
    setGameState('playing');
    generateCoins();
  }, [generateCoins]);

  const progress = useMemo(() => (playerPosition.x / (window.innerWidth - 50)) * 100, [playerPosition.x]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return (
    <GameContainer>
      <Background />
      {gameStarted && (
        <>
          <ProgressBar style={{ width: `${progress}%` }} />
          <Player 
            position={playerPosition} 
            isInvulnerable={isInvulnerable}
            isJumping={isJumping}
            isMoving={isMoving}
          />
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
          {platforms.map((platform, index) => (
            <Platform key={index} style={{ left: platform.x, top: platform.y }} />
          ))}
          <Enemy position={enemyPosition} />
          {coins.map((coin, index) => (
            <Coin key={index} position={coin} />
          ))}
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
          <div>Welcome to the Enhanced Platform Adventure!</div>
          <div>Navigate through wider platforms and avoid more obstacles.</div>
          <div>Use arrow keys to move and space to jump.</div>
          <div>Collect coins and reach the top for the ultimate challenge!</div>
          <Button onClick={startGame}>Start Game</Button>
        </MessageOverlay>
      )}
      {(gameOver || gameWon) && (
        <MessageOverlay>
          <div>{gameOver ? 'Game Over!' : 'Congratulations! You Win!'}</div>
          <div>Final Score: {score}</div>
          <div>Time: {formatTime(elapsedTime)}</div>
          <Button onClick={resetGame}>Play Again</Button>
        </MessageOverlay>
      )}
    </GameContainer>
  );
};

export default Game;