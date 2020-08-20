import React, { useCallback, useState, useMemo } from 'react'

import Button from '../Button'
import CardIcon from '../CardIcon'
import Modal, { ModalProps } from '..//Modal'
import ModalActions from '..//ModalActions'
import ModalTitle from '..//ModalTitle'

interface DisclaimerModal extends ModalProps {
  onConfirm: () => void
}

const DisclaimerModal: React.FC<DisclaimerModal> = ({ onConfirm, onDismiss }) => {

  const [step, setStep] = useState('disclaimer')

  const handleConfirm = useCallback(() => {
    onConfirm()
    onDismiss()
  }, [onConfirm, onDismiss])

  const modalContent = useMemo(() => {
    if (step === 'disclaimer') {
      return (
        <div>
          <p>Audits: Soon.</p>
          <p>Hello and welcome to an early concept version of the Ham farming website. We thank you for your participation in building this wonderful project and we hope that you have been enjoying working with us so far.</p>
          <p>Please go ahead and take a look at the pages in their current state, if you have any suggestions to make feel free to press the working discord link on the webpage and come chat with us.</p>
        </div>
      )
    } else {
      return (
        <div>
          <p>Attention HAM Uniswap LPs</p>
          <p>The only Uniswap pool that is compatible with HAM is HAM/yCRV (Curve yPool tokens)</p>
          <p>Providing liquidity for other Uniswap pools is dangerous</p>
          <p>You will LOSE your share of rebases</p>
        </div>
      )
    }
  }, [step])

  const button = useMemo(() => {
    if (step === 'disclaimer') {
      return (
        <Button text="Next" variant="secondary" onClick={() => setStep('uniswap')} />
      )
    } else {
      return (
        <Button text="I understand" onClick={handleConfirm} />
      )
    }
  }, [setStep, step, handleConfirm])

  return (
    <Modal>
      <ModalTitle text={`Building Together`} />
      <CardIcon>🤝</CardIcon>
      {modalContent}
      <ModalActions>
        {button}
      </ModalActions>
    </Modal>
  )
}


export default DisclaimerModal