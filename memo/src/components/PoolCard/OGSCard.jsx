import React, { useContext, useState, useEffect } from "react";
import { Box, Paper, Typography, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Button from "../Button/CustomButton";
import NumberFormat from "react-number-format";
import CountUp from "react-countup";
import Skeleton from "@material-ui/lab/Skeleton";
import { OPTIONS, Icon } from "../Icon";
import { ACTIONS, PoolContext } from "../../contexts/PoolContext";
import StakingMessage from "./StakingMessage";
import { useWeb3React } from "@web3-react/core"
import { web3Context } from "../../contexts/web3Context";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { useHistory } from "react-router-dom";
import { getAutoOGSAPR, getAutoOGSAPY } from "../../utils/apr";
import {
  getOGSBlockReward,
  getOGSStackingBalance,
  approveAssetStaking,
  checkStakingAllowance,
  harvestStakingAutoOGSReward,
  checkOGSStakingOGSReward,
  harvestStakingOUROReward,
  harvestStakingOGSReward,
  getOGSStakingPoolLiqudity,
  checkStakingOGSReward,
  checkStakingOUROReward,
  checkStakingOUROPoollockedReward,
  checkStakingOUROPoolTotalReward,
  harvestStakingOUROPoolReward,
  checkStakingOUROPoolVested,
  checkStakingOUROPoolUnlockedReward,
  claimStakingOUROPoolWithPenalty,
  claimStakingOUROPoolUnlocked,
  calcuateOUROAPR,

  getOGSPrice
} from "../../utils/contract";
import { toast } from "react-hot-toast";
import Grow from "@material-ui/core/Grow";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 340,
    padding: "24px",
    [theme.breakpoints.down("xs")]: {
      padding: "24px 16px 16px 16px",
    },
    borderRadius: "32px",
    position: "relative",
    zIndex: 1000,
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05);",
  },
  tokenText: {
    fontSize: "24px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "18px",
    },
  },
  aprText: {
    fontSize: "24px",
    fontWeight: "600",
    [theme.breakpoints.down("xs")]: {
      fontSize: "18px",
    },
  },
  title:{
    color: "#8F9688"
  },
  tokenEarnText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#8F9688",
  },
  tokenIcon: {
    marginRight: "10px",
  },
  tokenNumber: {
    fontWeight: 700,
  },
  stakeBtn: {
    padding: "9px 36px 9px 36px",
    height: "40px",
  },
  harvestBtnDisabled: {
    fontWeight: 700,
    color: "#BBB",
  },
  harvestBtnActive: {
    fontWeight: 700,
    color: "#6DA024",
    cursor: "pointer",
  },
  buyBtn: {
    fontWeight: 300,
    fontSize: "14px",
    color: "#6DA024",
    cursor: "pointer",
  },
  rowMargin: {
    marginBottom: "16px",
    [theme.breakpoints.down("xs")]: {
      marginBottom: "8px",
    },
  },
  divider: {
    marginTop: "24px",
    marginBottom: "24px",
    backgroundColor: "#EEEEEE",
  },
}));

/**
 * Display elements as a a row and justify items in space-between
 * @return  {[type]}  [return description]
 */
const Row = (props) => {
  const { children } = props;
  return (
    <Box
      display="flex"
      alignItems="flex-end"
      justifyContent="space-between"
      {...props}
    >
      {children}
    </Box>
  );
};

function HarvestDropdown(props) {

  const { classes } = props
  const { canVestReward, vestReward } = props
  const { canClaimWithPenalty, claimRewardWithPenalty } = props
  const { canClaimUnlocked, claimRewardUnlocked } = props

  const buttonActive = canVestReward || canClaimUnlocked || canClaimWithPenalty

  const [anchorEl, setAnchorEl] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {/* <Typography
            variant="subtitle2"
            onClick={handleClick}
            className={ buttonActive ? classes.harvestBtnActive : classes.harvestBtnDisabled}
          >
            Harvest
      </Typography> */}
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={vestReward} disabled={!canVestReward}>
          Vest Reward
        </MenuItem>
        <MenuItem onClick={claimRewardWithPenalty} disabled={!canClaimWithPenalty}>
          Harvest with penalty
        </MenuItem>
        <MenuItem onClick={claimRewardUnlocked} disabled={!canClaimUnlocked}>
          Harvest Unlocked
        </MenuItem>
      </Menu>
    </>
  );
}

