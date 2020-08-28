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

import StepProgressBar from '../../components/StepProgressBar'

const Farm: React.FC = () => {
  const { farmId } = useParams()
  const {
    contract,
    depositToken,
    depositTokenAddress,
    earnToken,
    name,
    icon,
  } = useFarm(farmId) || {
    depositToken: '',
    depositTokenAddress: '',
    earnToken: '',
    name: '',
    icon: ''
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
      <PageHeader
        icon={icon}
        subtitle={`Deposit ${depositTokenName} and earn ${earnTokenName}`}
        title={name}
      />
      <StyledFarm>
        { depositTokenName === 'YCRV_HAM_UNI_LP' ? <StepProgressBar percent={percent} /> : null }
        { /*
          // Input to test realtime update of progress bar
          <input type="number" id="quantity" name="quantity" min="0" max="100" onChange={event => changePercent(parseInt(event.target.value))}></input>
        */ }
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

export default Farm
