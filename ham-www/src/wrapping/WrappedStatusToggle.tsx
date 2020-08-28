import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import ReactTooltip from 'react-tooltip'

import { WrappedStatus, WrappedStatuses } from '.'

import { ReactComponent as EthLogo } from '../assets/svg/Eth.svg'
import { ReactComponent as WrappedEthLogo } from '../assets/svg/WrappedEth.svg'

interface WrappedStatusToggleProps {
  toggleWrappedStatus: () => void
  wrappedStatus: string
}

const WrappedStatusToggle: React.FC<WrappedStatusToggleProps> = ({ wrappedStatus, toggleWrappedStatus }) => {
  const isWrapped = wrappedStatus === WrappedStatuses.WRAPPED_ETH
  const { color, spacing, gradient } = useContext(ThemeContext)

  let buttonColor: string = color[500]
  let boxShadow: string = `4px 4px 8px ${color[300]}, -8px -8px 16px ${color[100]}FF;`
  let buttonSize: number = 72
  let buttonPadding: number = 10
  let fontSize: number = 20
  let toggleGradient: string = gradient

  return (
    <StyledWrappedStatusToggle
      wrappedEth={isWrapped}
      wrappedStatus={wrappedStatus}
      onClick={toggleWrappedStatus}
      boxShadow={boxShadow}
      color={buttonColor}
      fontSize={fontSize}
      toggleGradient={toggleGradient}
      padding={buttonPadding}
      size={buttonSize}>
      <WrappedEthLogo data-tip="Change to ETH"/>
      <EthLogo data-tip="Change to WETH" />
      <ReactTooltip />
    </StyledWrappedStatusToggle>
  )
}

interface StyledWrappedStatusToggleProps {
  wrappedEth: boolean,
  wrappedStatus: string,
  boxShadow: string,
  color: string,
  fontSize: number,
  toggleGradient: string,
  padding: number,
  size: number
}

const StyledWrappedStatusToggle = styled.button<StyledWrappedStatusToggleProps>`
  align-items: center;
  background: ${props => props.theme.color['card']};
  border: 0;
  border-radius: 12px;
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
  transition: all 0.25s linear;

  svg {
    height: auto;
    padding: 4px 4px 4px 4px;
    width: 4rem;
    transition: all 0.25s linear;
    
    // Wrapped icon.
    &:first-child {
      transform: ${({ wrappedEth }) => wrappedEth ? 'translateY(0)' : 'translateY(200px)'};
    }
    
    // Unwrapped icon.
    &:nth-child(2) {
      transform: ${({ wrappedEth }) => wrappedEth ? 'translateY(-200px)' : 'translateY(0)'};
    }
  }
`;

export default WrappedStatusToggle
