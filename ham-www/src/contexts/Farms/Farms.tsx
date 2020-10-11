
import React, {useCallback, useEffect, useState} from 'react'
import { Contract } from 'web3-eth-contract'

import { ham as hamAddress } from '../../constants/tokenAddresses'
import useHam from '../../hooks/useHam'
import { getPoolContracts } from '../../hamUtils'

import Context from './context'
import { Farm } from './types'

import HAM_LEND_Icon from '../../assets/svg/HAM_LEND_Icon.svg'
import HAM_BZRX_Icon from '../../assets/svg/HAM_BZRX_Icon.svg'
import HAM_LINK_Icon from '../../assets/svg/HAM_LINK_Icon.svg'
import HAM_SNX_Icon from '../../assets/svg/HAM_SNX_Icon.svg'
import HAM_WETH_Icon from '../../assets/svg/HAM_WETH_Icon.svg'
import HAM_YYCRV_Icon from '../../assets/svg/HAM_YYCRV_Icon.svg'
import HAM_YFI_Icon from '../../assets/svg/HAM_YFI_Icon.svg'
import Eth from '../../assets/svg/Eth.svg'

const NAME_FOR_POOL: { [key: string]: string } = {
  yfi_pool: 'Waifu Rough Cuts',
  eth_pool: 'Bacon Wrapped ETH',
  link_pool: 'Sausage Links',
  lend_pool: 'Lend Larder',
  snx_pool: 'Spartan Smokery',
  bzrx_pool: 'Bzx Butchers',
  yycrv_pool: 'Curved Chops',
  eth_ham_bpt_pool: 'Ham/ETH LP',
  ham_yycrv_bpt_pool: 'The HAMburgery',
}

const ICON_FOR_POOL: { [key: string]: JSX.Element} = {
  yfi_pool: <img src={HAM_YFI_Icon} height="64"/>,
  eth_pool: <img src={HAM_WETH_Icon} height="64"/>,
  link_pool:<img src={HAM_LINK_Icon} height="64"/>,
  lend_pool: <img src={HAM_LEND_Icon}height="64"/>,
  snx_pool: <img src={HAM_SNX_Icon} height="64"/>,
  bzrx_pool: <img src={HAM_BZRX_Icon} height="64"/>,
  yycrv_pool: <img src={HAM_YYCRV_Icon} height="64"/>,
  ham_yycrv_bpt_pool: <img src={HAM_YYCRV_Icon} height="64"/>,
  eth_ham_bpt_pool: <img src={Eth} height="64"/>,

}

const ADDRESS_FOR_POOL: { [key: string]: string} = {
  yfi_pool: 'https://etherscan.io/token/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  eth_pool: 'https://etherscan.io/token/0x49488350b4b2ed2fd164dd0d50b00e7e3f531651',
  link_pool: 'https://etherscan.io/token/0x514910771af9ca656af840dff83e8264ecf986ca',
  lend_pool: 'https://etherscan.io/token/0x80fB784B7eD66730e8b1DBd9820aFD29931aab03',
  snx_pool: 'https://etherscan.io/token/0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
  bzrx_pool: 'https://etherscan.io/token/0x49488350b4b2ed2fd164dd0d50b00e7e3f531651',
  yycrv_pool: 'https://etherscan.io/token/0x49488350b4b2ed2fd164dd0d50b00e7e3f531651',
  ham_yycrv_bpt_pool: 'https://etherscan.io/token/0x49488350b4b2ed2fd164dd0d50b00e7e3f531651',
  eth_ham_bpt_pool: 'https://etherscan.io/token/0x49488350b4b2ed2fd164dd0d50b00e7e3f531651',

}

const SORT_FOR_POOL: { [key: string]: number } = {
  yfi_pool: 0,
  eth_pool: 1,
  snx_pool: 6,
  yycrv_pool: 3,
  link_pool: 4,
  lend_pool: 5,
  bzrx_pool: 2,
  eth_ham_bpt_pool: 7,
  ham_yycrv_bpt_pool: 8,
}

const Farms: React.FC = ({ children }) => {
  const [farms, setFarms] = useState<Farm[]>([])
  const ham = useHam()

  const fetchPools = useCallback(async () => {
    const pools: { [key: string]: Contract} = await getPoolContracts(ham)

    const farmsArr: Farm[] = []
    const poolKeys = Object.keys(pools)

    for (let i = 0; i < poolKeys.length; i++) {
      const poolKey = poolKeys[i]
      const pool = pools[poolKey]
      let tokenKey = poolKey.replace('_pool', '')
      if (tokenKey === 'eth') {
        tokenKey = 'weth'
      }

      const method = pool.methods[tokenKey]
      try {
        let tokenAddress = ''
        if (method) {
          tokenAddress = await method().call()
        }
        farmsArr.push({
          contract: pool,
          name: NAME_FOR_POOL[poolKey],
          depositToken: tokenKey,
          depositTokenAddress: tokenAddress,
          earnToken: 'ham',
          earnTokenAddress: hamAddress,
          icon: ICON_FOR_POOL[poolKey],
          contractAddress: ADDRESS_FOR_POOL[poolKey],
          id: tokenKey,
          sort: SORT_FOR_POOL[poolKey]
        })
      } catch (e) {
        console.log(tokenKey)
        console.log(e)
      }
    }
    farmsArr.sort((a, b) => a.sort < b.sort ? 1 : -1)
    setFarms(farmsArr)
  }, [ham, setFarms])

  useEffect(() => {
    if (ham) {
      fetchPools()
    }
  }, [ham, fetchPools])

  return (
    <Context.Provider value={{ farms }}>
      {children}
    </Context.Provider>
  )
}

export default Farms
