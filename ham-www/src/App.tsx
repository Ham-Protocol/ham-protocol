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
import WrappedStatusMap, { WrappedStatuses } from './wrapping'
const App: React.FC = ({ children }) => {
  
  const [theme, setTheme] = useState(localStorage.getItem('theme') || Themes.LIGHT_MODE)
  document.body.style.backgroundColor = (ThemeMap as any)[theme].color["bg"];

  const toggleTheme = () => {
    if (theme === Themes.DARK_MODE) {
      setTheme(Themes.LIGHT_MODE)
      localStorage.setItem('theme', Themes.LIGHT_MODE)
    }
    else {
      setTheme(Themes.DARK_MODE)
      localStorage.setItem('theme', Themes.DARK_MODE)
    }
    document.body.style.backgroundColor = (ThemeMap as any)[theme].color["bg"];
  }

  const [wrappedStatus, setWrappedStatus] = useState(localStorage.getItem('wrappedStatus') || WrappedStatuses.WRAPPED_ETH)
  
  const toggleWrappedStatus = ()  => {
    if (wrappedStatus === WrappedStatuses.UNWRAPPED_ETH) {
      setWrappedStatus(WrappedStatuses.WRAPPED_ETH)
      localStorage.setItem('wrappedStatus', WrappedStatuses.WRAPPED_ETH)
    }
    else {
      setWrappedStatus(WrappedStatuses.UNWRAPPED_ETH)
      localStorage.setItem('wrappedStatus', WrappedStatuses.UNWRAPPED_ETH)
    }
  }
  return (
    <ThemeProvider theme={(ThemeMap as any)[theme]}>
      <UseWalletProvider chainId={5}>
        <HamProvider>
          <TransactionProvider>
            <ModalsProvider>
              <FarmsProvider>
                <Router>
                  <Switch>
                    <Route path="/" exact>
                      <Home toggleTheme={toggleTheme} theme={theme}/>
                    </Route>
                    <Route path="/farms">
                      <Farms  toggleTheme={toggleTheme} theme={theme} toggleWrappedStatus={toggleWrappedStatus} wrappedStatus={wrappedStatus}/> 
                    </Route>
                    <Route path="/faq">
                      <FAQ toggleTheme={toggleTheme} theme={theme}/>
                    </Route>
                  </Switch>
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
