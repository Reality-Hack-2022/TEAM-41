
import { BEP20_ABI, PANCAKE_ROUTER_ABI, FARMING_ABI, CHAINLINK_ORACLE_ABI, OURO_RESERVE_ABI, STAKING_ABI, OURO_STAKING_ABI, VESTING_ABI, VTOKEN_ABI, OGS_STAKING_ABI } from "./abis";
import { CONTRACT_ADDRESS, MaxUint256, OURO_RESERVE, PANCAKE_ROUTER_V2, OGS_HOLDING_ADDRESS, OURO_STAKING, VENUS_DEPOSIT_TOKEN } from './constant'
import { BigNumber } from '@ethersproject/bignumber'
import moment from "moment";

const readContractData = async (web3Ref, contractAddress, contractABI, method, args) => {
    const contract = new web3Ref.eth.Contract(
        contractABI,
        contractAddress
    )
    const result = await contract.methods[method](...args).call()
    return result
}

const writeContractData = async (web3Ref, contractAddress, contractABI, method, userAddress, args, BNBAmount) => {
    const contract = new web3Ref.eth.Contract(
        contractABI,
        contractAddress
    )
    const params = {
        from: userAddress,
        value: BNBAmount ? BNBAmount : 0
    }
    const result = await contract.methods[method](...args).send( params )
    return result
}

const getContractAddress = (tokenName, chainId) => {
    const chain = getChain(chainId)
    return CONTRACT_ADDRESS[tokenName][chain]
}

const getBNBBalance = async (w3, userAddress) => {
    let balance = await w3.eth.getBalance(userAddress)
    balance = w3.utils.fromWei(balance, 'ether');
    return round(balance, 4)
}

const getVestingContract = async (w3, chainId) => {
    const contractAddress = getContractAddress(OURO_STAKING, chainId)
    const result = await readContractData(w3, contractAddress, OURO_STAKING_ABI, 'vestingContract', [])
    return result
}

const getTokenBalance = async ( w3, chainId, token, userAddress ) => {
    if (token === 'BNB') {
        const balance = getBNBBalance(w3, userAddress)
        return balance
    } else {
        const tokenAddress = getContractAddress(token, chainId)
        let balance = await readContractData(w3, tokenAddress, BEP20_ABI, 'balanceOf', [userAddress])
        balance = w3.utils.fromWei(balance, 'ether');
        return balance
    }
}

const hasSwapAllowance = async (w3, chainId, token, userAddress) => {
    if(token === 'BNB') {
        return true
    } else {
        const tokenAddress = getContractAddress(token, chainId)
        const OuroReserveContract = getContractAddress(OURO_RESERVE, chainId)
        let allowance = await readContractData(w3, tokenAddress, BEP20_ABI, 'allowance', [userAddress, OuroReserveContract] )
        allowance = w3.utils.fromWei(allowance, 'ether');
        return allowance > 0
    }
}

const approve = async (w3, tokenAddress, userAddress, swapContract) => {
    const result = await writeContractData(w3, tokenAddress, BEP20_ABI, 'approve', userAddress, [swapContract, MaxUint256] )
    return result
}

const approveLPStaking = async (w3, chainId, tokenPair, userAddress) => {
    const [ fromToken, toToken ] = tokenPair
    const LPPair = `${fromToken.symbol}_${toToken.symbol}`
    const LPPairStaking = `${LPPair}_STAKING`
    const LPPairContract = getContractAddress(LPPair, chainId)
    const LPstakingContract = getContractAddress(LPPairStaking, chainId)
    const result = await approve(w3, LPPairContract, userAddress, LPstakingContract)
    return result
}

const approveAssetStaking = async (w3, chainId, token, userAddress) => {
    const tokenStaking = `${token}_STAKING`
    const tokenAddress = getContractAddress(token, chainId)
    const StakingContract = getContractAddress(tokenStaking, chainId)
    const result = await approve(w3, tokenAddress, userAddress, StakingContract)
    return result
}

