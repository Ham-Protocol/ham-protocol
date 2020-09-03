pragma solidity ^0.5.0;

import "../lib/IERC20.sol";
import "../lib/SafeERC20.sol";
import "../token/HAMTokenInterface.sol";
import '../lib/IUniswapV2Pair.sol';
import '../lib/UniswapV2Library.sol';

interface FarmPool {
    function withdrawTax() external;
}

interface HamToken {
    function transfer(address to, uint256 value) external returns(bool);
    function transferFrom(address from, address to, uint256 value) external returns(bool);
    function balanceOf(address who) external view returns(uint256);
}

interface IUniswapV2Router01 {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
    external
    returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
    external
    returns (uint[] memory amounts);

    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
}

contract HAMTaxCollector {
    address public uniFactory;
    address public uniRouter;
    address public weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    HamToken public hamToken;
    address public beneficiary;
    address[] public farmsToTax;

    event TaxesCollected(uint256 amountIn, uint256 amountOut);

    constructor(
        address uniFactory_,
        address uniRouter_,
        address hamToken_,
        address beneficiary_,
        address[] memory farms
    )
        public
    {
        uniFactory = uniFactory_;
        uniRouter = uniRouter_;
        hamToken = HamToken(hamToken_);
        beneficiary = beneficiary_;
        farmsToTax = farms;
    }

    function addFarm(address farm) external {
        require(farm != address(0), "!nonzero");
        farmsToTax.push(farm);
    }

    function collectTaxes() external {
        for (uint256 i = 0; i < farmsToTax.length; i++) {
            FarmPool(farmsToTax[i]).withdrawTax();
        }
        address uniswap_pair = UniswapV2Library.pairFor(uniFactory, weth, address(hamToken));
        UniswapPair pair = UniswapPair(uniswap_pair);
        (uint256 reserves1, uint256 reserves2, ) = pair.getReserves();
        uint256 balance = hamToken.balanceOf(address(this));
        uint256 amountOut = IUniswapV2Router01(uniRouter).getAmountOut(balance, reserves1, reserves2);
        address[] memory path = new address[](2);
        path[0] = address(hamToken);
        path[1] = weth;
        uint256[] memory amounts = IUniswapV2Router01(uniRouter).swapTokensForExactETH(balance, amountOut, path, beneficiary, block.timestamp);
        emit TaxesCollected(amounts[0], amounts[1]);
    }
}
