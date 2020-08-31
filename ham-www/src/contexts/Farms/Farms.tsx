
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
import  HAM_YFI_Icon from '../../assets/svg/HAM_YFI_Icon.svg'

const NAME_FOR_POOL: { [key: string]: string } = {
  yfi_pool: 'Waifu Rough Cuts',
  eth_pool: 'Bacon Wrapped ETH',
  yycrv_pool: 'The HAMburgery',
  link_pool: 'Sausage Links',
  lend_pool: 'Lend Larder',
  snx_pool: 'Spartan Smokery',
  bzrx_pool: 'Bzx Butchers',
}

const ICON_FOR_POOL: { [key: string]: JSX.Element} = {
  yfi_pool: <img src={HAM_YFI_Icon} height="64"></img>,
  eth_pool: <img src={HAM_WETH_Icon} height="64"></img>,
  link_pool:<img src={HAM_LINK_Icon} height="64"></img>,
  lend_pool: <img src={HAM_LEND_Icon}height="64"></img>,
  snx_pool: <img src={HAM_SNX_Icon} height="64"></img>,
  bzrx_pool: <img src={HAM_BZRX_Icon} height="64"></img>,
  yycrv_pool: <img src={HAM_YYCRV_Icon} height="64"></img>,
}

const SORT_FOR_POOL: { [key: string]: number } = {
  yfi_pool: 0,
  eth_pool: 1,
  snx_pool: 2, //changed to snx to fit the rest of the code (cf: distribution and deployment tests)
  yycrv_pool: 3,
  link_pool: 4,
  lend_pool: 5,
  bzrx_pool: 6,//swapped mkr for bzrx
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
      } else if (tokenKey === 'ampl') {
        tokenKey = 'ampl_eth_uni_lp' //I have kept this just in case.
      } else if (tokenKey === 'yycrv') {
        tokenKey = 'yycrv_ham_uni_lp'
      } else if (tokenKey === 'eth'){
        tokenKey = 'eth_ham_uni_lp'
      }

      const method = pool.methods[tokenKey]
      try {
        let tokenAddress = ''
        if (method) {
          tokenAddress = await method().call()
        } else if (tokenKey === 'yycrv_ham_uni_lp') {
          tokenAddress = '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8'
        }
        farmsArr.push({
          contract: pool,
          name: NAME_FOR_POOL[poolKey],
          depositToken: tokenKey,
          depositTokenAddress: tokenAddress,
          earnToken: 'ham',
          earnTokenAddress: hamAddress,
          icon: ICON_FOR_POOL[poolKey],
          id: tokenKey,
          sort: SORT_FOR_POOL[poolKey]
        })
      } catch (e) {
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
