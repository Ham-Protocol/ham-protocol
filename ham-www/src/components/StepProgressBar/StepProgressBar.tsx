import React, { useContext, useEffect, useRef, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'

import "react-step-progress-bar/styles.css";
// @ts-ignore
import { ProgressBar, Step } from 'react-step-progress-bar'

import ReactTooltip from 'react-tooltip'

import StokedPiglet from '../../assets/svg/StokedPiglet.svg'
import SleepyPiglet from '../../assets/svg/SleepyPiglet.svg'

interface StepProgressBar {
  percent: number
}

const StepProgressBar: React.FC<StepProgressBar> = ({ percent }) => {
  const { color } = useContext(ThemeContext)
  const [activeStep, changeStep] = useState(0)

  const steps = [
    {image: SleepyPiglet, ref: useRef(null), desc: '1x'},
    {image: StokedPiglet, ref: useRef(null), desc: '30 days, 5x'},
    {image: StokedPiglet, ref: useRef(null), desc: '60 days, 10x'},
    {image: StokedPiglet, ref: useRef(null), desc: '90 days, 25x'}
  ]

  const renderStep = (step:any) => ({ accomplished, index }:{ accomplished: boolean, index: number }) => {
    if (accomplished) {
      changeStep(index)
    }
    return (
      <img
        style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
        width="30"
        src={step.image}
        data-tip={step.desc}
        ref={step.ref}
      />
    )
  }

  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current) {
      ReactTooltip.show(steps[activeStep].ref.current)
    }
  });

  return (
    <StyledProgressBarContainer>
      <StyledSubtitle>
        Current Reward Multiplier
      </StyledSubtitle>
      <ProgressBar
        percent={percent}
        filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
        width="100%"
      >
        { steps.map((step, index) => (
          <Step transition="scale">
          {renderStep(step)}
        </Step>
        ))}
      </ProgressBar>
      <ReactTooltip effect="solid" place="bottom" />
    </StyledProgressBarContainer>
  )
}

const StyledProgressBarContainer = styled.div`
  background: linear-gradient(${props => props.theme.color['card']}, ${props => props.theme.color['bg']});
  border-radius: 16px;
  width: 75%;
  margin: 0px 5px 50px 5px;
  padding: 5px 5px 25px 5px;
`

const StyledSubtitle = styled.h3`
  color: ${props => props.theme.color["textHighlight"]};
  font-size: 18px;
  font-weight: 400;
  text-align: center;
  margin: 0;
  padding-bottom: 25px;
`

export default StepProgressBar