const TokenEarned = (
  ogsEarned,
  ouroEarned,
  stakingToken,
  approved,
  loadingData,
  callback
) => {

  const classes = useStyles();
  const hasReward = ogsEarned > 0 || ouroEarned > 0
  const ouroHasReward = ouroEarned > 0 && approved
  const canHarvest = hasReward && approved
  const isOuro = stakingToken === 'OURO'
  const canClaim = isOuro ? ouroHasReward : canHarvest

  return (
    <Row mt="16px">
      <Box display="flex">
        <Box display="block" mr="10px">
          <Typography className={classes.tokenEarnText}>
            {isOuro ? 'OGS Rewards' : 'OGS Position'}
          </Typography>
          <Typography variant="subtitle2" className={classes.tokenNumber}>
            {loadingData ? (
              <Skeleton width="80px" />
            ) : (
              <NumberFormat
                value={parseFloat(ogsEarned).toFixed(3)}
                displayType={"text"}
                thousandSeparator={true}
              />
            )}
          </Typography>
        </Box>
      </Box>

      {/* <Typography
        variant="subtitle2"
        onClick={canClaim ? callback : () => {}}
        className={
          canClaim
            ? classes.harvestBtnActive
            : classes.harvestBtnDisabled
        }
      >
        Harvest
      </Typography> */}
    </Row>
  );
};

const OuroPoolTokenEarned = (ogsRewards, ogsLocked, ogsUnlocked, ogsVested, stakingToken, approved, callbacks) => {

  const classes = useStyles();
  const [ vestCallback, claimRewardWithPenalty, claimRewardUnlocked ] = callbacks
  const hasReward = ogsLocked > 0 || ogsLocked > 0

  return (
    <>
    <Row mt="16px">
      <Box display="flex">
        <Box display="block" mr="10px">
          <Typography className={classes.tokenEarnText}>
            OGS Rewards
          </Typography>
          <Typography variant="subtitle2" className={classes.tokenNumber}>
            <NumberFormat
              value={parseFloat(ogsRewards + ogsLocked + ogsUnlocked).toFixed(3)}
              displayType={"text"}
              thousandSeparator={true}
            />
          </Typography>
        </Box>
        <Box display="block" mr="10px">
          <Typography className={classes.tokenEarnText}>
            OGS Locked
          </Typography>
          <Typography variant="subtitle2" className={classes.tokenNumber}>
            <NumberFormat
              value={parseFloat(ogsLocked).toFixed(3)}
              displayType={"text"}
              thousandSeparator={true}
            />
          </Typography>
        </Box>
      </Box>
      <HarvestDropdown
        canVestReward={ogsRewards > 0}
        vestReward={vestCallback}
        claimRewardWithPenalty={claimRewardWithPenalty}
        canClaimWithPenalty={ogsLocked > 0}
        claimRewardWithPenalty={claimRewardWithPenalty}
        canClaimUnlocked={ogsUnlocked > 0}
        claimRewardUnlocked={claimRewardUnlocked}
        classes={classes}
      />
    </Row>
    <Row>
    </Row>
</>
  );
};

const stakingMessage = (tokenSymbol, hasStaked, pendingVestReward, timeLeft) => {
  // if (tokenSymbol.toLowerCase() === "ouro") {
  //   return hasStaked ? (
  //     <StakingMessage staked timeLeft={timeLeft} />
  //   ) : (
  //     <StakingMessage />
  //   );
  // } else 
  return <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            my="10px"
            padding="5px"
            style={{
              backgroundColor: "#F6F6F6",
              borderRadius: "10px",
            }}
          >
            <Typography color="textSecondary" style={{ fontSize: "12px" }}>
              Your rewards in Augo OGS will be compounded once per day
            </Typography>
          </Box>
};

