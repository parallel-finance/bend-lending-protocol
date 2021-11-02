// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract MockChainlinkOracle is AggregatorV3Interface {
  uint80[] roundIdArray;
  int256[] answerArray;
  uint256[] decimalsArray;
  uint256[] timestampArray;
  uint80[] versionArray;
  uint8 _decimals;

  constructor(uint8 decimals_) {
    _decimals = decimals_;
  }

  function decimals() external view override returns (uint8) {
    return _decimals;
  }

  function description() external pure override returns (string memory) {
    return "";
  }

  function version() external pure override returns (uint256) {
    return 0;
  }

  function getRoundData(uint80 _roundId)
    external
    view
    override
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    )
  {
    uint256 maxIndex = roundIdArray.length - 1;
    uint256 index = maxIndex + _roundId - roundIdArray[maxIndex];
    return (roundIdArray[index], answerArray[index], decimalsArray[index], timestampArray[index], versionArray[index]);
  }

  function latestRoundData()
    external
    view
    override
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    )
  {
    uint256 index = roundIdArray.length - 1;
    return (roundIdArray[index], answerArray[index], decimalsArray[index], timestampArray[index], versionArray[index]);
  }

  function mockAddAnswer(
    uint80 _roundId,
    int256 _answer,
    uint256 _startedAt,
    uint256 _updatedAt,
    uint80 _answeredInRound
  ) external {
    roundIdArray.push(_roundId);
    answerArray.push(_answer);
    decimalsArray.push(_startedAt);
    timestampArray.push(_updatedAt);
    versionArray.push(_answeredInRound);
  }
}