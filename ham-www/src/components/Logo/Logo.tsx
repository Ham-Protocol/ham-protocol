import React from 'react'
import styled from 'styled-components'

import butcher from '../../assets/img/butcher.png'

const Logo: React.FC = () => {
  return (
    <StyledLogo>
      <img src={butcher} height="32" style={{ marginTop: -4 }} />
      <StyledText>HAM Harvester</StyledText>
    </StyledLogo>
  )
}

const StyledLogo = styled.div`
  align-items: center;
  display: flex;
`

const StyledText = styled.span`
  color: ${props => props.theme.color[600]};
  font-size: 18px;
  font-weight: 700;
  margin-left: ${props => props.theme.spacing[2]}px;
`

export default Logo