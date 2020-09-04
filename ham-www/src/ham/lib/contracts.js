import BigNumber from 'bignumber.js/bignumber';
import Web3 from 'web3';
import * as Types from "./types.js";
import { SUBTRACT_GAS_LIMIT, addressMap } from './constants.js';

import ERC20Json from '../clean_build/contracts/IERC20.json';
import HAMJson from '../clean_build/contracts/HAMDelegator.json';
import HAMRebaserJson from '../clean_build/contracts/HAMRebaser.json';
import HAMReservesJson from '../clean_build/contracts/HAMReserves.json';
import HAMGovJson from '../clean_build/contracts/GovernorAlpha.json';
import HAMTimelockJson from '../clean_build/contracts/Timelock.json';
import WETHJson from './weth.json';
import SNXJson from './snx.json';
import UNIFactJson from './unifact2.json';
import UNIPairJson from './uni2.json';
import UNIRouterJson from './uniR.json';

import WETHPoolJson from '../clean_build/contracts/HAMETHPool.json';
import YFIPoolJson from '../clean_build/contracts/HAMYFIPool.json';
import LENDPoolJson from '../clean_build/contracts/HAMLENDPool.json';
import BZRXPoolJson from '../clean_build/contracts/HAMBZRXPool.json';
import SNXPoolJson from '../clean_build/contracts/HAMSNXPool.json';
import LINKPoolJson from '../clean_build/contracts/HAMLINKPool.json';
import YYCRVPoolJson from '../clean_build/contracts/HAMYYCRVPool.json';
import HAMYYCRVBPTPoolJson from '../clean_build/contracts/HAMYYCRVBPTPool.json';
import HAMETHBPTPoolJson from '../clean_build/contracts/HAMETHBPTPool.json';

import IncJson from '../clean_build/contracts/HAMIncentivizer.json';

export class Contracts {
  constructor(
    provider,
    networkId,
    web3,
    options
  ) {
    this.web3 = web3;
    this.defaultConfirmations = options.defaultConfirmations;
    this.autoGasMultiplier = options.autoGasMultiplier || 1.5;
    this.confirmationType = options.confirmationType || Types.ConfirmationType.Confirmed;
    this.defaultGas = options.defaultGas;
    this.defaultGasPrice = options.defaultGasPrice;

    this.uni_pair = new this.web3.eth.Contract(UNIPairJson);
    this.uni_router = new this.web3.eth.Contract(UNIRouterJson);
    this.uni_fact = new this.web3.eth.Contract(UNIFactJson);
    this.ham = new this.web3.eth.Contract(HAMJson.abi);

    this.yfi = new this.web3.eth.Contract(ERC20Json.abi);
    this.yycrv = new this.web3.eth.Contract(ERC20Json.abi);
    this.eth = new this.web3.eth.Contract(ERC20Json.abi);
    this.link = new this.web3.eth.Contract(ERC20Json.abi);
    this.lend = new this.web3.eth.Contract(ERC20Json.abi);
    this.snx = new this.web3.eth.Contract(ERC20Json.abi);
    this.bzrx = new this.web3.eth.Contract(ERC20Json.abi);
    this.ham_yycrv_bpt = new this.web3.eth.Contract(ERC20Json.abi);
    this.ham_eth_bpt = new this.web3.eth.Contract(ERC20Json.abi);

    this.yfi_pool = new this.web3.eth.Contract(YFIPoolJson.abi);
    this.eth_pool = new this.web3.eth.Contract(WETHPoolJson.abi);
    this.ham_yycrv_bpt_pool = new this.web3.eth.Contract(HAMYYCRVBPTPoolJson.abi);
    this.eth_ham_bpt_pool = new this.web3.eth.Contract(HAMETHBPTPoolJson.abi);
    this.yycrv_pool = new this.web3.eth.Contract(YYCRVPoolJson.abi);
    this.link_pool = new this.web3.eth.Contract(LINKPoolJson.abi);
    this.lend_pool = new this.web3.eth.Contract(LENDPoolJson.abi);
    this.snx_pool = new this.web3.eth.Contract(SNXPoolJson.abi);
    this.bzrx_pool = new this.web3.eth.Contract(BZRXPoolJson.abi);

    this.erc20 = new this.web3.eth.Contract(ERC20Json.abi);
    this.pool = new this.web3.eth.Contract(LENDPoolJson.abi); 


    this.rebaser = new this.web3.eth.Contract(HAMRebaserJson.abi);
    this.reserves = new this.web3.eth.Contract(HAMReservesJson.abi);
    this.gov = new this.web3.eth.Contract(HAMGovJson.abi);
    this.timelock = new this.web3.eth.Contract(HAMTimelockJson.abi);
    this.weth = new this.web3.eth.Contract(WETHJson);
    this.setProvider(provider, networkId);
    this.setDefaultAccount(this.web3.eth.defaultAccount);
  }


