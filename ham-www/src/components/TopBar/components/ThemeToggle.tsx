import React, { useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'

import { Themes } from '../../../theme'

interface ThemeToggleProps {
  toggleTheme: () => void
  theme: string
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  const isLight = theme === Themes.LIGHT_MODE
  const { color, spacing } = useContext(ThemeContext)

  let buttonColor: string = color.primary.main
  let boxShadow: string = `4px 4px 8px ${color.grey[300]}, -8px -8px 16px ${color.grey[100]}FF;`
  let buttonSize: number = 36
  let buttonPadding: number = spacing[3]
  let fontSize: number = 20

  return (
    <StyledThemeToggle
      lightTheme={isLight}
      theme={theme}
      onClick={toggleTheme}
      boxShadow={boxShadow}
      color={buttonColor}
      fontSize={fontSize}
      padding={buttonPadding}
      size={buttonSize}>
      <span>🌞</span>
      <span>🌙</span>
    </StyledThemeToggle>
  )
}

interface StyledThemeToggleProps {
  lightTheme: boolean,
  theme: string,
  boxShadow: string,
  color: string,
  disabled?: boolean,
  fontSize: number,
  padding: number,
  size: number
}

const StyledThemeToggle = styled.button<StyledThemeToggleProps>`
  background: ${({ theme }) => theme.gradient};
  border: 0;
  border-radius: 12px;
  box-shadow: ${props => props.boxShadow};
  color: ${props => !props.disabled ? props.color : `${props.color}55`};
  cursor: pointer;
  display: flex;
  font-size: ${props => props.fontSize}px;
  font-weight: 700;
  height: ${props => props.size}px;
  justify-content: center;
  margin-right: 25px;
  outline: none;
  overflow: hidden;
  padding-right: ${props => props.padding}px;
  pointer-events: ${props => !props.disabled ? undefined : 'none'};

  span {
    height: auto;
    width: 1.25rem;
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