export default function PoolCard({ data }) {

  const classes = useStyles();
  const history = useHistory()

  const {
    token,
    // apr,
    earn,
    // liquidity,
    // tokenStaked,
    // ogsEarned,
    // ouroEarned,
    // hasStaked,
    timeLeft,
  } = data;
  const [ouroAPR, setOUROAPR] = useState(0)
  const { pool, poolDispatch } = useContext(PoolContext);
  const { web3 } = useContext(web3Context);
  const [approved, setHasAllance] = useState(true);
  const [ogsEarned, setOgsEarned] = useState(0);
  const [ogsUnlocked, setOgsUnlocked] = useState(0);
  const [ogsVested, setOgsVested] = useState(0)
  const [ouroEarned, setOuroEarned] = useState(0);
  const [ogsLocked, setOgsLocked] = useState(0);
  const [apr, setAPR] = useState(0);
  const [tokenStakedAmount, setTokenStakedAmount] = useState(0);
  const [poolLiqudity, setPoolLiqudity] = useState(0);
  const [loading, setLoading] = useState(false);
  // loadingData handles the data loading when initialized.
  const [loadingData, setLoadingData] = useState(false);

  const { active, account, library, connector, activate, deactivate, chainId } = useWeb3React()
  const { w3 } = web3;

  const connecetToWeb3 = account && chainId && w3;

  const hasStaked = tokenStakedAmount > 0
  const isOuro = token.symbol === 'OURO'
  const pendingVestReward = isOuro && ogsEarned > 0

  const openStakeModal = () => {
    poolDispatch({ type: ACTIONS.OPEN_STAKE_MODAL });
    poolDispatch({ type: ACTIONS.SET_CURRENT_MODAL, payload: { data: data } });
    poolDispatch({
      type: ACTIONS.SET_CURRENT_MODAL_TYPE,
      payload: { type: 'stake' },
    });
  };

  const openRemoveModal = () => {
    poolDispatch({ type: ACTIONS.OPEN_STAKE_MODAL });
    poolDispatch({ type: ACTIONS.SET_CURRENT_MODAL, payload: { data: data } });
    poolDispatch({
      type: ACTIONS.SET_CURRENT_MODAL_TYPE,
      payload: { type: 'remove' },
    });
  };  

  const openPancake = () => {
    if (isOuro) {
      history.replace('/reserve')
    } else {
      window.open("https://pancakeswap.finance/swap");
    }
  }

  const approveContract = async () => {
    try {
      setLoading(true);
      const result = await approveAssetStaking(
        library,
        chainId,
        token.symbol,
        account
      );
      console.log(result);
      readStakingInfo();
    } catch (e) {
      console.log(e);
      const err = e.message || "Error Happens!";
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calcApr = async () => {
    const blockReward = await getOGSBlockReward(w3, chainId)
    // const rewardTokenPrice = await getOuroPrice(library, chainId);
    const rewardTokenPrice = await getOGSPrice(w3, chainId)
    const OgsStackingBalance = await getOGSStackingBalance(w3, chainId)
    console.log(391, blockReward)
    console.log(389, rewardTokenPrice)
    console.log(390, OgsStackingBalance)
    const AutoOGSApr = await getAutoOGSAPR(blockReward, rewardTokenPrice, OgsStackingBalance)
    console.log(395, AutoOGSApr)
    const dailyCompoundTime = 10
    const AutoOGSApy = await getAutoOGSAPY(AutoOGSApr, dailyCompoundTime)
    console.log(AutoOGSApy)
    if(apr === '0.00') {
      setAPR('infinity')
    } else {
      setAPR(AutoOGSApy)
    }
  };

  const readStakingInfo = async () => {
    setLoadingData(false)
    // alert(connecetToWeb3)
    if (connecetToWeb3) {
      const poolLiqudity = await getOGSStakingPoolLiqudity(
        w3,
        token.symbol,
        chainId
      );
      setPoolLiqudity(poolLiqudity);
      await calcApr();
      if (token.symbol === "BNB") {
        setHasAllance(true);
      } else {
        const approved = await checkStakingAllowance(
          library,
          token.symbol,
          chainId,
          account
        );
        setHasAllance(approved);
      }
      
      console.log(436)
        const ogsEarned = await checkOGSStakingOGSReward(
          w3,
          token.symbol,
          chainId,
          account
        );
        setOgsEarned(ogsEarned);
    console.log(444)

    } else {
      const poolLiqudity = await getOGSStakingPoolLiqudity(
        w3,
        token.symbol,
        chainId
      );
      setPoolLiqudity(poolLiqudity);
      await calcApr()
      // setHasAllance(false);
      setLoading(false);
    }
    setLoadingData(false)
  };

  const vestRewards = async () => {
    try {
      setLoading(true);
      await harvestStakingOUROPoolReward(library, chainId, account)
      readStakingInfo()
    } catch (e) {
      console.log(e);
      const err = e.message || "Error Happens!";
      toast.error(err);
    } finally {
      setLoading(false);
    }
    
  }

  const claimRewardWithPenalty = async () => {
    try {
      setLoading(true);
      await claimStakingOUROPoolWithPenalty(library, chainId, account)
      readStakingInfo()
    } catch (e) {
      console.log(e);
      const err = e.message || "Error Happens!";
      toast.error(err);
    } finally {
      setLoading(false);
    }
    
  }

  const claimRewardUnlocked = async () => {
    try {
      setLoading(true);
      await claimStakingOUROPoolUnlocked(library, chainId, account)
      readStakingInfo()
    } catch (e) {
      console.log(e);
      const err = e.message || "Error Happens!";
      toast.error(err);
    } finally {
      setLoading(false);
    }
    
  }

  const claimReward = async () => {
    try {
      setLoading(true);
      const result = await harvestStakingAutoOGSReward(
        library,
        chainId,
        token.symbol,
        account
      );
      console.log(result)
      readStakingInfo();
    } catch (e) {
      console.log(e);
      const err = e.message || "Error Happens!";
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createButton = (disabled, callback, text) => {
    return (
      <>
        <Box mt="16px">
          <Button
            variant="contained"
            fullWidth
            color="primary"
            disabled={disabled}
            onClick={callback}
            className={classes.stakeBtn}
          >
            {text}
          </Button>
        </Box>
      </>
    );
  };

  const renderButton = () => {
    if (!connecetToWeb3) {
      return createButton(true, () => {}, "Unlock Wallet");
    } else if (loading) {
      return createButton(true, () => {}, "Confirming...");
    } else if (!approved) {
      return createButton(false, approveContract, "Approve Contract");
    } else {
      return createButton(false, openStakeModal, "Stake LP");
    }
  };

  const refreshReward = async () => {
    if(connecetToWeb3) {
      if (isOuro) {
        const ogsReward = await checkStakingOUROPoolTotalReward(w3, chainId, account)
        const ogsLocked = await checkStakingOUROPoollockedReward(w3, chainId, account)
        const ogsVested = await checkStakingOUROPoolVested(w3, chainId, account)
        const ogsUnlocked = await checkStakingOUROPoolUnlockedReward(w3, chainId, account)
        setOgsVested(ogsVested)
        setOgsEarned(ogsReward)
        setOgsLocked(ogsLocked)
        setOgsUnlocked(ogsUnlocked)
      } else {
        const ogsEarned = await checkStakingOGSReward(
          w3,
          token.symbol,
          chainId,
          account
        );
        setOgsEarned(ogsEarned);
        const ouroEarned = await checkStakingOUROReward(
          w3,
          token.symbol,
          chainId,
          account
        );
        setOuroEarned(ouroEarned);
      }
    }
  }

  const readOUROAPR = async () => {
    if(!isOuro) {
      const resp = await calcuateOUROAPR(w3, chainId, `V${token.symbol}`, account)
      setOUROAPR(resp)
    }
  }

  useEffect(() => {
    readStakingInfo();
    // readOUROAPR()
  }, []);

  useEffect(() =>{
    readStakingInfo();
  }, [account, chainId, library])

  useEffect(() => {
    readStakingInfo()
  }, [pool.stakeModalToggled])

//   useEffect(() => {
//     setInterval(async ()=>{
//       await refreshReward()
//     }, 1000 * 5);
//   }, []);

  return (
    <Grow in={true}>
      <Paper className={classes.root} elevation={2}>
        <Box display="flex" alignItems="center">
          {/* <IconGroup tokenPair={tokenPair} /> */}
          <Icon
            size="32px"
            type={OPTIONS.TYPE.TOKENS[token.symbol.toLowerCase()]}
            className={classes.tokenIcon}
            alt="token"
          />
          <Typography variant="h2">Auto {token.symbol} </Typography>
        </Box>
        {/* APR */}
        <Row mt="24px" className={classes.rowMargin}>
          <Typography variant="body1" className={classes.title}>
            APR
          </Typography>
          <Typography className={classes.aprText}>
            {loadingData ? (
              <Skeleton width="150px" />
            ) : (
              <>
                {/* <CountUp
                  decimals={2}
                  separator=","
                  end={apr * 100}
                  duration={1}
                /> */}

                <span style={{color: "#74EDE7"}}>
                {
                  apr === 'infinity' ? 0 : `${(parseFloat(apr) * 100).toFixed(2)}%`
                }
                </span>
              </>
            )}
          </Typography>
        </Row>
        {/* EARN */}
        <Row className={classes.rowMargin}>
          <Typography variant="body1" className={classes.title}>
            Earn
          </Typography>
          <Typography variant="body1">
            {loadingData ? <Skeleton width="150px" /> : earn}
          </Typography>
        </Row>
        {/* LIQUIDITY */}
        <Row className={classes.rowMargin}>
          <Typography variant="body1" className={classes.title}>
            Total Staked
          </Typography>
          <Typography variant="body1">
            {loadingData ? (
              <Skeleton width="150px" />
            ) : (
              <NumberFormat
                value={poolLiqudity}
                displayType={"text"}
                thousandSeparator={true}
                prefix={""}
              />
            )}
          </Typography>
        </Row>
        <Divider className={classes.divider} />
        {/* TOKEN EARNED */}
        {isOuro ? 
        OuroPoolTokenEarned(ogsEarned, ogsLocked, ogsUnlocked, ogsVested, token.symbol, approved, [vestRewards, claimRewardWithPenalty, claimRewardUnlocked] ) :
        TokenEarned(ogsEarned, ouroEarned, token.symbol, approved, loadingData, claimReward)
        }
        <Divider className={classes.divider} />
        {/* STAKING MESSAGE & COUNTDOWN */}
        {stakingMessage(token.symbol, hasStaked, pendingVestReward, timeLeft)}
 
        {/* LP STAKED */}
        {approved ? (
          <>
            {/* <Row mt="16px">
              <Box display="block">
                <Typography variant="body2" className={classes.title}>
                  {token.symbol} Staked
                </Typography>
                <Typography variant="subtitle2" className={classes.tokenNumber}>
                  {loadingData ? (
                    <Skeleton width="150px" />
                  ) : (
                    <NumberFormat
                      value={tokenStakedAmount}
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  )}
                </Typography>
              </Box>
            </Row>
           */}
            <Row display="flex" alignItems="center" mt="16px">
              
              <Box display="block" onClick={openPancake}>
                <Typography className={classes.buyBtn}>
                  {
                    isOuro ? 'Mint Ouro' : `Buy ${token.symbol}`
                  }
                </Typography>
              </Box>
          
              <Box display="block">
                <Typography 
                  className={classes.buyBtn} 
                  onClick={openRemoveModal}>
                  Unstake
                </Typography>
              </Box>

              <Button
                style={{marginLeft: 15}}
                variant="contained"
                color="primary"
                className={classes.stakeBtn}
                onClick={openStakeModal}
              >
                Stake
              </Button>

            </Row>

          </>
        ) : (
          renderButton()
        )}
      </Paper>
    </Grow>
  );
}
