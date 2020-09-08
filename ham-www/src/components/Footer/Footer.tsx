import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'

import HAM_Farm_Layer_001 from '../../assets/svg/HAM_Farm_Layer_001.svg'
import HAM_Farm_Layer_002 from '../../assets/svg/HAM_Farm_Layer_002.svg'

import Nav from './components/Nav'

const Footer: React.FC = () => {
  return (
    <StyledFooter>
      <StyledFooterInner>
        <Nav />
      </StyledFooterInner>
    </StyledFooter>
  )
}

const StyledFooter = styled.footer`
  align-items: center;
  display: flex;
  justify-content: center;
  position: relative;
`
const StyledFooterInner = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  height: ${props => props.theme.topBarSize}px;
  width: 100%;
`

const HAMFarmLayer001 = styled.div`
  background-image: url('${HAM_Farm_Layer_001}');
  height: 119.5px;
  width: 143px;
`
const HAMFarmLayer002 = styled.div`
  background-image: url('${HAM_Farm_Layer_002}');
  height: 201px;
  width: 1147px;
`

export default Footer