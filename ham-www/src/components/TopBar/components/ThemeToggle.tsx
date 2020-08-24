import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'

import { Themes } from '../../../theme'

interface ThemeToggleProps {
  toggleTheme: () => void
  theme: string
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  const isLight = theme === Themes.LIGHT_MODE
  const { color, spacing, gradient } = useContext(ThemeContext)

  let buttonColor: string = color[500]
  let boxShadow: string = `4px 4px 8px ${color[300]}, -8px -8px 16px ${color[100]}FF;`
  let buttonSize: number = 36
  let buttonPadding: number = spacing[3]
  let fontSize: number = 20
  let toggleGradient: string = gradient

  return (
    <StyledThemeToggle
      lightTheme={isLight}
      theme={theme}
      onClick={toggleTheme}
      boxShadow={boxShadow}
      color={buttonColor}
      fontSize={fontSize}
      toggleGradient={toggleGradient}
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
  fontSize: number,
  toggleGradient: string,
  padding: number,
  size: number
}

const StyledThemeToggle = styled.button<StyledThemeToggleProps>`
  background: ${props => props.toggleGradient};
  border: 0;
  border-radius: 12px;
  box-shadow: ${props => props.boxShadow};
  color: ${props => props.color};
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