const approveSwap = async (w3, chainId, token, userAddress) => {
    const tokenAddress = getContractAddress(token, chainId)
    const swapContract = getContractAddress(OURO_RESERVE, chainId)
    const result = await approve(w3, tokenAddress, userAddress, swapContract)
    return result
}

const calculateTokenPath = (tokenIn, tokenOut, chainId) => {

    const tokenInContract = getContractAddress(tokenIn, chainId)
    const tokenOutContract = getContractAddress(tokenOut, chainId)
    const WBNBContract = getContractAddress('BNB', chainId)
    const OUROContract = getContractAddress('OURO', chainId)
    const USDTContract = getContractAddress('USDT', chainId)

    if (tokenIn === 'BNB' && tokenOut === 'OURO') {
        return [WBNBContract, USDTContract, OUROContract]
    }
    if (tokenIn === 'OURO' || tokenOut === 'USDT') {
        return [tokenInContract, tokenOutContract]
    }
    if (tokenIn === 'BNB' || tokenOut === 'BNB') {
        return [tokenInContract, tokenOutContract]
    } else{
        return [tokenInContract, WBNBContract, tokenOutContract]
    }
}

const getSwapRate = async (w3, contractAddress, amountIn, tokenPath) => {
    let result = await readContractData(w3, contractAddress, PANCAKE_ROUTER_ABI, 'getAmountsOut', [amountIn, tokenPath] )
    let amountOut = result[result.length - 1]
    amountOut = w3.utils.fromWei(amountOut, 'ether');
    return amountOut
}

function round(number, precision) {
    return Math.round(+number + 'e' + precision) / Math.pow(10, precision);
}

const getOuroPrice = async (w3, chainId) => {
    const routerContract = getContractAddress(PANCAKE_ROUTER_V2, chainId)
    const ouroContract = getContractAddress('OURO', chainId)
    const usdtContract = getContractAddress('BUSD', chainId)
    const amountIn = w3.utils.toWei('1', 'ether');
    const result = await getSwapRate(w3, routerContract, amountIn, [ouroContract, usdtContract])
    return round(result, 3)
}

const getOuroDefaultRate = async (w3, chainId) => {
    const reserveContract = getContractAddress(OURO_RESERVE, chainId)
    let result = await readContractData(w3, reserveContract, OURO_RESERVE_ABI, 'getPrice', [])
    result  = w3.utils.fromWei(result, 'ether');
    return result
}

const getOuroTotalSupply = async (w3, chainId) => {
    const OuroContract = getContractAddress('OURO', chainId)
    let totalSupply = await readContractData(w3, OuroContract, BEP20_ABI, 'totalSupply', [])
    totalSupply = w3.utils.fromWei(totalSupply, 'ether');
    return totalSupply
}

const getOGSTotalSupply = async (w3, chainId) => {
    const OGSContract = getContractAddress('OGS', chainId)
    let totalSupply = await readContractData(w3, OGSContract, BEP20_ABI, 'totalSupply', [])
    totalSupply = w3.utils.fromWei(totalSupply, 'ether');
    return totalSupply
}

const getOGSCirculatingSupply = async (w3, chainId) => {
    const totalSupply = await getOGSTotalSupply(w3, chainId)
    let lockedBalance = 0
    for (let i = 0; i < OGS_HOLDING_ADDRESS.length; i++) {
        const address = OGS_HOLDING_ADDRESS[i]
        const balance =  await getStakingTokenBalance(w3, chainId, 'OGS', address)
        console.log(address, balance)
        lockedBalance += parseFloat(balance)
    }
    return totalSupply - lockedBalance
}

const getOGSPrice = async (w3, chainId) => {
    const routerContract = getContractAddress(PANCAKE_ROUTER_V2, chainId)
    const ouroContract = getContractAddress('OGS', chainId)
    const usdtContract = getContractAddress('BUSD', chainId)
    const amountIn = w3.utils.toWei('1', 'ether');
    const result = await getSwapRate(w3, routerContract, amountIn, [ouroContract, usdtContract])
    return result
}

