import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'

import Nav from './components/Nav'

const Footer: React.FC = () => {
  const { color } = useContext(ThemeContext)
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
`
const StyledFooterInner = styled.div`
  background: ${props => props.theme.color['bg']};
  align-items: center;
  display: flex;
  justify-content: center;
  height: ${props => props.theme.topBarSize}px;
  width: 100%;
  transition: all 0.2s linear;
`

export default Footer