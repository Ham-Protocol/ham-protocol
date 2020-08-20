import React from 'react'
import styled from 'styled-components'

import Footer from '../Footer'
import TopBar from '../TopBar'

interface PageProps {
  toggleTheme: () => void
  theme: string
  children: React.ReactNode | Element[]
}

const Page: React.FC<PageProps> = ({ theme, toggleTheme, children }) => (
  <StyledPage>
    <TopBar toggleTheme={toggleTheme} theme={theme} />
    <StyledMain>
      {children}
    </StyledMain>
    <Footer />
  </StyledPage>
)

const StyledPage = styled.div``

const StyledMain = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${props => props.theme.topBarSize * 2}px);
`

export default Page