const getLastDayAssetPrice = async (w3, chainId, asset) => {
    const chain = getChain(chainId)
    const oracleContract = getContractAddress(`${asset}_PRICE_FEED`, chain)
    let latestRound = await readContractData(w3, oracleContract, CHAINLINK_ORACLE_ABI, 'latestRound', [])
    latestRound = BigNumber.from(latestRound).sub(930)
    let price = await readContractData(w3, oracleContract, CHAINLINK_ORACLE_ABI, 'getRoundData', [latestRound])
    price = price[1]
    price = w3.utils.fromWei(price, 'gwei') * 10
    return price
}

const getChain = (chainId) => {
    return '56'
}

const getFarmingPoolUSDWorth = async (w3, chainId, tokenPair) => {
    let [ fromToken, toToken ] = tokenPair
    fromToken = fromToken.symbol
    toToken = toToken.symbol
    const LPContract = getContractAddress(`${fromToken}_${toToken}`, chainId)
    const fromTokenContract = getContractAddress(fromToken, chainId)
    const toTokenContract = getContractAddress(toToken, chainId)
    let fromTokenBalance = await readContractData(w3, fromTokenContract, BEP20_ABI, 'balanceOf', [LPContract] )
    let toTokenBalance = await readContractData(w3, toTokenContract, BEP20_ABI, 'balanceOf', [LPContract] )
    fromTokenBalance = w3.utils.fromWei(fromTokenBalance, 'ether')
    toTokenBalance = w3.utils.fromWei(toTokenBalance, 'ether')
    const ouroPrice = await getOuroDefaultRate(w3, chainId)
    const ogsPrice = await getOGSPrice(w3, chainId)
    if(fromToken === 'OURO') {
        return round(fromTokenBalance * ouroPrice + toTokenBalance * 1, 4)
    } else {
        return round(fromTokenBalance * ogsPrice + toTokenBalance * 1, 4)

    }
}

const getCurrentAssetPrice = async (w3, chainId, asset) => {
    const chain = getChain(chainId)
    const oracleContract = getContractAddress(`${asset}_PRICE_FEED`, chain)
    let price = await readContractData(w3, oracleContract, CHAINLINK_ORACLE_ABI, 'latestAnswer', [])
    price = w3.utils.fromWei(price, 'gwei') * 10
    return price
}

const getAssetReservedAmount = async (w3, chainId, asset) => {
    const chain = getChain(chainId)
    const tokenAddress = getContractAddress(asset, chain)
    const OuroReserveContract = getContractAddress(OURO_RESERVE, chain)
    let amount = await readContractData(w3, OuroReserveContract, OURO_RESERVE_ABI, 'getAssetBalance', [tokenAddress])
    amount = w3.utils.fromWei(amount, 'ether')
    amount = parseFloat(amount)
    return amount
}

const deposit = async (w3, chainId, userAddress, asset, assetAmount) => {
    const OuroReserveContract = getContractAddress(OURO_RESERVE, chainId)
    const assetAddress = getContractAddress(asset, chainId)
    const amount = w3.utils.toWei(assetAmount.toString(), 'ether')
    let tokenAmount, BNBAmount
    if (asset === 'BNB') {
        tokenAmount = 0
        BNBAmount = amount
    } else {
        tokenAmount = amount
        BNBAmount = 0
    }
    const resp = await writeContractData(w3, OuroReserveContract, OURO_RESERVE_ABI, 'deposit', userAddress, [assetAddress, tokenAmount, 0], BNBAmount)
    return resp
}

