pragma solidity 0.5.17;

import "../lib/IERC20.sol";
import "../lib/SafeERC20.sol";
import "../token/HAMTokenInterface.sol";

interface FarmPool {
    function withdrawTax() external;
}

interface HamToken {
    function transfer(address to, uint256 value) external returns(bool);
    function transferFrom(address from, address to, uint256 value) external returns(bool);
    function balanceOf(address who) external view returns(uint256);
}

pragma solidity >=0.6.2;

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
    HamToken public hamToken;
    address public beneficiary;
    address[] public farmsToTax;

    constructor(
        address hamToken_,
        address beneficiary_,
        address[] memory farms
    )
        public
    {
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
        hamToken.transfer(bezneficiary, hamToken.balanceOf(address(this)));
    }
}