  setProvider(
    provider,
    networkId
  ) {
    this.ham.setProvider(provider);
    this.rebaser.setProvider(provider);
    this.reserves.setProvider(provider);
    this.gov.setProvider(provider);
    this.timelock.setProvider(provider);
    const contracts = [
      { contract: this.ham, json: HAMJson },
      { contract: this.rebaser, json: HAMRebaserJson },
      { contract: this.reserves, json: HAMReservesJson },
      { contract: this.gov, json: HAMGovJson },
      { contract: this.timelock, json: HAMTimelockJson },
      { contract: this.ham_yycrv_bpt_pool, json: HAMYYCRVBPTPoolJson },
      { contract: this.eth_ham_bpt_pool, json: HAMETHBPTPoolJson },
      { contract: this.yycrv_pool, json: YYCRVPoolJson },
      { contract: this.eth_pool, json: WETHPoolJson },
      { contract: this.yfi_pool, json: YFIPoolJson },
      { contract: this.snx_pool, json: SNXPoolJson },
      { contract: this.bzrx_pool, json: BZRXPoolJson },
      { contract: this.lend_pool, json: LENDPoolJson },
      { contract: this.link_pool, json: LINKPoolJson },
    ]

    contracts.forEach(contract => this.setContractProvider(
        contract.contract,
        contract.json,
        provider,
        networkId,
      ),
    );
    this.yfi.options.address = addressMap["YFI"];
    this.yycrv.options.address = addressMap["YYCRV"];
    this.weth.options.address = addressMap["WETH"];
    this.snx.options.address = addressMap["SNX"];
    this.link.options.address = addressMap["LINK"];
    this.lend.options.address = addressMap["LEND"];
    this.bzrx.options.address = addressMap["BZRX"];
    this.uni_fact.options.address = addressMap["uniswapFactoryV2"];
    this.uni_router.options.address = addressMap["UNIRouter"];
    this.ham_yycrv_bpt.options.address = addressMap["HAMYYCRV"];
    this.ham_eth_bpt.options.address = addressMap["HAMETH"];

    this.pools = [
      {"tokenAddr": this.yfi.options.address, "poolAddr": this.yfi_pool.options.address},
      {"tokenAddr": this.snx.options.address, "poolAddr": this.snx_pool.options.address},
      {"tokenAddr": this.weth.options.address, "poolAddr": this.eth_pool.options.address},
      {"tokenAddr": this.link.options.address, "poolAddr": this.link_pool.options.address},
      {"tokenAddr": this.lend.options.address, "poolAddr": this.lend_pool.options.address},
      {"tokenAddr": this.bzrx.options.address, "poolAddr": this.bzrx_pool.options.address},
      {"tokenAddr": this.yycrv.options.address, "poolAddr": this.yycrv_pool.options.address},
      {"tokenAddr": this.ham_eth_bpt.options.address, "poolAddr": this.ham_eth_bpt.options.address},
      {"tokenAddr": this.ham_yycrv_bpt.options.address, "poolAddr": this.ham_yycrv_bpt.options.address},
    ]
  }

  setDefaultAccount(
    account
  ) {
    this.yfi.options.from = account;
    this.yycrv.options.from = account;
    this.eth.options.from = account;
    this.ham.options.from = account;
    this.weth.options.from = account;
  }