const withdraw = async (w3, chainId, userAddress, asset, assetAmount) => {
    const OuroReserveContract = getContractAddress(OURO_RESERVE, chainId)
    const assetAddress = getContractAddress(asset, chainId)
    const amount = w3.utils.toWei(assetAmount.toString(), 'ether')
    const resp = await writeContractData(w3, OuroReserveContract, OURO_RESERVE_ABI, 'withdraw', userAddress, [assetAddress, amount, w3.utils.toWei('10000000000000000000000000000','ether')])
    return resp
}

const getFarmingPoolLiqudity = async (w3, tokenPair, chainId) => {
    const [ fromToken, toToken ] = tokenPair
    const LPPair = `${fromToken.symbol}_${toToken.symbol}`
    const LPPairStaking = `${LPPair}_STAKING`
    const LPStakingContract = getContractAddress(LPPairStaking, chainId)
    let liqudity = await readContractData(w3, LPStakingContract, FARMING_ABI, 'totalStaked', [] )
    liqudity = w3.utils.fromWei(liqudity, 'ether');
    return round(liqudity, 4)
}

const getFarmingReward = async (w3, tokenPair, chainId) => {
    const [ fromToken, toToken ] = tokenPair
    const LPPair = `${fromToken.symbol}_${toToken.symbol}`
    const LPPairStaking = `${LPPair}_STAKING`
    const LPStakingContract = getContractAddress(LPPairStaking, chainId)
    let reward = await readContractData(w3, LPStakingContract, FARMING_ABI, 'BlockReward', [] )
    reward = w3.utils.fromWei(reward, 'ether');
    
    return reward
}

const getStakingReward = async (w3, token, chainId) => {
    const staking = `${token}_STAKING`
    const StakingContract = getContractAddress(staking, chainId)
    let reward = await readContractData(w3, StakingContract, FARMING_ABI, 'BlockReward', [] )
    reward = w3.utils.fromWei(reward, 'ether');
    return reward
}

const checkFarmingAllowance = async (w3, tokenPair, chainId, userAddress) => {
    const [ fromToken, toToken ] = tokenPair
    const LPPair = `${fromToken.symbol}_${toToken.symbol}`
    const LPPairStaking = `${LPPair}_STAKING`
    const LPPairContract = getContractAddress(LPPair, chainId)
    const LPstakingContract = getContractAddress(LPPairStaking, chainId)
    let allowance = await readContractData(w3, LPPairContract, BEP20_ABI, 'allowance', [userAddress, LPstakingContract] )
    allowance = w3.utils.fromWei(allowance, 'ether');
    return allowance > 0
}

const checkStakingAllowance = async (w3, token, chainId, userAddress) => {
    const tokenContract = getContractAddress(token, chainId)
    const StakingToken = `${token}_STAKING`
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    let allowance = await readContractData(w3, tokenContract, BEP20_ABI, 'allowance', [userAddress, StakingTokenAddress] )
    allowance = w3.utils.fromWei(allowance, 'ether');
    return allowance > 0
}

const getStakingPoolLiqudity = async (w3, token, chainId, outdated) => {
    let StakingToken
    if(outdated) {
        StakingToken = `OURO_STAKING_OUTDATED`
    } else{
        StakingToken = `${token}_STAKING`
    }
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    let liqudity = await readContractData(w3, StakingTokenAddress, FARMING_ABI, 'totalStaked', [] )
    liqudity = w3.utils.fromWei(liqudity, 'ether');
    return round(liqudity, 4)
}

const getOGSStakingPoolLiqudity = async (w3, token, chainId, outdated) => {
    let StakingToken
    if(outdated) {
        StakingToken = `OURO_STAKING_OUTDATED`
    } else{
        StakingToken = `${token}_STAKING`
    }
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    console.log(332, StakingTokenAddress)
    const contract = new w3.eth.Contract(
        OGS_STAKING_ABI,
        StakingTokenAddress
    )
    let liqudity = await contract.methods.balanceOf().call()
    // console.log(332, liqudity)
    liqudity = w3.utils.fromWei(liqudity, 'ether');
    return round(liqudity, 4)

}

