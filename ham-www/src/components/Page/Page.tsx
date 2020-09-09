import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import Footer from '../Footer'
import TopBar from '../TopBar'

import HAM_Farm_Layer_001 from '../../assets/svg/HAM_Farm_Layer_001.svg'
import HAM_Farm_Layer_002 from '../../assets/svg/HAM_Farm_Layer_002.svg'
import HAM_Farm_Layer_003 from '../../assets/svg/HAM_Farm_Layer_003_1.svg'
import HAM_Farm_Layer_004 from '../../assets/svg/HAM_Farm_Layer_004.svg'

interface PageProps {
  toggleTheme: () => void
  theme: string
  children: React.ReactNode | Element[]
}

const Page: React.FC<PageProps> = ({ theme, toggleTheme, children }) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const position = document.body.scrollHeight - window.pageYOffset - window.innerHeight
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
  <StyledPage>
    <TopBar toggleTheme={toggleTheme} theme={theme} />
    <StyledMain>
      {children}
    </StyledMain>
    <Footer />
    <ParallaxContainer>
      <HAMFarmLayer004 scrollPosition={scrollPosition} depth={0} />
      <HAMFarmLayer003 scrollPosition={scrollPosition} depth={0.5} />
      <HAMFarmLayer002 scrollPosition={scrollPosition} depth={1} />
      <HAMFarmLayer001 scrollPosition={scrollPosition} depth={1.5} />
    </ParallaxContainer>
  </StyledPage>
  )
}

interface ParallaxLayerProps {
  scrollPosition: number,
  depth: number
}

const StyledPage = styled.div``

const StyledMain = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${props => props.theme.topBarSize * 2}px);
`

const ParallaxContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 205px;
  overflow: hidden;
`

const HAMFarmLayer001 = styled.div<ParallaxLayerProps>`
  background-image: url('${HAM_Farm_Layer_001}');
  background-position: 25% 100%;
  background-size: 143px 119.5px;
  background-repeat: no-repeat;
  width: 100%;
  height: 205px;
  position: absolute;
  top: 0;
  z-index: -1;
  transform: translate3d(0, ${props => props.scrollPosition * props.depth}px, 0)
`

const HAMFarmLayer002 = styled.div<ParallaxLayerProps>`
  background-image: url('${HAM_Farm_Layer_002}');
  background-position: bottom center;
  background-size: 1147px 201px;
  background-repeat: no-repeat;
  width: 100%;
  height: 205px;
  position: absolute;
  top: 0;
  z-index: -1;
  transform: translate3d(0, ${props => props.scrollPosition * props.depth}px, 0)
`

const HAMFarmLayer003 = styled.div<ParallaxLayerProps>`
  background-image: url('${HAM_Farm_Layer_003}');
  background-position: bottom center;
  background-size: 1218px 189.5px;
  background-repeat: no-repeat;
  width: 100%;
  height: 205px;
  position: absolute;
  top: 0;
  z-index: -1;
  transform: translate3d(0, ${props => props.scrollPosition * props.depth}px, 0)
`

const HAMFarmLayer004 = styled.div<ParallaxLayerProps>`
  background-image: url('${HAM_Farm_Layer_004}');
  background-position: top center;
  background-size: auto;
  background-repeat: no-repeat;
  width: 100%;
  height: 205px;
  position: absolute;
  top: 0;
  z-index: -1;
  transform: translate3d(0, ${props => props.scrollPosition * props.depth}px, 0)
`

export default Page