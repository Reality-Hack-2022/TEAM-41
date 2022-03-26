import React, { useContext, useEffect, useState } from "react";
import { Box, Paper, Typography, Divider } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import Grow from "@material-ui/core/Grow";
import { makeStyles } from "@material-ui/core/styles";
import Button from "../Button/CustomButton";
import { buildLPString } from "../../utils/helpers";
import NumberFormat from "react-number-format";
import CountUp from "react-countup";
import { useWeb3React } from "@web3-react/core"
import IconGroup from "./IconGroup";
import { ACTIONS, FarmContext } from "../../contexts/FarmContext";
import { CONTRACT_ADDRESS } from '../../utils/constant'
import {
  approveLPStaking,
  getFarmingPoolLiqudity,
  checkFarmingAllowance,
  getFarmingLPStaked,
  getFarmingLPStakingReward,
  harvestFarmingReward,
  getFarmingReward,
  getFarmingPoolUSDWorth,
  getOGSPrice,
} from "../../utils/contract";
import { web3Context } from "../../contexts/web3Context";
import { getFarmApr } from "../../utils/apr";
import { toast } from "react-hot-toast";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 340,
    padding: "25px",
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
    fontWeight: "700",
    [theme.breakpoints.down("xs")]: {
      fontSize: "18px",
    },
  },
  tokenEarnText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#8F9688",
  },
  aprText: {
    fontSize: "24px",
    fontWeight: "600",
    [theme.breakpoints.down("xs")]: {
      fontSize: "18px",
    },
  },
  stakedText:{
    fontSize: '14px',
    color: '#8F9688'
  },
  tokenPairIcon: {
    marginRight: "20px",
  },
  tokenIcon: {
    backgroundColor: "#fff",
    marginRight: "-2px",
    border: "none",
  },
  tokenNumber: {
    fontWeight: 700,
  },
  stakeBtn: {
    padding: "9px 36px 9px 36px",
    height: "40px",
  },
  harvestBtnDisabled: {
    [theme.breakpoints.down("xs")]: {
      fontSize: "14px",
    },
    fontWeight: 700,
    color: "#BBB",
  },
  harvestBtnActive: {
    [theme.breakpoints.down("xs")]: {
      fontSize: "14px",
    },
    fontWeight: 700,
    color: "#6DA024",
    cursor: "pointer",
  },
  title: {
    color: "#8F9688",
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
  buyBtn: {
    fontWeight: 300,
    fontSize: "14px",
    color: "#6DA024",
    cursor: "pointer",
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

export default function StakeTokenCard({ data }) {
  const { web3 } = useContext(web3Context);
  const [hasAllowance, setHasAllance] = useState(true);
  const [reward, setReward] = useState(0);
  const [lpStakedAmount, setLPStakedAmount] = useState(0);
  const [poolLiqudity, setPoolLiqudity] = useState(0);
  const [apr, setAPR] = useState(0);
  const [loading, setLoading] = useState(false);
  // loadingData handles the data loading when initialized.
  const [loadingData, setLoadingData] = useState(true);

  const { active, account, library, connector, activate, deactivate, chainId } = useWeb3React()
  const { w3 } = web3;
  const connecetToWeb3 = account && chainId && w3;

  const classes = useStyles();

  const { tokenPair, earn } = data;
  const { farm, farmDispatch } = useContext(FarmContext);
  const currentLP = buildLPString(tokenPair);

  const openStakeModal = () => {
    farmDispatch({ type: ACTIONS.SET_CURRENT_MODAL, payload: { data: data } });
    farmDispatch({ type: ACTIONS.OPEN_STAKE_MODAL });
    farmDispatch({
      type: ACTIONS.SET_CURRENT_MODAL_TYPE,
      payload: { type: 'stake' },
    });
  };

  const openRemoveModal = () => {
    farmDispatch({ type: ACTIONS.OPEN_STAKE_MODAL });
    farmDispatch({ type: ACTIONS.SET_CURRENT_MODAL, payload: { data: data } });
    farmDispatch({
      type: ACTIONS.SET_CURRENT_MODAL_TYPE,
      payload: { type: 'remove' },
    });
  };  

  const openPancake = () => {
    const tokenA = tokenPair[0].symbol
    const tokenB = tokenPair[1].symbol
    const chainId = '56'
    const tokenAAddress = CONTRACT_ADDRESS[tokenA][chainId]
    const tokenBAddress = CONTRACT_ADDRESS[tokenB][chainId]
    window.open(`https://pancakeswap.finance/add/${tokenAAddress}/${tokenBAddress}`);
  }

  const approveContract = async () => {
    try {
      setLoading(true);
      const result = await approveLPStaking(
        library,
        chainId,
        tokenPair,
        account
      );
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

    const blockReward = await getFarmingReward(w3, tokenPair, chainId)
    const poolLiqudityUSD = await getFarmingPoolUSDWorth(w3, chainId, tokenPair)

    const ogsPrice = await getOGSPrice(w3, chainId)
    const apr = getFarmApr(blockReward, ogsPrice, poolLiqudityUSD)
    if(apr === '0.00') {
      setAPR('infinity')
    } else {
      setAPR(apr)
    }
  }

  const readStakingInfo = async () => {
    setLoadingData(false)
    if (connecetToWeb3) {
      await calcApr();
      const hasAllowance = await checkFarmingAllowance(
        library,
        tokenPair,
        chainId,
        account
      );
      setHasAllance(hasAllowance);
      const poolLiqudity = await getFarmingPoolUSDWorth(library, chainId, tokenPair);
      setPoolLiqudity(poolLiqudity);
      const LpStaked = await getFarmingLPStaked(
        library,
        tokenPair,
        chainId,
        account
      );
      setLPStakedAmount(LpStaked);
      const ogsEarned = await getFarmingLPStakingReward(
        library,
        tokenPair,
        chainId,
        account
      );
      setReward(ogsEarned);
      setLoadingData(false);
    } else {
      await calcApr();
      const poolLiqudity = await getFarmingPoolUSDWorth(w3, chainId, tokenPair);
      setPoolLiqudity(poolLiqudity);
      // setHasAllance(false);
      setLPStakedAmount(0);
      setReward(0);
      setLoadingData(false);
    }
  };

  const harvestReward = async () => {
    try {
      setLoading(true);
      const result = await harvestFarmingReward(
        library,
        chainId,
        tokenPair,
        account
      );
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
    } else if (!hasAllowance) {
      return createButton(false, approveContract, "Approve Contract");
    } else {
      return createButton(false, openStakeModal, "Stake LP");
    }
  };

  useEffect(() => {
    readStakingInfo();
  }, []);

  useEffect(() =>{
    readStakingInfo();
  }, [account, chainId, library])

  const refreshReward = async () => {
    if(connecetToWeb3) {
      const ogsEarned = await getFarmingLPStakingReward(
        library,
        tokenPair,
        chainId,
        account
      );
      setReward(ogsEarned);
    }
  }

  useEffect(() => {
    setInterval(async ()=>{
      await refreshReward()
    }, 1000 * 5);
  }, []);

  useEffect(() => {
    readStakingInfo();
  }, [farm.stakeModalToggled, web3]);

  return (
    <Grow in={true}>
      <Paper className={classes.root}>
        <Box display="flex" alignItems="center">
          <IconGroup tokenPair={tokenPair} />
          <Typography className={classes.tokenText}>{currentLP}</Typography>
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
              <span style={{color: "#74EDE7"}}>
                {
                  apr === 'infinity' ? 'infinity' : `${parseFloat(apr).toFixed(2)}%`
                }
              </span>
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
            Liquidity
          </Typography>
          <Typography variant="body1">
            {loadingData ? (
              <Skeleton width="150px" />
            ) : (
              <NumberFormat
                value={poolLiqudity}
                displayType={"text"}
                thousandSeparator={true}
                prefix={"$"}
              />
            )}
          </Typography>
        </Row>
        <Divider className={classes.divider} />
        {/* TOKEN EARNED */}
        <Row className={classes.rowMargin}>
          <Typography variant="body2" className={classes.tokenEarnText}>
            {earn} Earned
          </Typography>
        </Row>
        <Row mt="10px">
          <Typography variant="subtitle2" className={classes.tokenNumber}>
            {loadingData ? (
              <Skeleton width="150px" />
            ) : (
              <>
                {hasAllowance ? (
                  <NumberFormat
                    value={parseFloat(reward).toFixed(3)}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                ) : (
                  "--"
                )}
              </>
            )}
          </Typography>
          <Typography
            variant="subtitle2"
            onClick={!loading && connecetToWeb3 ? harvestReward : () => {}}
            className={
              reward > 0 && hasAllowance && !loading && connecetToWeb3
                ? classes.harvestBtnActive
                : classes.harvestBtnDisabled
            }
          >
            Harvest
          </Typography>
        </Row>
        {/* LP STAKED */}
        {hasAllowance ? (
          <>
            <Row mt="16px">
              <Box display="block">
                <Typography className={classes.tokenEarnText}>
                  {currentLP} Staked
                </Typography>
                <Typography variant="subtitle2" className={classes.tokenNumber}>
                  {loadingData ? (
                    <Skeleton width="150px" />
                  ) : (
                    <NumberFormat
                      value={lpStakedAmount}
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  )}
                </Typography>
              </Box>

            </Row>
        
            <Row display="flex" alignItems="center" mt="16px">
              
              <Box display="block" onClick={openPancake}>
                <Typography className={classes.buyBtn}>
                  Form LP
                </Typography>
              </Box>
          
              <Box display="block">
                <Typography 
                  className={classes.buyBtn} 
                  onClick={openRemoveModal}>
                  Unstake LP
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