const getStakingTokenStaked = async (w3, token, chainId, userAddress, outdated) => {
    let StakingToken
    if(outdated) {
        StakingToken = `OURO_STAKING_OUTDATED`
    } else{
        StakingToken = `${token}_STAKING`
    }
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    let tokenStaked = await readContractData(w3, StakingTokenAddress, FARMING_ABI, 'numStaked', [userAddress] )
    tokenStaked = w3.utils.fromWei(tokenStaked, 'ether');
    return tokenStaked
}

const getFarmingLPStaked = async (w3, tokenPair, chainId, userAddress) => {
    const [ fromToken, toToken ] = tokenPair
    const LPPair = `${fromToken.symbol}_${toToken.symbol}`
    const LPPairStaking = `${LPPair}_STAKING`
    const LPStakingContract = getContractAddress(LPPairStaking, chainId)
    let LPStaked = await readContractData(w3, LPStakingContract, FARMING_ABI, 'numStaked', [userAddress] )
    LPStaked = w3.utils.fromWei(LPStaked, 'ether');
    return LPStaked
}

const getFarmingLPStakingReward = async (w3, tokenPair, chainId, userAddress) => {
    const [ fromToken, toToken ] = tokenPair
    const LPPair = `${fromToken.symbol}_${toToken.symbol}`
    const LPPairStaking = `${LPPair}_STAKING`
    const LPStakingContract = getContractAddress(LPPairStaking, chainId)
    let reward = await readContractData(w3, LPStakingContract, FARMING_ABI, 'checkReward', [userAddress] )
    reward = w3.utils.fromWei(reward, 'ether');
    return reward
}

const getLPTokenBalance = async (w3, chainId, tokenPair, userAddress) => {
    const [ fromToken, toToken ] = tokenPair
    const LPPair = `${fromToken.symbol}_${toToken.symbol}`
    const LPTokenContract = getContractAddress(LPPair, chainId)
    let balance = await readContractData(w3, LPTokenContract, BEP20_ABI, 'balanceOf', [userAddress] )
    balance = w3.utils.fromWei(balance, 'ether');
    return round(balance, 4)
}

const getStakingTokenBalance = async (w3, chainId, token, userAddress) => {
    if(token === 'BNB') {
        return getBNBBalance(w3, userAddress)
    } else {
        const tokenContract = getContractAddress(token, chainId)
        let balance = await readContractData(w3, tokenContract, BEP20_ABI, 'balanceOf', [userAddress] )
        balance = w3.utils.fromWei(balance, 'ether');
        return balance
    }
}

const depositLPToken = async (w3, chainId, tokenPair, depositAmount, userAddress ) => {
    const [ fromToken, toToken ] = tokenPair
    const LPPair = `${fromToken.symbol}_${toToken.symbol}`
    const LPPairStaking = `${LPPair}_STAKING`
    const LPStakingContract = getContractAddress(LPPairStaking, chainId)
    const amount = w3.utils.toWei(depositAmount.toString(), 'ether');
    const resp = await writeContractData(w3, LPStakingContract, FARMING_ABI, 'deposit', userAddress, [BigNumber.from(amount)])
    return resp
}

const withdrawLPToken = async (w3, chainId, tokenPair, depositAmount, userAddress) => {
    const [ fromToken, toToken ] = tokenPair
    const LPPair = `${fromToken.symbol}_${toToken.symbol}`
    const LPPairStaking = `${LPPair}_STAKING`
    const LPStakingContract = getContractAddress(LPPairStaking, chainId)
    const amount = w3.utils.toWei(depositAmount.toString(), 'ether');
    const resp = await writeContractData(w3, LPStakingContract, FARMING_ABI, 'withdraw', userAddress, [amount])
    return resp
}

