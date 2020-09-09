import React from 'react'
import styled from 'styled-components'

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

export default Footer