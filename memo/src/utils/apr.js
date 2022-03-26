import { BigNumber } from 'bignumber.js'
import { BLOCKS_PER_YEAR } from './constant'

const getPoolApr = (
    stakingTokenPrice,
    rewardTokenPrice,
    totalStaked,
    tokenPerBlock,
  ) => {
    if(totalStaked == 0) {
      totalStaked = 100000000
    }
    const totalRewardPricePerYear = new BigNumber(rewardTokenPrice).times(tokenPerBlock).times(BLOCKS_PER_YEAR)
    const totalStakingTokenInPool = new BigNumber(stakingTokenPrice).times(totalStaked)
    const apr = totalRewardPricePerYear.div(totalStakingTokenInPool).times(100)
    return apr.isNaN() || !apr.isFinite() ? null : apr.toNumber().toFixed(2)
  }

const getFarmApr = (reward, OgsPriceUsd, poolLiquidityUsd) => {
    const totalRewardPricePerYear = new BigNumber(OgsPriceUsd).times(reward).times(BLOCKS_PER_YEAR)
    const apr = totalRewardPricePerYear.div(poolLiquidityUsd).times(100)
    return apr.isNaN() || !apr.isFinite() ? null : apr.toNumber().toFixed(2)
}

const getAutoOGSAPR = (reward, OgsPriceUsd, lpstackingOGS) => {
  const totalRewardPricePerYear = new BigNumber(OgsPriceUsd).times(reward).times(BLOCKS_PER_YEAR)
  let lpstackingAPR = totalRewardPricePerYear.dividedBy(BigNumber(lpstackingOGS)).toNumber();
  return lpstackingAPR;
}

const getAutoOGSAPY = (lpstackingAPR, averageDaliyCompoundTimes) => {

  const averageYearCompoundTimes =  averageDaliyCompoundTimes * 365;
  console.log(35, averageYearCompoundTimes)
  const intraDailyRate = BigNumber(lpstackingAPR).dividedBy(averageYearCompoundTimes).toNumber()
  console.log(37, intraDailyRate)
  // 由当前ogs pool 的APR计算 auto ogs pool 的APY
  // Auto Pool APY = (1 + Compound timely rate)^ Yearly compound times -1  * 100 %
  const autoAPY = Math.pow(1 + intraDailyRate, averageYearCompoundTimes) - 1;
  console.log(41, autoAPY)
  // console.log("APY for auto ogs pool ", autoAPY * 100, "%");
  return autoAPY

}

export { getPoolApr, getFarmApr, getAutoOGSAPR, getAutoOGSAPY }