const harvestFarmingReward = async (w3, chainId, tokenPair, userAddress) => {
    const [ fromToken, toToken ] = tokenPair
    const LPPair = `${fromToken.symbol}_${toToken.symbol}`
    const LPPairStaking = `${LPPair}_STAKING`
    const LPStakingContract = getContractAddress(LPPairStaking, chainId)
    const resp = await writeContractData(w3, LPStakingContract, FARMING_ABI, 'claimRewards', userAddress, [])
    return resp
}

const depositStakingToken = async (w3, chainId, token, depositAmount, userAddress) => {
    const StakingToken = `${token}_STAKING`
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    const amount = w3.utils.toWei(depositAmount.toString(), 'ether');
    if (token === 'BNB') {
        const resp = await writeContractData(w3, StakingTokenAddress, STAKING_ABI, 'deposit', userAddress, [0], amount)
        return resp
    } else if(token === 'OGS') {
        const resp = await writeContractData(w3, StakingTokenAddress, OGS_STAKING_ABI, 'clientDeposit', userAddress, [amount])
        return resp
    }
    else {
        const resp = await writeContractData(w3, StakingTokenAddress, STAKING_ABI, 'deposit', userAddress, [amount])
        return resp
    }
}

const checkStakingOUROPoolUnlockedReward = async (w3, chainId, userAddress) => {
    const contractAddress = await getVestingContract(w3, chainId)
    let reward = await readContractData(w3, contractAddress, VESTING_ABI, 'checkUnlocked', [userAddress] )
    reward = w3.utils.fromWei(reward, 'ether');
    return parseFloat(reward)
}

const vestStakingOUROPoolReward = async (w3, chainId, userAddress) => {
    const contractAddress = getContractAddress('OURO_STAKING', chainId)
    let resp = await writeContractData(w3, contractAddress, OURO_STAKING_ABI, 'vestReward', userAddress, [] )
    return resp
}

const claimStakingOUROPoolWithPenalty = async(w3, chainId, userAddress) => {
    const contractAddress = await getVestingContract(w3, chainId)
    let resp = await writeContractData(w3, contractAddress, VESTING_ABI, 'claimAllWithPenalty', userAddress, [] )
    return resp
}

const claimStakingOUROPoolUnlocked = async(w3, chainId, userAddress) => {
    const contractAddress = await getVestingContract(w3, chainId)
    let resp = await writeContractData(w3, contractAddress, VESTING_ABI, 'claimUnlocked', userAddress, [] )
    return resp
}

const checkStakingOUROPoollockedReward = async (w3, chainId, userAddress) => {
    const contractAddress = await getVestingContract(w3, chainId)
    let reward = await readContractData(w3, contractAddress, VESTING_ABI, 'checkLocked', [userAddress] )
    reward = w3.utils.fromWei(reward, 'ether');
    return parseFloat(reward)
}


const checkStakingOUROPoolVested = async (w3, chainId, userAddress) => {
    const contractAddress = await getVestingContract(w3, chainId)
    let reward = await readContractData(w3, contractAddress, VESTING_ABI, 'checkVested', [userAddress] )
    reward = w3.utils.fromWei(reward, 'ether');
    return parseFloat(reward)
}

const checkStakingOUROPoolTotalReward = async (w3, chainId, userAddress) => {
    const StakingToken = `OURO_STAKING`
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    let reward = await readContractData(w3, StakingTokenAddress, OURO_STAKING_ABI, 'checkReward', [userAddress])
    reward = w3.utils.fromWei(reward, 'ether');
    return parseFloat(reward)
}

const harvestStakingOUROPoolReward = async (w3, chainId, userAddress) => {
    const StakingToken = `OURO_STAKING`
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    const resp = await writeContractData(w3, StakingTokenAddress, OURO_STAKING_ABI, 'vestReward', userAddress, [])
    return resp
}

const checkStakingOGSReward = async (w3, token, chainId, userAddress) => {
    const StakingToken = `${token}_STAKING`
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    let balance = await readContractData(w3, StakingTokenAddress, STAKING_ABI, 'checkOGSReward', [userAddress] )
    balance = w3.utils.fromWei(balance, 'ether');
    return balance
}

