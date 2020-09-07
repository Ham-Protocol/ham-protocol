// ============ Contracts ============

// List of tokens for farming.
let tokens = [
  "ETH",
  "AMPL",
  "YFI",
  "LINK",
  "MKR",
  "LEND",
  "COMP",
  "SNX",
]

let amountsPerPool = {
  "ETH": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
  "AMPL": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
  "YFI": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
  "LINK": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
  "MKR": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
  "LEND": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
  "COMP": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
  "SNX": web3.utils.toBN(250000).mul(web3.utils.toBN(10**18)),
}

let contractName = (name) => `HAM${name}Pool`

// Protocol
// deployed second
const HAMImplementation = artifacts.require("HAMDelegate");
const HAMProxy = artifacts.require("HAMDelegator");

// deployed third
const HAMReserves = artifacts.require("HAMReserves");
const HAMRebaser = artifacts.require("HAMRebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");

// Deployed fourth.
let contractArtifacts = tokens.map((tokenName) => artifacts.require(contractName(tokenName)))

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    // deployTestContracts(deployer, network),
    deployDistribution(deployer, network, accounts),
    // deploySecondLayer(deployer, network)
  ]);
}

module.exports = migration;

// ============ Deploy Functions ============


async function deployDistribution(deployer, network, accounts) {
  console.log(network)
  let ham = await HAMProxy.deployed();
  let yReserves = await HAMReserves.deployed()
  let yRebaser = await HAMRebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  if (network != "test") {
    for (let i = 0; i < contractArtifacts.length; i++) {
      await deployer.deploy(contractArtifacts[i], ham.address);
    }


    let poolContracts = {}
    for (let i = 0; i < contractArtifacts.length; i++) {
      poolContracts[tokens[i]] = new web3.eth.Contract(contractArtifacts[i].abi, contractArtifacts[i].address)
    }

    console.log("setting distributor");
    for (let i = 0; i < tokens.length; i++) {
      await poolContracts[tokens[i]].methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000})
    }

    let two_fifty = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(250));
    let one_five = two_fifty.mul(web3.utils.toBN(6));

    console.log("transfering");
    console.log("eth");
    for (let i = 0; i < tokens.length; i++) {
      await ham.transfer(contractArtifacts[i].address, amountsPerPool[tokens[i]].toString())
    }

    console.log("notifying");
    for (let i = 0; i < tokens.length; i++) {
      await poolContracts[tokens[i]].methods.notifyRewardAmount(amountsPerPool[tokens[i]].toString()).send({from:accounts[0]})
    }

    console.log("setting distribution");
    // Set reward distribution to timelock.
    for (let i = 0; i < tokens.length; i++) {
      await poolContracts[tokens[i]].methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000})
    }

    // Set ownership to timelock.
    for (let i = 0; i < tokens.length; i++) {
      await poolContracts[tokens[i]].methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000})
    }
  }

  await Promise.all([
    ham._setPendingGov(Timelock.address),
    yReserves._setPendingGov(Timelock.address),
    yRebaser._setPendingGov(Timelock.address),
  ]);

  await Promise.all([
      tl.executeTransaction(
        HAMProxy.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        HAMReserves.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        HAMRebaser.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),
  ]);
  await tl.setPendingAdmin(Gov.address);
  await gov.__acceptAdmin();
  await gov.__abdicate();
}
