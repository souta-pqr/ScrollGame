import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const moveCloud = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(-100%); }
`;

const moveBird = keyframes`
  0% { transform: translate(100%, 0); }
  50% { transform: translate(50%, -20px); }
  100% { transform: translate(0%, 0); }
`;

const BackgroundContainer = styled.div<{ skyColor: string }>`
  width: 100%;
  height: 100%;
  position: absolute;
  background: ${props => props.skyColor};
  overflow: hidden;
  transition: background 5s ease;
`;

const Mountain = styled.svg`
  position: absolute;
  bottom: 50px;
  width: 100%;
  height: 30%;
`;

const Cloud = styled.div`
  position: absolute;
  width: 200px;
  height: 60px;
  background: #fff;
  border-radius: 200px;
  animation: ${moveCloud} 20s linear infinite;

  &::before, &::after {
    content: '';
    position: absolute;
    background: #fff;
    width: 100px;
    height: 80px;
    position: absolute;
    top: -15px;
    left: 10px;
    border-radius: 100px;
    transform: rotate(30deg);
  }

  &::after {
    width: 120px;
    height: 120px;
    top: -55px;
    left: auto;
    right: 15px;
  }
`;

const Bird = styled.div`
  position: absolute;
  background-image: 
    radial-gradient(circle at 0 100%, transparent 7px, #000 8px),
    radial-gradient(circle at 100% 100%, transparent 7px, #000 8px);
  background-size: 50% 100%;
  background-repeat: no-repeat;
  background-position: left, right;
  width: 40px;
  height: 20px;
  animation: ${moveBird} 10s linear infinite;
`;

const Ground = styled.div`
  width: 100%;
  height: 50px;
  position: absolute;
  bottom: 0;
  background-color: #8B4513;
`;

const Background: React.FC = () => {
  const [skyColor, setSkyColor] = useState('#87CEEB');

  useEffect(() => {
    const updateSkyColor = () => {
      const date = new Date();
      const hours = date.getHours();
      let color;

      if (hours >= 5 && hours < 8) {
        color = '#FFB6C1'; // Dawn
      } else if (hours >= 8 && hours < 16) {
        color = '#87CEEB'; // Day
      } else if (hours >= 16 && hours < 19) {
        color = '#FFA500'; // Dusk
      } else {
        color = '#191970'; // Night
      }

      setSkyColor(color);
    };

    updateSkyColor();
    const interval = setInterval(updateSkyColor, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <BackgroundContainer skyColor={skyColor}>
      <Mountain viewBox="0 0 1000 300">
        <path d="M0 300L250 50L500 250L750 150L1000 300Z" fill="#4B0082" />
        <path d="M0 300L350 100L700 250L1000 300Z" fill="#8B4513" opacity="0.7" />
      </Mountain>
      <Cloud style={{ top: '10%', animationDuration: '30s' }} />
      <Cloud style={{ top: '20%', right: '0', animationDuration: '25s', animationDelay: '-15s' }} />
      <Bird style={{ top: '15%', animationDuration: '15s' }} />
      <Bird style={{ top: '25%', right: '10%', animationDuration: '20s', animationDelay: '-10s' }} />
      <Ground />
    </BackgroundContainer>
  );
};

export default Background;