const checkOGSStakingOGSReward = async (w3, token, chainId, userAddress) => {
    const StakingToken = `${token}_STAKING`
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    const contract = new w3.eth.Contract(
        OGS_STAKING_ABI,
        StakingTokenAddress
    )
    let currentShare = await contract.methods.getClintCurrentShare(userAddress).call()
    let ogsPerShare = await contract.methods.getOgsPerAgentShare().call()
    // ogsPerShare = w3.utils.fromWei(ogsPerShare, 'ether');
    // console.log(515, ogsPerShare, currentShare)
    const ETH = BigNumber.from('1000000000000000000')
    let result = BigNumber.from(currentShare).mul(ogsPerShare).div(ETH).toString()
    result = w3.utils.fromWei(result, 'ether');
    return result
}

const checkStakingOUROReward = async (w3, token, chainId, userAddress) => {
    const StakingToken = `${token}_STAKING`
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    let balance = await readContractData(w3, StakingTokenAddress, STAKING_ABI, 'checkOUROReward', [userAddress] )
    balance = w3.utils.fromWei(balance, 'ether');
    return parseFloat(balance).toFixed(10)
}

const withdrawStakingToken = async (w3, chainId, token, depositAmount, userAddress, outdated) => {
    let StakingToken
    if(outdated) {
        StakingToken = `OURO_STAKING_OUTDATED`
    } else{
        StakingToken = `${token}_STAKING`
    }
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    const amount = w3.utils.toWei(depositAmount, 'ether');
    const resp = await writeContractData(w3, StakingTokenAddress, STAKING_ABI, 'withdraw', userAddress, [amount])
    return resp
}

const harvestStakingOUROReward = async (w3, chainId, token, userAddress) => {
    const StakingToken = `${token}_STAKING`
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    const resp = await writeContractData(w3, StakingTokenAddress, STAKING_ABI, 'claimOURORewards', userAddress, [])
    return resp
}

const harvestStakingOGSReward = async (w3, chainId, token, userAddress) => {
    const StakingToken = `${token}_STAKING`
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    const resp = await writeContractData(w3, StakingTokenAddress, STAKING_ABI, 'claimOGSRewards', userAddress, [])
    return resp
}

const getOGSBlockReward = async (w3, chainId) => {
    const OGSStackContract = getContractAddress('OGS_VAULT', chainId)
    const contract = new w3.eth.Contract(
        FARMING_ABI,
        OGSStackContract
    )
    let result = await contract.methods.BlockReward().call()
    result = w3.utils.fromWei(result, 'ether');
    return result
}

const getOGSStackingBalance = async (w3, chainId) => {
    const OGSStackContract = getContractAddress('OGS_VAULT', chainId)
    const tokenBalance = await getTokenBalance(w3, chainId, 'OGS', OGSStackContract)
    return tokenBalance
}

const harvestStakingAutoOGSReward = async (w3, chainId, token, inputVal, userAddress) => {
    const StakingToken = `${token}_STAKING`
    const StakingTokenAddress = getContractAddress(StakingToken, chainId)
    // total amount = client share * share value
    // inputVal / share value
    const value = w3.utils.toWei(inputVal, 'ether');
    const contract = new w3.eth.Contract(
        OGS_STAKING_ABI,
        StakingTokenAddress
    )
    const ETH = BigNumber.from('1000000000000000000')
    let currentShare = await contract.methods.getClintCurrentShare(userAddress).call()
    let ogsPerShare = await contract.methods.getOgsPerAgentShare().call()
    let result = BigNumber.from(currentShare).mul(ogsPerShare).div(ETH).toString()
    result = w3.utils.fromWei(result)
    console.log(588, inputVal, result)
    let percent = parseInt(inputVal / result * 1000)
    console.log(589, percent)
    let shareAmount = BigNumber.from(currentShare).mul(percent).div(1000).toString()
    console.log(590, currentShare, shareAmount)
    await contract.methods.clientWithdraw(shareAmount).call({from: userAddress})
    const resp = await writeContractData(w3, StakingTokenAddress, OGS_STAKING_ABI, 'clientWithdraw', userAddress, [shareAmount])
    return resp
}

