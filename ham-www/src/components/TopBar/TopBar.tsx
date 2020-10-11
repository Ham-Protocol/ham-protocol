import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'

import Container from '../Container'
import Logo from '../Logo'

import AccountButton from './components/AccountButton'
import Nav from './components/Nav'
import TxButton from './components/TxButton'
import ThemeToggle from './components/ThemeToggle'

interface TopBarProps {
  toggleTheme: () => void
  theme: string
}

const TopBar: React.FC<TopBarProps> = ({ theme, toggleTheme }) => {
  return (
    <StyledTopBar>
      <Container size="lg">
        <StyledTopBarInner>
          <div style={{ flex: 1 }}>
            <Logo />
          </div>
          <Nav />
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <ThemeToggle toggleTheme={toggleTheme} theme={theme}/>
            <AccountButton />
          </div>
        </StyledTopBarInner>
      </Container>
    </StyledTopBar>
  )
}

const StyledTopBar = styled.div`
`

const StyledTopBarInner = styled.div`
  align-items: center;
  display: flex;
  height: ${props => props.theme.topBarSize}px;
  justify-content: space-between;
  width: 100%;
`

export default TopBar