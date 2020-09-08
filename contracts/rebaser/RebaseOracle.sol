pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "../lib/SafeMath.sol";
import '../lib/IUniswapV2Pair.sol';
import "../lib/UniswapV2Library.sol";
import "../lib/UniswapV2OracleLibrary.sol";

contract RebaseOracle {
    using SafeMath for uint256;

    struct TokenInfo {
        uint256 priceCumulativeLast;
        uint32  blockTimestampLast;
        address uniswap_pair;
        bool    isToken0;
    }

    uint256 constant BASE = 10**18;

    address public gov;
    address public rebaser;
    address public uni_factory;

    uint32 public timeOfTWAPInit;
    TokenInfo[] public mainTokens;
    TokenInfo[] public targetTokens;

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

    function addTokenPair(address _tokenAddress, address _pairedAddress)
        external
        onlyGov
    {
        require(_tokenAddress != address(0) && _pairedAddress != address(0), "!zero");
        require(_tokenAddress != _pairedAddress, "same");
        (address token0, address token1) = UniswapV2Library.sortTokens(_tokenAddress, _pairedAddress);
        // Used for interacting with uniswap
        bool isToken0;
        if (token0 == _tokenAddress) {
            isToken0 = true;
        }
        address tokenPair = UniswapV2Library.pairFor(uni_factory, token0, token1);
        (uint cumulativePrice, uint32 blockTimestamp) = UniswapV2OracleLibrary.currentCumulativePrices(
            tokenPair,
            isToken0
        );
        TokenInfo memory newToken = TokenInfo({
            uniswap_pair: tokenPair,
            priceCumulativeLast: cumulativePrice,
            blockTimestampLast: blockTimestamp,
            isToken0: isToken0
        });
        mainTokens.push(newToken);
    }

    //    // Uniswap ETH/DAI pair
    //    address dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    //    address weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    function addTargetPair(address _targetAddress, address _pairedAddress)
        external
        onlyGov
    {
        require(_targetAddress != address(0) && _pairedAddress != address(0), "!zero");
        require(_targetAddress != _pairedAddress, "same");
        (address token0, address token1) = UniswapV2Library.sortTokens(_targetAddress, _pairedAddress);
        // Used for interacting with uniswap
        bool isToken0;
        if (token0 == _targetAddress) {
            isToken0 = true;
        }

        address targetPair = UniswapV2Library.pairFor(uni_factory, token0, token1);
        (uint cumulativePrice, uint32 blockTimestamp) = UniswapV2OracleLibrary.currentCumulativePrices(
            targetPair,
            isToken0
        );
        TokenInfo memory newTarget = TokenInfo({
            uniswap_pair: targetPair,
            priceCumulativeLast: cumulativePrice,
            blockTimestampLast: blockTimestamp,
            isToken0: isToken0
        });
        targetTokens.push(newTarget);
    }

    function initTWAP() external onlyRebaser returns (uint32) {
        require(timeOfTWAPInit == 0, "already activated");
        (, uint32 tokenBlockTimestamp) = currentAggregatedTokenPrice();
        require(tokenBlockTimestamp > 0, "no trades token");
        (, uint32 targetBlockTimestamp) = currentAggregatedTargetPrice();
        require(targetBlockTimestamp > 0, "no trades target");

        // Only setting TWAP init since the other functions set last price and timestamp.
        timeOfTWAPInit = tokenBlockTimestamp;

        return tokenBlockTimestamp;
    }

    function currentAggregatedTokenPrice() public onlyRebaser returns (uint256, uint32) {
        uint256 accumulatedPrice;
        uint256 accumulatedTimestamp;
        uint256 length = mainTokens.length;
        for (uint256 i = 0; i < length; i++) {
            (uint256 price, uint32 blockTimestamp) = currentTokenPrice(i);
            accumulatedPrice.add(price);
            accumulatedTimestamp.add(uint256(blockTimestamp));
        }
        uint256 averagedPrice = accumulatedPrice.div(length);
        uint256 averagedTime = accumulatedTimestamp.div(length);
        return (averagedPrice, uint32(averagedTime));
    }

    function currentAggregatedTargetPrice() public onlyRebaser returns (uint256, uint32) {
        uint256 accumulatedPrice;
        uint256 accumulatedTimestamp;
        uint256 length = targetTokens.length;
        for (uint256 i = 0; i < length; i++) {
            (uint256 price, uint32 blockTimestamp) = currentTargetPrice(i);
            accumulatedPrice.add(price);
            accumulatedTimestamp.add(blockTimestamp);
        }
        uint256 averagedPrice = accumulatedPrice.div(length);
        uint256 averagedTime = accumulatedTimestamp.div(length);
        return (averagedPrice, uint32(averagedTime));
    }

    function currentTokenPrice(uint256 index) internal onlyRebaser returns (uint256, uint32) {
        TokenInfo memory tokenInfo = mainTokens[index];
        require(tokenInfo.blockTimestampLast != 0, "!init");
        (uint cumulativePrice, uint32 blockTimestamp) = UniswapV2OracleLibrary.currentCumulativePrices(
            tokenInfo.uniswap_pair,
            tokenInfo.isToken0
        );
        uint32 timeElapsed = blockTimestamp - tokenInfo.blockTimestampLast; // overflow is desired

        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(uint224((cumulativePrice - tokenInfo.blockTimestampLast) / timeElapsed));

        tokenInfo.priceCumulativeLast = cumulativePrice;
        tokenInfo.blockTimestampLast = blockTimestamp;
        mainTokens[index] = tokenInfo;

        return (FixedPoint.decode144(FixedPoint.mul(priceAverage, BASE)), blockTimestamp);
    }

    function currentTargetPrice(uint256 index) internal onlyRebaser returns (uint256, uint32) {
        TokenInfo memory targetInfo = targetTokens[index];
        require(targetInfo.blockTimestampLast != 0, "!init");
        (uint cumulativePrice, uint32 blockTimestamp) = UniswapV2OracleLibrary.currentCumulativePrices(
            targetInfo.uniswap_pair,
            targetInfo.isToken0
        );
        uint32 timeElapsed = blockTimestamp - targetInfo.blockTimestampLast; // overflow is desired

        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(uint224((cumulativePrice - targetInfo.blockTimestampLast) / timeElapsed));

        targetInfo.priceCumulativeLast = cumulativePrice;
        targetInfo.blockTimestampLast = blockTimestamp;
        targetTokens[index] = targetInfo;

        return (FixedPoint.decode144(FixedPoint.mul(priceAverage, BASE)), blockTimestamp);
    }

    function getCurrentTokenTWAP(uint256 index) external view returns (uint256, uint32) {
        TokenInfo memory tokenInfo = mainTokens[index];
        (uint cumulativePrice, uint32 blockTimestamp) = UniswapV2OracleLibrary.currentCumulativePrices(
            tokenInfo.uniswap_pair,
            tokenInfo.isToken0
        );
        uint32 timeElapsed = blockTimestamp - tokenInfo.blockTimestampLast; // overflow is desired

        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(uint224((cumulativePrice - tokenInfo.blockTimestampLast) / timeElapsed));

        return (FixedPoint.decode144(FixedPoint.mul(priceAverage, BASE)), blockTimestamp);
    }

    function getCurrentTargetTWAP(uint256 index) external view returns (uint256, uint32) {
        TokenInfo memory targetInfo = targetTokens[index];
        (uint cumulativePrice, uint32 blockTimestamp) = UniswapV2OracleLibrary.currentCumulativePrices(
            targetInfo.uniswap_pair,
            targetInfo.isToken0
        );
        uint32 timeElapsed = blockTimestamp - targetInfo.blockTimestampLast; // overflow is desired

        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(uint224((cumulativePrice - targetInfo.blockTimestampLast) / timeElapsed));

        return (FixedPoint.decode144(FixedPoint.mul(priceAverage, BASE)), blockTimestamp);
    }
}