const calcuateOUROAPR = async (w3, chainId, token, userAddress) => {
    console.log('-----------')
    const tokenAddress = getContractAddress(token, chainId)
    const adminAddress = '0xAF74369a86fc2d29d07E84142334E2aB4a6B0323'
    let exchangeRateStored = await readContractData(w3, tokenAddress, VTOKEN_ABI, 'exchangeRateStored', [])
    let balanceOf = await readContractData(w3, tokenAddress, VTOKEN_ABI, 'balanceOf', [adminAddress])
    console.log(token, tokenAddress)
    console.log('exchange rate', exchangeRateStored)
    console.log('balance of', balanceOf)
    exchangeRateStored = BigNumber.from(exchangeRateStored)
    balanceOf = BigNumber.from(balanceOf)
    let ETH = w3.utils.toWei('1', 'ether');
    ETH = BigNumber.from(ETH)
    let temp = exchangeRateStored.mul(balanceOf).div(ETH)
    console.log('temp', temp.toString())

    let amount = VENUS_DEPOSIT_TOKEN[token]['AMOUNT']

    var utcMoment = moment.utc().valueOf() / 1000
    var depositTime = VENUS_DEPOSIT_TOKEN[token]['TS']
    var diff = utcMoment - depositTime

    console.log('second passed', diff)
    let depositTokenAmount = BigNumber.from(w3.utils.toWei(amount, 'ether'))
    console.log('deposit token amount', depositTokenAmount.toString())
    temp = temp.sub(depositTokenAmount)
    console.log('temp after sub', temp.toString())
    temp = temp.mul(365).mul(86400).div(depositTokenAmount).mul(100)
    const resp = temp.toNumber() / diff
    console.log('result', resp)
    console.log('-----------')
    return parseFloat(resp).toFixed(2)
    // (vBNB.exchangeRateStored * vBNB.balanceOf(MyAccount) / 1e18 - 1BNB) / 1BNB / (t1-t0)
}

export { getCurrentAssetPrice, getLastDayAssetPrice, getAssetReservedAmount }
export { getOGSTotalSupply, getOGSCirculatingSupply, getOuroTotalSupply, getOGSPrice, getOuroPrice, getOuroDefaultRate }
export { calculateTokenPath }
export { getContractAddress, getBNBBalance, getTokenBalance, hasSwapAllowance, approve, approveSwap, getSwapRate, deposit, withdraw }
export { approveLPStaking, getFarmingPoolLiqudity, checkFarmingAllowance, getFarmingLPStaked, getFarmingLPStakingReward }
export { approveAssetStaking, checkStakingAllowance, getStakingPoolLiqudity, getStakingTokenStaked, getStakingTokenBalance }
export { depositStakingToken, withdrawStakingToken, harvestStakingOUROReward, harvestStakingOGSReward }
export { getLPTokenBalance, depositLPToken, withdrawLPToken, harvestFarmingReward, getFarmingReward }
export { getStakingReward, checkStakingOUROPoolUnlockedReward, checkStakingOUROPoollockedReward, harvestStakingOUROPoolReward }
export { checkStakingOGSReward, checkStakingOUROReward, getFarmingPoolUSDWorth, checkStakingOUROPoolTotalReward }
export { checkStakingOUROPoolVested, vestStakingOUROPoolReward, claimStakingOUROPoolWithPenalty, claimStakingOUROPoolUnlocked }
export { calcuateOUROAPR }
export { getOGSStakingPoolLiqudity, checkOGSStakingOGSReward }
export { getOGSBlockReward, getOGSStackingBalance, harvestStakingAutoOGSReward }