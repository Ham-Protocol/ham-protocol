import React, { useState } from 'react'
import styled from 'styled-components'

import { Themes } from '../../../theme'

interface ThemeToggleProps {
  toggleTheme: () => void
  theme: string
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  const isLight = theme === Themes.LIGHT_MODE

  return (
    <StyledThemeToggle lightTheme={isLight} theme={theme} onClick={toggleTheme}>
      <span>🌞</span>
      <span>🌙</span>
    </StyledThemeToggle>
  )
}

interface StyledThemeToggleProps {
  lightTheme: boolean
  theme: string
}

const StyledThemeToggle = styled.button<StyledThemeToggleProps>`
  background: ${({ theme }) => theme.gradient};
  border: 2px solid ${({ theme }) => theme.toggleBorder};
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  font-size: 0.5rem;
  justify-content: space-between;
  margin: 0 auto;
  overflow: hidden;
  padding: 0.5rem;
  position: relative;
  width: 8rem;
  height: 4rem;

  span {
    height: auto;
    width: 2.5rem;
    transition: all 0.3s linear;
    
    // sun icon
    &:first-child {
      transform: ${({ lightTheme }) => lightTheme ? 'translateY(0)' : 'translateY(100px)'};
    }
    
    // moon icon
    &:nth-child(2) {
      transform: ${({ lightTheme }) => lightTheme ? 'translateY(-100px)' : 'translateY(0)'};
    }
  }
`;

export default ThemeToggle