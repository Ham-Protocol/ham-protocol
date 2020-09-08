import {
  Ham
} from "../index.js";
import * as Types from "../lib/types.js";
import {
  addressMap
} from "../lib/constants.js";
import {
  decimalToString,
  stringToDecimal
} from "../lib/Helpers.js"


export const ham = new Ham(
  "http://localhost:8545/",
  // "http://127.0.0.1:9545/",
  "1001",
  true, {
    defaultAccount: "",
    defaultConfirmations: 1,
    autoGasMultiplier: 1.5,
    testing: false,
    defaultGas: "6000000",
    defaultGasPrice: "1",
    accounts: [],
    ethereumNodeTimeout: 10000
  }
)
const oneEther = 10 ** 18;

describe("Distribution", () => {
  let snapshotId;
  let user;
  let user2;
  let yycrv_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  let weth_account = "0xf9e11762d522ea29dd78178c9baf83b7b093aacc";
  let lend_account = "0x3b08aa814bea604917418a9f0907e7fc430e742c";
  let link_account = "0xbe6977e08d4479c0a6777539ae0e8fa27be4e9d6";
  let bzrx_account = "0xf37216a8ac034d08b4663108d7532dfcb44583ed"; //bzrx replacing mkr. 
  let snx_account = "0xb696d629cd0a00560151a434f6b4478ad6c228d7";
  let yfi_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606"; //I need to know if these addresses are real accounts being used or if they are generated for the test, bzrx is using mkrs old address as it's own (please delete this comment once solved).
  beforeAll(async () => {
    const accounts = await ham.web3.eth.getAccounts();
    ham.addAccount(accounts[0]);
    user = accounts[0];
    ham.addAccount(accounts[1]);
    user2 = accounts[1];
    snapshotId = await ham.testing.snapshot();
  });

  beforeEach(async () => {
    await ham.testing.resetEVM("0x2");
  });


//All ampl classes used in pool failures and incentivizer pool has been replaced by the snx equivalent, also there are time when "uni_ampl" is used, this has been replaced but their placements are indicated by comments "UNIAmpl" or "uni-ampl".
  describe("pool failures", () => {
    test("cant join pool 1s early", async () => {
      await ham.testing.resetEVM("0x2");
      let a = await ham.web3.eth.getBlock('latest');

      let starttime = await ham.contracts.eth_pool.methods.starttime().call();

      expect(ham.toBigN(a["timestamp"]).toNumber()).toBeLessThan(ham.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);
      await ham.contracts.weth.methods.approve(ham.contracts.eth_pool.options.address, -1).send({from: user});

      await ham.testing.expectThrow(
        ham.contracts.eth_pool.methods.stake(
          ham.toBigN(200).times(ham.toBigN(10**18)).toString()
        ).send({
          from: user,
          gas: 300000
        })
      , "not start");


      a = await ham.web3.eth.getBlock('latest');

      starttime = await ham.contracts.snx_pool.methods.starttime().call();

      expect(ham.toBigN(a["timestamp"]).toNumber()).toBeLessThan(ham.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);

      await ham.contracts.UNIAmpl.methods.approve(ham.contracts.snx_pool.options.address, -1).send({from: user});

      await ham.testing.expectThrow(ham.contracts.snx_pool.methods.stake(
        "5016536322915819"
      ).send({
        from: user,
        gas: 300000
      }), "not start");
    });

    test("cant join pool 2 early", async () => {

    });

    test("cant withdraw more than deposited", async () => {
      await ham.testing.resetEVM("0x2");
      let a = await ham.web3.eth.getBlock('latest');

      await ham.contracts.weth.methods.transfer(user, ham.toBigN(2000).times(ham.toBigN(10**18)).toString()).send({
        from: weth_account
      });
      await ham.contracts.snx.methods.transfer(user, "5000000000000000").send({ //UNIAmpl
        from: snx_account //uni_ampl
      });

      let starttime = await ham.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await ham.testing.increaseTime(waittime);
      }

      await ham.contracts.weth.methods.approve(ham.contracts.eth_pool.options.address, -1).send({from: user});

      await ham.contracts.eth_pool.methods.stake(
        ham.toBigN(200).times(ham.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      });

      await ham.contracts.snx.methods.approve(ham.contracts.snx_pool.options.address, -1).send({from: user}); //UNIAmpl

      await ham.contracts.snx_pool.methods.stake(
        "5000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      await ham.testing.expectThrow(ham.contracts.snx_pool.methods.withdraw(
        "5016536322915820"
      ).send({
        from: user,
        gas: 300000
      }), "");

      await ham.testing.expectThrow(ham.contracts.eth_pool.methods.withdraw(
        ham.toBigN(201).times(ham.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      }), "");

    });
  });

  describe("incentivizer pool", () => {
    test("joining and exiting", async() => {
      await ham.testing.resetEVM("0x2");

      await ham.contracts.yycrv.methods.transfer(user, "12000000000000000000000000").send({
        from: yycrv_account
      });

      await ham.contracts.weth.methods.transfer(user, ham.toBigN(2000).times(ham.toBigN(10**18)).toString()).send({
        from: weth_account
      });

      let a = await ham.web3.eth.getBlock('latest');

      let starttime = await ham.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await ham.testing.increaseTime(waittime);
      } else {
        console.log("late entry", waittime)
      }

      await ham.contracts.weth.methods.approve(ham.contracts.eth_pool.options.address, -1).send({from: user});

      await ham.contracts.eth_pool.methods.stake(
        "2000000000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      let earned = await ham.contracts.eth_pool.methods.earned(user).call();

      let rr = await ham.contracts.eth_pool.methods.rewardRate().call();

      let rpt = await ham.contracts.eth_pool.methods.rewardPerToken().call();
      //console.log(earned, rr, rpt);
      await ham.testing.increaseTime(86400);
      // await ham.testing.mineBlock();

      earned = await ham.contracts.eth_pool.methods.earned(user).call();

      rpt = await ham.contracts.eth_pool.methods.rewardPerToken().call();

      let ysf = await ham.contracts.ham.methods.scalingFactor().call();

      console.log(earned, ysf, rpt);

      let j = await ham.contracts.eth_pool.methods.getReward().send({
        from: user,
        gas: 300000
      });

      let ham_bal = await ham.contracts.ham.methods.balanceOf(user).call()

      console.log("ham bal", ham_bal)
      // start rebasing
        //console.log("approve ham")
        await ham.contracts.ham.methods.approve(
          ham.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });
        //console.log("approve yycrv")
        await ham.contracts.yycrv.methods.approve(
          ham.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });

        let yycrv_bal = await ham.contracts.yycrv.methods.balanceOf(user).call()

        console.log("yycrv_bal bal", yycrv_bal)

        console.log("add liq/ create pool")
        await ham.contracts.uni_router.methods.addLiquidity(
          ham.contracts.ham.options.address,
          ham.contracts.yycrv.options.address,
          ham_bal,
          ham_bal,
          ham_bal,
          ham_bal,
          user,
          1596740361 + 10000000
        ).send({
          from: user,
          gas: 8000000
        });

        let pair = await ham.contracts.uni_fact.methods.getPair(
          ham.contracts.ham.options.address,
          ham.contracts.yycrv.options.address
        ).call();

        ham.contracts.uni_pair.options.address = pair;
        let bal = await ham.contracts.uni_pair.methods.balanceOf(user).call();

        await ham.contracts.uni_pair.methods.approve(
          ham.contracts.yycrv_pool.options.address,
          -1
        ).send({
          from: user,
          gas: 300000
        });

        starttime = await ham.contracts.yycrv_pool.methods.starttime().call();

        a = await ham.web3.eth.getBlock('latest');

        waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ham.testing.increaseTime(waittime);
        } else {
          console.log("late entry, pool 2", waittime) //"pool 2" is used here, the original file used ampl here instead of snx, so it must be made sure that the pool number does not need to be changed (delete comment once solved).
        }

        await ham.contracts.yycrv_pool.methods.stake(bal).send({from: user, gas: 400000});


        earned = await ham.contracts.snx_pool.methods.earned(user).call();

        rr = await ham.contracts.snx_pool.methods.rewardRate().call();

        rpt = await ham.contracts.snx_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await ham.testing.increaseTime(625000 + 1000);

        earned = await ham.contracts.snx_pool.methods.earned(user).call();

        rr = await ham.contracts.snx_pool.methods.rewardRate().call();

        rpt = await ham.contracts.snx_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await ham.contracts.yycrv_pool.methods.exit().send({from: user, gas: 400000});

        ham_bal = await ham.contracts.ham.methods.balanceOf(user).call();


        expect(ham.toBigN(ham_bal).toNumber()).toBeGreaterThan(0)
        console.log("ham bal after staking in pool 2", ham_bal); 
    });
  });

  describe("eth", () => {
    test("rewards from pool 1s eth", async () => {
        await ham.testing.resetEVM("0x2");

        await ham.contracts.weth.methods.transfer(user, ham.toBigN(2000).times(ham.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await ham.web3.eth.getBlock('latest');

        let starttime = await ham.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ham.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ham.contracts.weth.methods.approve(ham.contracts.eth_pool.options.address, -1).send({from: user});

        await ham.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ham.contracts.eth_pool.methods.earned(user).call();

        let rr = await ham.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await ham.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ham.testing.increaseTime(625000 + 100);
        // await ham.testing.mineBlock();

        earned = await ham.contracts.eth_pool.methods.earned(user).call();

        rpt = await ham.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await ham.contracts.ham.methods.scalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ham_bal = await ham.contracts.ham.methods.balanceOf(user).call()

        let j = await ham.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ham.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let ham_bal2 = await ham.contracts.ham.methods.balanceOf(user).call()

        let two_fity = ham.toBigN(250).times(ham.toBigN(10**3)).times(ham.toBigN(10**18))
        expect(ham.toBigN(ham_bal2).minus(ham.toBigN(ham_bal)).toString()).toBe(two_fity.times(1).toString())
    });
    test("rewards from pool 1s eth with rebase", async () => {
        await ham.testing.resetEVM("0x2");

        await ham.contracts.yycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: yycrv_account
        });

        await ham.contracts.weth.methods.transfer(user, ham.toBigN(2000).times(ham.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await ham.web3.eth.getBlock('latest');

        let starttime = await ham.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ham.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ham.contracts.weth.methods.approve(ham.contracts.eth_pool.options.address, -1).send({from: user});

        await ham.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ham.contracts.eth_pool.methods.earned(user).call();

        let rr = await ham.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await ham.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ham.testing.increaseTime(125000 + 100);
        // await ham.testing.mineBlock();

        earned = await ham.contracts.eth_pool.methods.earned(user).call();

        rpt = await ham.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await ham.contracts.ham.methods.scalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await ham.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let ham_bal = await ham.contracts.ham.methods.balanceOf(user).call()

        console.log("ham bal", ham_bal)
        // start rebasing
          //console.log("approve ham")
          await ham.contracts.ham.methods.approve(
            ham.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve yycrv")
          await ham.contracts.yycrv.methods.approve(
            ham.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let yycrv_bal = await ham.contracts.yycrv.methods.balanceOf(user).call()

          console.log("yycrv_bal bal", yycrv_bal)

          console.log("add liq/ create pool")
          await ham.contracts.uni_router.methods.addLiquidity(
            ham.contracts.ham.options.address,
            ham.contracts.yycrv.options.address,
            ham_bal,
            ham_bal,
            ham_bal,
            ham_bal,
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 8000000
          });

          let pair = await ham.contracts.uni_fact.methods.getPair(
            ham.contracts.ham.options.address,
            ham.contracts.yycrv.options.address
          ).call();

          ham.contracts.uni_pair.options.address = pair;
          let bal = await ham.contracts.uni_pair.methods.balanceOf(user).call();

          // make a trade to get init values in uniswap
          //console.log("init swap")
          await ham.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000000000000",
            100000,
            [
              ham.contracts.yycrv.options.address,
              ham.contracts.ham.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // trade back for easier calcs later
          //console.log("swap 0")
          await ham.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000",
            100000,
            [
              ham.contracts.yycrv.options.address,
              ham.contracts.ham.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          await ham.testing.increaseTime(43200);

          //console.log("init twap")
          await ham.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await ham.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
            100000,
            [
              ham.contracts.yycrv.options.address,
              ham.contracts.ham.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // init twap
          let init_twap = await ham.contracts.rebaser.methods.timeOfTWAPInit().call();

          // wait 12 hours
          await ham.testing.increaseTime(12 * 60 * 60);

          // perform trade to change price
          //console.log("second swap")
          await ham.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000000",
            100000,
            [
              ham.contracts.yycrv.options.address,
              ham.contracts.ham.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // activate rebasing
          await ham.contracts.rebaser.methods.activate_rebasing().send({
            from: user,
            gas: 500000
          });


          bal = await ham.contracts.ham.methods.balanceOf(user).call();

          a = await ham.web3.eth.getBlock('latest');

          let offset = await ham.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
          offset = ham.toBigN(offset).toNumber();
          let interval = await ham.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
          interval = ham.toBigN(interval).toNumber();

          let i;
          if (a["timestamp"] % interval > offset) {
            i = (interval - (a["timestamp"] % interval)) + offset;
          } else {
            i = offset - (a["timestamp"] % interval);
          }

          await ham.testing.increaseTime(i);

          let r = await ham.contracts.uni_pair.methods.getReserves().call();
          let q = await ham.contracts.uni_router.methods.quote(ham.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote pre positive rebase", q);

          let b = await ham.contracts.rebaser.methods.rebase().send({
            from: user,
            gas: 2500000
          });

          let bal1 = await ham.contracts.ham.methods.balanceOf(user).call();

          let resHAM = await ham.contracts.ham.methods.balanceOf(ham.contracts.reserves.options.address).call();

          let resyycrv = await ham.contracts.yycrv.methods.balanceOf(ham.contracts.reserves.options.address).call();

          // new balance > old balance
          expect(ham.toBigN(bal).toNumber()).toBeLessThan(ham.toBigN(bal1).toNumber());
          // increases reserves
          expect(ham.toBigN(resyycrv).toNumber()).toBeGreaterThan(0);

          r = await ham.contracts.uni_pair.methods.getReserves().call();
          q = await ham.contracts.uni_router.methods.quote(ham.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(ham.toBigN(q).toNumber()).toBeGreaterThan(ham.toBigN(10**18).toNumber());


        await ham.testing.increaseTime(525000 + 100);


        j = await ham.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await ham.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let ham_bal2 = await ham.contracts.ham.methods.balanceOf(user).call()

        let two_fity = ham.toBigN(250).times(ham.toBigN(10**3)).times(ham.toBigN(10**18))
        expect(
          ham.toBigN(ham_bal2).minus(ham.toBigN(ham_bal)).toNumber()
        ).toBeGreaterThan(two_fity.toNumber())
    });
    test("rewards from pool 1s eth with negative rebase", async () => {
        await ham.testing.resetEVM("0x2");

        await ham.contracts.yycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: yycrv_account
        });

        await ham.contracts.weth.methods.transfer(user, ham.toBigN(2000).times(ham.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await ham.web3.eth.getBlock('latest');

        let starttime = await ham.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ham.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ham.contracts.weth.methods.approve(ham.contracts.eth_pool.options.address, -1).send({from: user});

        await ham.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ham.contracts.eth_pool.methods.earned(user).call();

        let rr = await ham.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await ham.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ham.testing.increaseTime(125000 + 100);
        // await ham.testing.mineBlock();

        earned = await ham.contracts.eth_pool.methods.earned(user).call();

        rpt = await ham.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await ham.contracts.ham.methods.scalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await ham.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let ham_bal = await ham.contracts.ham.methods.balanceOf(user).call()

        console.log("ham bal", ham_bal)
        // start rebasing
          //console.log("approve ham")
          await ham.contracts.ham.methods.approve(
            ham.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve yycrv")
          await ham.contracts.yycrv.methods.approve(
            ham.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let yycrv_bal = await ham.contracts.yycrv.methods.balanceOf(user).call()

          console.log("yycrv_bal bal", yycrv_bal)

          ham_bal = ham.toBigN(ham_bal);
          console.log("add liq/ create pool")
          await ham.contracts.uni_router.methods.addLiquidity(
            ham.contracts.ham.options.address,
            ham.contracts.yycrv.options.address,
            ham_bal.times(.1).toString(),
            ham_bal.times(.1).toString(),
            ham_bal.times(.1).toString(),
            ham_bal.times(.1).toString(),
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 8000000
          });

          let pair = await ham.contracts.uni_fact.methods.getPair(
            ham.contracts.ham.options.address,
            ham.contracts.yycrv.options.address
          ).call();

          ham.contracts.uni_pair.options.address = pair;
          let bal = await ham.contracts.uni_pair.methods.balanceOf(user).call();

          // make a trade to get init values in uniswap
          //console.log("init swap")
          await ham.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
            100000,
            [
              ham.contracts.ham.options.address,
              ham.contracts.yycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // trade back for easier calcs later
          //console.log("swap 0")
          await ham.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
            100000,
            [
              ham.contracts.ham.options.address,
              ham.contracts.yycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          await ham.testing.increaseTime(43200);

          //console.log("init twap")
          await ham.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await ham.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
            100000,
            [
              ham.contracts.ham.options.address,
              ham.contracts.yycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // init twap
          let init_twap = await ham.contracts.rebaser.methods.timeOfTWAPInit().call();

          // wait 12 hours
          await ham.testing.increaseTime(12 * 60 * 60);

          // perform trade to change price
          //console.log("second swap")
          await ham.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000",
            100000,
            [
              ham.contracts.ham.options.address,
              ham.contracts.yycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // activate rebasing
          await ham.contracts.rebaser.methods.activate_rebasing().send({
            from: user,
            gas: 500000
          });


          bal = await ham.contracts.ham.methods.balanceOf(user).call();

          a = await ham.web3.eth.getBlock('latest');

          let offset = await ham.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
          offset = ham.toBigN(offset).toNumber();
          let interval = await ham.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
          interval = ham.toBigN(interval).toNumber();

          let i;
          if (a["timestamp"] % interval > offset) {
            i = (interval - (a["timestamp"] % interval)) + offset;
          } else {
            i = offset - (a["timestamp"] % interval);
          }

          await ham.testing.increaseTime(i);

          let r = await ham.contracts.uni_pair.methods.getReserves().call();
          let q = await ham.contracts.uni_router.methods.quote(ham.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote pre positive rebase", q);

          let b = await ham.contracts.rebaser.methods.rebase().send({
            from: user,
            gas: 2500000
          });

          let bal1 = await ham.contracts.ham.methods.balanceOf(user).call();

          let resHAM = await ham.contracts.ham.methods.balanceOf(ham.contracts.reserves.options.address).call();

          let resyycrv = await ham.contracts.yycrv.methods.balanceOf(ham.contracts.reserves.options.address).call();

          expect(ham.toBigN(bal1).toNumber()).toBeLessThan(ham.toBigN(bal).toNumber());
          expect(ham.toBigN(resyycrv).toNumber()).toBe(0);

          r = await ham.contracts.uni_pair.methods.getReserves().call();
          q = await ham.contracts.uni_router.methods.quote(ham.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(ham.toBigN(q).toNumber()).toBeLessThan(ham.toBigN(10**18).toNumber());


        await ham.testing.increaseTime(525000 + 100);


        j = await ham.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await ham.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let ham_bal2 = await ham.contracts.ham.methods.balanceOf(user).call()

        let two_fity = ham.toBigN(250).times(ham.toBigN(10**3)).times(ham.toBigN(10**18))
        expect(
          ham.toBigN(ham_bal2).minus(ham.toBigN(ham_bal)).toNumber()
        ).toBeLessThan(two_fity.toNumber())
    });
  });

  describe("yfi", () => {
    test("rewards from pool 1s yfi", async () => {
        await ham.testing.resetEVM("0x2");
        await ham.contracts.yfi.methods.transfer(user, "500000000000000000000").send({
          from: yfi_account
        });

        let a = await ham.web3.eth.getBlock('latest');

        let starttime = await ham.contracts.yfi_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ham.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ham.contracts.yfi.methods.approve(ham.contracts.yfi_pool.options.address, -1).send({from: user});

        await ham.contracts.yfi_pool.methods.stake(
          "500000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ham.contracts.yfi_pool.methods.earned(user).call();

        let rr = await ham.contracts.yfi_pool.methods.rewardRate().call();

        let rpt = await ham.contracts.yfi_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ham.testing.increaseTime(625000 + 100);
        // await ham.testing.mineBlock();

        earned = await ham.contracts.yfi_pool.methods.earned(user).call();

        rpt = await ham.contracts.yfi_pool.methods.rewardPerToken().call();

        let ysf = await ham.contracts.ham.methods.scalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ham_bal = await ham.contracts.ham.methods.balanceOf(user).call()

        let j = await ham.contracts.yfi_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ham.contracts.yfi.methods.balanceOf(user).call()

        expect(weth_bal).toBe("500000000000000000000")


        let ham_bal2 = await ham.contracts.ham.methods.balanceOf(user).call()

        let two_fity = ham.toBigN(250).times(ham.toBigN(10**3)).times(ham.toBigN(10**18))
        expect(ham.toBigN(ham_bal2).minus(ham.toBigN(ham_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("lend", () => {
    test("rewards from pool 1s lend", async () => {
        await ham.testing.resetEVM("0x2");
        await ham.web3.eth.sendTransaction({from: user2, to: lend_account, value : ham.toBigN(100000*10**18).toString()});

        await ham.contracts.lend.methods.transfer(user, "10000000000000000000000000").send({
          from: lend_account
        });

        let a = await ham.web3.eth.getBlock('latest');

        let starttime = await ham.contracts.lend_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ham.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ham.contracts.lend.methods.approve(ham.contracts.lend_pool.options.address, -1).send({from: user});

        await ham.contracts.lend_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ham.contracts.lend_pool.methods.earned(user).call();

        let rr = await ham.contracts.lend_pool.methods.rewardRate().call();

        let rpt = await ham.contracts.lend_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ham.testing.increaseTime(625000 + 100);
        // await ham.testing.mineBlock();

        earned = await ham.contracts.lend_pool.methods.earned(user).call();

        rpt = await ham.contracts.lend_pool.methods.rewardPerToken().call();

        let ysf = await ham.contracts.ham.methods.scalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ham_bal = await ham.contracts.ham.methods.balanceOf(user).call()

        let j = await ham.contracts.lend_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ham.contracts.lend.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let ham_bal2 = await ham.contracts.ham.methods.balanceOf(user).call()

        let two_fity = ham.toBigN(250).times(ham.toBigN(10**3)).times(ham.toBigN(10**18))
        expect(ham.toBigN(ham_bal2).minus(ham.toBigN(ham_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("link", () => {
    test("rewards from pool 1s link", async () => {
        await ham.testing.resetEVM("0x2");

        await ham.web3.eth.sendTransaction({from: user2, to: link_account, value : ham.toBigN(100000*10**18).toString()});

        await ham.contracts.link.methods.transfer(user, "10000000000000000000000000").send({
          from: link_account
        });

        let a = await ham.web3.eth.getBlock('latest');

        let starttime = await ham.contracts.link_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ham.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ham.contracts.link.methods.approve(ham.contracts.link_pool.options.address, -1).send({from: user});

        await ham.contracts.link_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ham.contracts.link_pool.methods.earned(user).call();

        let rr = await ham.contracts.link_pool.methods.rewardRate().call();

        let rpt = await ham.contracts.link_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ham.testing.increaseTime(625000 + 100);
        // await ham.testing.mineBlock();

        earned = await ham.contracts.link_pool.methods.earned(user).call();

        rpt = await ham.contracts.link_pool.methods.rewardPerToken().call();

        let ysf = await ham.contracts.ham.methods.scalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ham_bal = await ham.contracts.ham.methods.balanceOf(user).call()

        let j = await ham.contracts.link_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ham.contracts.link.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let ham_bal2 = await ham.contracts.ham.methods.balanceOf(user).call()

        let two_fity = ham.toBigN(250).times(ham.toBigN(10**3)).times(ham.toBigN(10**18))
        expect(ham.toBigN(ham_bal2).minus(ham.toBigN(ham_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("bzrx", () => {
    test("rewards from pool 1s bzrx", async () => {
        await ham.testing.resetEVM("0x2");
        await ham.web3.eth.sendTransaction({from: user2, to: bzrx_account, value : ham.toBigN(100000*10**18).toString()});
        let eth_bal = await ham.web3.eth.getBalance(bzrx_account);

        await ham.contracts.bzrx.methods.transfer(user, "10000000000000000000000").send({
          from: bzrx_account
        });

        let a = await ham.web3.eth.getBlock('latest');

        let starttime = await ham.contracts.bzrx_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ham.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ham.contracts.bzrx.methods.approve(ham.contracts.bzrx_pool.options.address, -1).send({from: user});

        await ham.contracts.bzrx_pool.methods.stake(
          "10000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ham.contracts.bzrx_pool.methods.earned(user).call();

        let rr = await ham.contracts.bzrx_pool.methods.rewardRate().call();

        let rpt = await ham.contracts.bzrx_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ham.testing.increaseTime(625000 + 100);
        // await ham.testing.mineBlock();

        earned = await ham.contracts.bzrx_pool.methods.earned(user).call();

        rpt = await ham.contracts.bzrx_pool.methods.rewardPerToken().call();

        let ysf = await ham.contracts.ham.methods.scalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ham_bal = await ham.contracts.ham.methods.balanceOf(user).call()

        let j = await ham.contracts.bzrx_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ham.contracts.bzrx.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000")


        let ham_bal2 = await ham.contracts.ham.methods.balanceOf(user).call()

        let two_fity = ham.toBigN(250).times(ham.toBigN(10**3)).times(ham.toBigN(10**18))
        expect(ham.toBigN(ham_bal2).minus(ham.toBigN(ham_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  }); //bzrx replacing mkr
  describe("yycrv", () => {
    test("rewards from pool 1s yycrv", async () => {
        await ham.testing.resetEVM("0x2");
        await ham.web3.eth.sendTransaction({from: user2, to: yycrv_account, value : ham.toBigN(100000*10**18).toString()});
        let eth_bal = await ham.web3.eth.getBalance(yycrv_account);

        await ham.contracts.yycrv.methods.transfer(user, "10000000000000000000000").send({
          from: yycrv_account
        });

        let a = await ham.web3.eth.getBlock('latest');

        let starttime = await ham.contracts.yycrv_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ham.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ham.contracts.yycrv.methods.approve(ham.contracts.yycrv_pool.options.address, -1).send({from: user});

        await ham.contracts.yycrv_pool.methods.stake(
          "10000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ham.contracts.yycrv_pool.methods.earned(user).call();

        let rr = await ham.contracts.yycrv_pool.methods.rewardRate().call();

        let rpt = await ham.contracts.yycrv_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ham.testing.increaseTime(625000 + 100);
        // await ham.testing.mineBlock();

        earned = await ham.contracts.yycrv_pool.methods.earned(user).call();

        rpt = await ham.contracts.yycrv_pool.methods.rewardPerToken().call();

        let ysf = await ham.contracts.ham.methods.scalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ham_bal = await ham.contracts.ham.methods.balanceOf(user).call()

        let j = await ham.contracts.yycrv_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ham.contracts.yycrv.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000")


        let ham_bal2 = await ham.contracts.ham.methods.balanceOf(user).call()

        let two_fity = ham.toBigN(250).times(ham.toBigN(10**3)).times(ham.toBigN(10**18))
        expect(ham.toBigN(ham_bal2).minus(ham.toBigN(ham_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("snx", () => {
    test("rewards from pool 1s snx", async () => {
        await ham.testing.resetEVM("0x2");

        await ham.web3.eth.sendTransaction({from: user2, to: snx_account, value : ham.toBigN(100000*10**18).toString()});

        let snx_bal = await ham.contracts.snx.methods.balanceOf(snx_account).call();

        console.log(snx_bal)

        await ham.contracts.snx.methods.transfer(user, snx_bal).send({
          from: snx_account
        });

        snx_bal = await ham.contracts.snx.methods.balanceOf(user).call();

        console.log(snx_bal)

        let a = await ham.web3.eth.getBlock('latest');

        let starttime = await ham.contracts.snx_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ham.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ham.contracts.snx.methods.approve(ham.contracts.snx_pool.options.address, -1).send({from: user});

        await ham.contracts.snx_pool.methods.stake(
          snx_bal
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ham.contracts.snx_pool.methods.earned(user).call();

        let rr = await ham.contracts.snx_pool.methods.rewardRate().call();

        let rpt = await ham.contracts.snx_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ham.testing.increaseTime(625000 + 100);
        // await ham.testing.mineBlock();

        earned = await ham.contracts.snx_pool.methods.earned(user).call();

        rpt = await ham.contracts.snx_pool.methods.rewardPerToken().call();

        let ysf = await ham.contracts.ham.methods.scalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ham_bal = await ham.contracts.ham.methods.balanceOf(user).call()

        let j = await ham.contracts.snx_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ham.contracts.snx.methods.balanceOf(user).call()

        expect(weth_bal).toBe(snx_bal)


        let ham_bal2 = await ham.contracts.ham.methods.balanceOf(user).call()

        let two_fity = ham.toBigN(250).times(ham.toBigN(10**3)).times(ham.toBigN(10**18))
        expect(ham.toBigN(ham_bal2).minus(ham.toBigN(ham_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });
})
