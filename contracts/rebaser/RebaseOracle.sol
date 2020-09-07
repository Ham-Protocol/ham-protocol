pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import '../lib/IUniswapV2Pair.sol';
import "../lib/UniswapV2Library.sol";
import "../lib/UniswapV2OracleLibrary.sol";

contract RebaseOracle {

    uint256 constant BASE = 10**18;
    uint256 public tokenCumulativePriceLast;
    uint256 public targetCumulativePriceLast;

    address public tokenPair;
    address public targetPair;

    address public gov;
    address public rebaser;
    address public uni_factory;

    uint32 public timeOfTWAPInit;
    uint32 public tokenBlockTimestampLast;
    uint32 public targetBlockTimestampLast;

    bool isToken0;
    bool isTarget0;

    modifier onlyGov() {
        require(msg.sender == gov, "!gov");
        _;
    }

    modifier onlyRebaser() {
        require(msg.sender == rebaser, "!rebaser");
        _;
    }

    constructor(address _uni_factory, address _rebaser) public {
        gov = msg.sender;
        uni_factory = _uni_factory;
        rebaser = _rebaser;
    }

    function setTokenPair(address _tokenAddress, address _pairedAddress)
        public
        onlyGov
    {
        require(_tokenAddress != address(0) && _pairedAddress != address(0), "!zero");
        require(_tokenAddress != _pairedAddress, "same");
        (address token0, address token1) = UniswapV2Library.sortTokens(_tokenAddress, _pairedAddress);
        // Used for interacting with uniswap
        if (token0 == _tokenAddress) {
            isToken0 = true;
        } else {
            isToken0 = false;
        }

        tokenPair = UniswapV2Library.pairFor(uni_factory, token0, token1);
    }

    //
    //    // Uniswap ETH/DAI pair
    //    address dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    //    address weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    function setTargetPair(address _targetAddress, address _pairedAddress)
        public
        onlyGov
    {
        require(_targetAddress != address(0) && _pairedAddress != address(0), "!zero");
        require(_targetAddress != _pairedAddress, "same");
        (address token0, address token1) = UniswapV2Library.sortTokens(_targetAddress, _pairedAddress);
        // Used for interacting with uniswap
        if (token0 == _targetAddress) {
            isTarget0 = true;
        } else {
            isTarget0 = false;
        }

        targetPair = UniswapV2Library.pairFor(uni_factory, token0, token1);
    }

    function initTWAP() external onlyRebaser returns (uint32) {
        require(timeOfTWAPInit == 0, "already activated");
        (, uint32 tokenBlockTimestamp) = currentTokenPrice();
        require(tokenBlockTimestamp > 0, "no trades token");
        (, uint32 targetBlockTimestamp) = currentTargetPrice();
        require(targetBlockTimestamp > 0, "no trades target");

        timeOfTWAPInit = tokenBlockTimestamp;
        return tokenBlockTimestamp;
    }

    function currentTokenPrice() public onlyRebaser returns (uint256, uint32) {
        require(tokenPair != address(0), "!initialized");
        (uint cumulativePrice, uint32 blockTimestamp) = UniswapV2OracleLibrary.currentCumulativePrices(tokenPair, isToken0);
        uint32 timeElapsed = blockTimestamp - tokenBlockTimestampLast; // overflow is desired

        tokenCumulativePriceLast = cumulativePrice;
        tokenBlockTimestampLast = blockTimestamp;

        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(uint224((cumulativePrice - tokenCumulativePriceLast) / timeElapsed));

        return (FixedPoint.decode144(FixedPoint.mul(priceAverage, BASE)), blockTimestamp);
    }

    function currentTargetPrice() public onlyRebaser returns (uint256, uint32) {
        require(targetPair != address(0), "!initialized");
        (uint cumulativePrice, uint32 blockTimestamp) = UniswapV2OracleLibrary.currentCumulativePrices(targetPair, isTarget0);
        uint32 timeElapsed = blockTimestamp - targetBlockTimestampLast; // overflow is desired

        targetCumulativePriceLast = cumulativePrice;
        targetBlockTimestampLast = blockTimestamp;

        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(uint224((cumulativePrice - targetCumulativePriceLast) / timeElapsed));

        return (FixedPoint.decode144(FixedPoint.mul(priceAverage, BASE)), blockTimestamp);
    }

    function getCurrentTokenTWAP() external view returns (uint256, uint32) {
        require(tokenPair != address(0), "!initialized");
        (uint cumulativePrice, uint32 blockTimestamp) = UniswapV2OracleLibrary.currentCumulativePrices(tokenPair, isToken0);
        uint32 timeElapsed = blockTimestamp - tokenBlockTimestampLast; // overflow is desired

        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(uint224((cumulativePrice - tokenCumulativePriceLast) / timeElapsed));

        return (FixedPoint.decode144(FixedPoint.mul(priceAverage, BASE)), blockTimestamp);
    }

    function getCurrentTargetTWAP() external view returns (uint256, uint32) {
        require(targetPair != address(0), "!initialized");
        (uint cumulativePrice, uint32 blockTimestamp) = UniswapV2OracleLibrary.currentCumulativePrices(targetPair, isTarget0);
        uint32 timeElapsed = blockTimestamp - targetBlockTimestampLast; // overflow is desired

        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(uint224((cumulativePrice - targetCumulativePriceLast) / timeElapsed));

        return (FixedPoint.decode144(FixedPoint.mul(priceAverage, BASE)), blockTimestamp);
    }
}