import React, { useCallback, useEffect, useState } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'
import { UseWalletProvider } from 'use-wallet'

import DisclaimerModal from './components/DisclaimerModal'

import FarmsProvider from './contexts/Farms'
import ModalsProvider from './contexts/Modals'
import HamProvider from './contexts/HamProvider'
import TransactionProvider from './contexts/Transactions'

import useModal from './hooks/useModal'

import FAQ from './views/FAQ'
import Farms from './views/Farms'
import Home from './views/Home'

import ThemeMap, { Themes } from './theme'

import Page from './components/Page'

const App: React.FC = ({ children }) => {
  
  const [theme, setTheme] = useState(Themes.LIGHT_MODE)

  const toggleTheme = () => {
    setTheme(theme === Themes.DARK_MODE ? Themes.LIGHT_MODE : Themes.DARK_MODE)
  }

  return (
    <ThemeProvider theme={ThemeMap[theme]}>
      <UseWalletProvider chainId={1}>
        <HamProvider>
          <TransactionProvider>
            <ModalsProvider>
              <FarmsProvider>
                <Router>
                  <Page toggleTheme={toggleTheme} theme={theme}>
                    <Switch>
                      <Route path="/" exact>
                        <Home />
                      </Route>
                      <Route path="/farms">
                        <Farms />
                      </Route>
                      <Route path="/faq">
                        <FAQ />
                      </Route>
                    </Switch>
                  </Page>
                </Router>
                <Disclaimer />
              </FarmsProvider>
            </ModalsProvider>
          </TransactionProvider>
        </HamProvider>
      </UseWalletProvider>
    </ThemeProvider>
  )
}



const StyledPage = styled.div``

const StyledMain = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${props => props.theme.topBarSize * 2}px);
`

const Disclaimer: React.FC = () => {

  const markSeen = useCallback(() => {
    localStorage.setItem('disclaimer', 'seen')
  }, [])

  const [onPresentDisclaimerModal] = useModal(<DisclaimerModal onConfirm={markSeen} />)

  useEffect(() => {
    const seenDisclaimer = localStorage.getItem('disclaimer')
    if (!seenDisclaimer) {
      onPresentDisclaimerModal()
    }
  }, [])

  return (
    <div />
  )
}

export default App
