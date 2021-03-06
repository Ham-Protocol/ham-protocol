import React, { useMemo, useEffect, useState } from 'react'
import styled from 'styled-components'

import { useParams } from 'react-router-dom'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'

import useFarm from '../../hooks/useFarm'
import useRedeem from '../../hooks/useRedeem'
import { getContract } from '../../utils/erc20'

import Harvest from './components/Harvest'
import Stake from './components/Stake'


import WrappedStatusToggle from '../../wrapping/WrappedStatusToggle'
import StepProgressBar from '../../components/StepProgressBar'
        
interface FarmProps {
  toggleWrappedStatus: () => void
  wrappedStatus: string
}

const Farm: React.FC<FarmProps> = ({wrappedStatus, toggleWrappedStatus}) => {

  const { farmId } = useParams()
  const {
    contract,
    depositToken,
    depositTokenAddress,
    earnToken,
    name,
    icon,
    contractAddress,

  } = useFarm(farmId) || {
    depositToken: '',
    depositTokenAddress: '',
    earnToken: '',
    name: '',
    icon: '',
    contractAddress:''
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

  const { ethereum } = useWallet()

  const tokenContract = useMemo(() => {
    return getContract(ethereum as provider, depositTokenAddress)
  }, [ethereum, depositTokenAddress])

  const { onRedeem } = useRedeem(contract)

  const depositTokenName = useMemo(() => {
    return depositToken.toUpperCase()
  }, [depositToken])

  const earnTokenName = useMemo(() => {
    return earnToken.toUpperCase()
  }, [earnToken])

  let [percent, changePercent] = useState(0)

  return (
    <>
      
      {depositTokenName === 'WETH' ?
        <PageHeader
        icon={icon}
        subtitle={`Deposit ${depositTokenName} or ETH and earn ${earnTokenName}`}
        title={name}
      />  : null }
      {depositTokenName === 'ETH' ?
        <PageHeader
        icon={icon}
        subtitle={`Deposit ${depositTokenName} or WETH and earn ${earnTokenName}`}
        title={name}
      />  : null }
      {depositTokenName !== 'WETH' &&  depositTokenName!=='ETH' ?
        <PageHeader
        icon={icon}
        subtitle={`Deposit ${depositTokenName} and earn ${earnTokenName}`}
        title={name}
      />  : null }
      
      <StyledFarm>
        { depositTokenName === 'WETH' || depositTokenName === 'ETH'  ?
          <WrappedStatusToggle toggleWrappedStatus={toggleWrappedStatus} wrappedStatus={wrappedStatus} /> : null }
        { depositTokenName === 'ETH_HAM_BPT' ?
          <StepProgressBar percent={percent} /> : null }
        { /*
          // Input to test realtime update of progress bar
          <input type="number" id="quantity" name="quantity" min="0" max="100" onChange={event => changePercent(parseInt(event.target.value))}></input>
        */ }
        <Spacer size="lg" />
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <Harvest poolContract={contract} />
          </StyledCardWrapper>
          <Spacer />
          <StyledCardWrapper>
            <Stake
              poolContract={contract}
              tokenContract={tokenContract}
              tokenName={depositToken.toUpperCase()}
            />
          </StyledCardWrapper>
        </StyledCardsWrapper>
        <Spacer size="lg" />
        <div>
          <Button
            onClick={onRedeem}
            text="Harvest & Withdraw"
          />
        </div>
        <Spacer size="lg" />
      </StyledFarm>
      <StyledLink href={contractAddress} >View contract on etherscan </StyledLink>
    </>
  )
}

const StyledFarm = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`

const StyledCardsWrapper = styled.div`
  display: flex;
  width: 600px;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 80%;
  }
`
const StyledLink = styled.a`
  font-size: 20px;
  color: ${props => props.theme.color["textRegular"]};
  padding-left: ${props => props.theme.spacing[3]}px;
  padding-right: ${props => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${props => props.theme.color["textHighlight"]};
  }
`
export default Farm