  async callContractFunction(
    method,
    options
  ) {
    const { confirmations, confirmationType, autoGasMultiplier, ...txOptions } = options;

    if (!this.blockGasLimit) {
      await this.setGasLimit();
    }

    if (!txOptions.gasPrice && this.defaultGasPrice) {
      txOptions.gasPrice = this.defaultGasPrice;
    }

    if (confirmationType === Types.ConfirmationType.Simulate || !options.gas) {
      let gasEstimate;
      if (this.defaultGas && confirmationType !== Types.ConfirmationType.Simulate) {
        txOptions.gas = this.defaultGas;
      } else {
        try {
          console.log("estimating gas");
          gasEstimate = await method.estimateGas(txOptions);
        } catch (error) {
          const data = method.encodeABI();
          const { from, value } = options;
          const to = method._parent._address;
          error.transactionData = { from, value, data, to };
          throw error;
        }

        const multiplier = autoGasMultiplier || this.autoGasMultiplier;
        const totalGas = Math.floor(gasEstimate * multiplier);
        txOptions.gas = totalGas < this.blockGasLimit ? totalGas : this.blockGasLimit;
      }

      if (confirmationType === Types.ConfirmationType.Simulate) {
        let g = txOptions.gas;
        return { gasEstimate, g };
      }
    }

    if (txOptions.value) {
      txOptions.value = new BigNumber(txOptions.value).toFixed(0);
    } else {
      txOptions.value = '0';
    }

    const promi = method.send(txOptions);

    const OUTCOMES = {
      INITIAL: 0,
      RESOLVED: 1,
      REJECTED: 2,
    };

    let hashOutcome = OUTCOMES.INITIAL;
    let confirmationOutcome = OUTCOMES.INITIAL;

    const t = confirmationType !== undefined ? confirmationType : this.confirmationType;

    if (!Object.values(Types.ConfirmationType).includes(t)) {
      throw new Error(`Invalid confirmation type: ${t}`);
    }

    let hashPromise;
    let confirmationPromise;

    if (t === Types.ConfirmationType.Hash || t === Types.ConfirmationType.Both) {
      hashPromise = new Promise(
        (resolve, reject) => {
          promi.on('error', (error) => {
            if (hashOutcome === OUTCOMES.INITIAL) {
              hashOutcome = OUTCOMES.REJECTED;
              reject(error);
              const anyPromi = promi ;
              anyPromi.off();
            }
          });

          promi.on('transactionHash', (txHash) => {
            if (hashOutcome === OUTCOMES.INITIAL) {
              hashOutcome = OUTCOMES.RESOLVED;
              resolve(txHash);
              if (t !== Types.ConfirmationType.Both) {
                const anyPromi = promi ;
                anyPromi.off();
              }
            }
          });
        },
      );
    }

    if (t === Types.ConfirmationType.Confirmed || t === Types.ConfirmationType.Both) {
      confirmationPromise = new Promise(
        (resolve, reject) => {
          promi.on('error', (error) => {
            if (
              (t === Types.ConfirmationType.Confirmed || hashOutcome === OUTCOMES.RESOLVED)
              && confirmationOutcome === OUTCOMES.INITIAL
            ) {
              confirmationOutcome = OUTCOMES.REJECTED;
              reject(error);
              const anyPromi = promi ;
              anyPromi.off();
            }
          });

          const desiredConf = confirmations || this.defaultConfirmations;
          if (desiredConf) {
            promi.on('confirmation', (confNumber, receipt) => {
              if (confNumber >= desiredConf) {
                if (confirmationOutcome === OUTCOMES.INITIAL) {
                  confirmationOutcome = OUTCOMES.RESOLVED;
                  resolve(receipt);
                  const anyPromi = promi ;
                  anyPromi.off();
                }
              }
            });
          } else {
            promi.on('receipt', (receipt) => {
              confirmationOutcome = OUTCOMES.RESOLVED;
              resolve(receipt);
              const anyPromi = promi ;
              anyPromi.off();
            });
          }
        },
      );
    }

    if (t === Types.ConfirmationType.Hash) {
      const transactionHash = await hashPromise;
      if (this.notifier) {
          this.notifier.hash(transactionHash)
      }
      return { transactionHash };
    }

    if (t === Types.ConfirmationType.Confirmed) {
      return confirmationPromise;
    }

    const transactionHash = await hashPromise;
    if (this.notifier) {
        this.notifier.hash(transactionHash)
    }
    return {
      transactionHash,
      confirmation: confirmationPromise,
    };
  }

  async callConstantContractFunction(
    method,
    options
  ) {
    const m2 = method;
    const { blockNumber, ...txOptions } = options;
    return m2.call(txOptions, blockNumber);
  }

  async setGasLimit() {
    const block = await this.web3.eth.getBlock('latest');
    this.blockGasLimit = block.gasLimit - SUBTRACT_GAS_LIMIT;
  }

  setContractProvider(
    contract,
    contractJson,
    provider,
    networkId,
  ){
    contract.setProvider(provider);
    try {
      if (contractJson.networks[networkId]) {
        contract.options.address = contractJson.networks[networkId].address;
      } else {
        contract.options.address = "0x587A07cE5c265A38Dd6d42def1566BA73eeb06F5"
      }
    } catch (error) {
      console.log(error)
    }
  }
}
