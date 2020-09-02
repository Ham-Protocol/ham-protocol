import React from 'react'
import styled from 'styled-components'

const Card: React.FC = ({ children }) => (
  <StyledCard>
    {children}
  </StyledCard>
)

const StyledCard = styled.div`
  background: ${props => props.theme.color[`card`]};
  border-radius: 16px;
  box-shadow: inset 1px 1px 0px ${props => props.theme.color["buttonHighlight"]};
  display: flex;
  flex: 1;
  flex-direction: column;
  transition: all 0.25s linear;
`

export default Card
