import React from 'react';
import styled from 'styled-components';

const BackgroundContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background: linear-gradient(to bottom, #87CEEB, #E0F6FF);
`;

const Ground = styled.div`
  width: 100%;
  height: 50px;
  position: absolute;
  bottom: 0;
  background-color: #8B4513;
`;

const Background: React.FC = () => {
  return (
    <BackgroundContainer>
      <Ground />
    </BackgroundContainer>
  );
};

export default Background;