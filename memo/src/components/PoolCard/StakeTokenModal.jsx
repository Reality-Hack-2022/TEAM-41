import React, { useContext, useState, useEffect } from "react";
import Modal from "../Modal";
import { Typography, Paper, Box, Grid, InputBase } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Button from "../Button/CustomButton";
import { ACTIONS, PoolContext } from "../../contexts/PoolContext";
import { Icon, OPTIONS } from "../../components/Icon";
import { web3Context } from "../../contexts/web3Context";
import OuroSlider from '../../components/Slider'
import { useWeb3React } from "@web3-react/core"
import {
  getStakingTokenBalance,
  getStakingTokenStaked,
  depositStakingToken,
  harvestStakingAutoOGSReward,
  withdrawStakingToken,
  checkOGSStakingOGSReward
} from "../../utils/contract";
import toast from "react-hot-toast";


const useStyles = makeStyles((theme) => ({
  root: {
    // width: 300,
  },
  slider: {
    paddingTop: 20,
    paddingLeft: 20, 
    paddingRight: 20, 
    textAlign: "center"
  },
  tab: {
    cursor: "pointer",
  },
  tabText: {
    fontWeight: 600,
  },
  paper: {
    marginTop: "24px",
    width: "400px",
    [theme.breakpoints.down("xs")]: {
      width: "250px",
    },
    padding: "15px",
    backgroundColor: "#F6F6F6",
  },
  warning: {
    // border: "1px solid #F44B4B",
  },
  warningText: {
    marginLeft: "5px",
    color: "#F44B4B",
  },
  underline: {
    height: "4px",
    backgroundColor: "#9DD251",
    position: "relative",
    top: "20px",
  },
  balance: {
    color: "#6DA024",
    fontWeight: 600,
    cursor: "pointer",
  },
  actionBtn: {
    padding: "9px 36px",
    width: "95%",
    marginLeft: "10px",
    textTransform: "none",
  },
  textField: {
    "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
      "-webkit-appearance": "none",
      margin: "0",
    },
    align: "right",
    textAlign: "right",
    "& input": {
      textAlign: "right",
    },
    fontSize: "18px",
    fontWeight: "600",
  },
  tokenIcon: {
    marginRight: "5px",
  },
}));

/**
 *  Tab element. It will display the underline when selected is true
 *  @param {boolean} selected
 */
const Tab = ({ children, selected, ...other }) => {
  const classes = useStyles();
  return (
    <Box mr="25px" className={classes.tab} {...other}>
      <Typography
        className={classes.tabText}
        variant="subtitle2"
        color={selected ? "" : "textSecondary"}
      >
        {children}
      </Typography>
      {selected && <div className={classes.underline} />}
    </Box>
  );
};

/**
 * Tabs, a container/collection of tab
 */
const Tabs = () => {

  const { pool, poolDispatch } = useContext(PoolContext);
  const { stakeModalType, stakeModalData } = pool;
  const { outdated, token } = stakeModalData;

  const setType = (type) => {
    poolDispatch({
      type: ACTIONS.SET_CURRENT_MODAL_TYPE,
      payload: { type: type },
    });
  };

  return (
    <Box display="flex">
      <Tab
        selected={stakeModalType === "stake"}
        onClick={() => {
          if(!outdated) {
            setType("stake")
          }
        }}
      >
        {"Stake Token"}
      </Tab>
      <Tab
        selected={stakeModalType === "remove"}
        onClick={() => {
          setType("remove")
        }}
      >
        {"Unstake Token"}
      </Tab>
    </Box>
  );
};

export default function StakeTokenModal() {
  const classes = useStyles();

  // State to control user input on stake/unstake
  // Maybe we can put it in context if necessary when connecting to web3
  const [inputVal, setInputVal] = useState(0);
  const [isValidBal, setIsValidBal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenStaked, setTokenStaked] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const { pool, poolDispatch } = useContext(PoolContext);
  const { stakeModalToggled, stakeModalType, stakeModalData } = pool;

  const { outdated } = stakeModalData
  const { token } = stakeModalData;

  const { web3 } = useContext(web3Context);

  const { active, account, library, connector, activate, deactivate, chainId } = useWeb3React()
  const { w3 } = web3;

  const [percent, setPercent ] = useState(0)
  /**
   * Use loading state to handle loading logic on useEffect Hook
   */

  useEffect(() => {
    if (token) {
      setInitialized(true);
    }
  }, [token]);

  useEffect(() => {
    setInputVal(0)
    setPercent(0)
  }, [stakeModalType])

  const onClose = () => {
    poolDispatch({ type: ACTIONS.CLOSE_STAKE_MODAL });
    setInputVal("");
    setIsValidBal(true);
    setLoading(false)
  };

  const onChangeInput = (e) => {
    const value = parseFloat(e.target.value);
    // Check if the input is a valid number
    if (!isNaN(e.target.value)) {
      setInputVal(e.target.value);
    }
    if (stakeModalType === "stake" && value > tokenBalance) {
      setIsValidBal(false);
      setErrorMsg("Insufficient Balance");
    } else if (stakeModalType === "remove" && value > tokenStaked) {
      setIsValidBal(false);
      setErrorMsg("Insufficient Balance");
    } else if (e.target.value.trim().length === 0) {
      setIsValidBal(false);
      setErrorMsg("");
    } else {
      setIsValidBal(true);
    }
  };

  const readStakingTokenInfo = async () => {
    if (token) {
      try {
        const tokenBalance = await getStakingTokenBalance(
          w3,
          chainId,
          token.symbol,
          account
        );
        setTokenBalance(tokenBalance);
        if(token.symbol !== 'OGS') {
            const stakedTokenAmount = await getStakingTokenStaked(
            w3,
            token.symbol,
            chainId,
            account,
            outdated
          );
          setTokenStaked(stakedTokenAmount);
        } else {
          const ogsPosition = await checkOGSStakingOGSReward(
            w3,
            token.symbol,
            chainId,
            account
          );
          setTokenStaked(ogsPosition);
        }
      } catch (e) {
        toast.error("Error Occurs when reading pool info!");
      }
    }
  };

  const stakeAsset = async () => {
    try {
      setLoading(true);
      const result = await depositStakingToken(
        library,
        chainId,
        token.symbol,
        inputVal,
        account
      );
      console.log(result);
      toast.success("successfully staked token!");
      readStakingTokenInfo();
      onClose();
    } catch (e) {
      console.log(e);
      const err = e.message || "Error Happens!";
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const withdrawAsset = async () => {
    if(token.symbol === 'OGS') {
      await removeAssetOGS()
    } else {
      await removeAsset()
    }
  }

  const removeAssetOGS = async () => {
    try {
      setLoading(true);
      const result = await harvestStakingAutoOGSReward(
        library,
        chainId,
        token.symbol,
        inputVal,
        account
      );
      console.log(result)
      toast.success("successfully remove ogs position!");
      readStakingTokenInfo();
      onClose();
    } catch (e) {
      console.log(296, e);
      const err = e.message || "Error Happens!";
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };


  const removeAsset = async () => {
    try {
      setLoading(true);
      const result = await withdrawStakingToken(
        library,
        chainId,
        token.symbol,
        inputVal,
        account,
        outdated
      );
      toast.success("successfully remove staking token!");
      readStakingTokenInfo();
      onClose();
    } catch (e) {
      console.log(e);
      const err = e.message || "Error Happens!";
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    readStakingTokenInfo();
  }, [token]);

  useEffect(() => {
    setLoading(false);
  }, [])

  return (
    <Modal
      open={stakeModalToggled}
      onClose={onClose}
      title={`Token Staking Pool`}
      TitleProps={{
        onClose: onClose,
      }}
    >
      <Box mb="50px">
      <Box minWidth="100px" style={{marginBottom: "50px"}}>
          <Tabs />
      </Box>
        <Paper
          elevation={0}
          className={
            isValidBal ? classes.paper : `${classes.paper} ${classes.warning}`
          }
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" color="textSecondary">
              {stakeModalType === "stake" ? "Stake" : "Remove"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {stakeModalType === "stake" ? "Balance" : "Balance"}&nbsp;
              <Typography
                display="inline"
                variant="body2"
                className={classes.balance}
                onClick={() =>
                  setInputVal(
                    stakeModalType === "stake" ? tokenBalance : tokenStaked
                  )
                }
              >
                {stakeModalType === "stake" ? parseFloat(tokenBalance).toFixed(4) : parseFloat(tokenStaked).toFixed(4)}
              </Typography>
            </Typography>
          </Box>
          <Box
            mt="12px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {initialized && (
              <Box display="flex">
                <Icon
                  size="20px"
                  type={OPTIONS.TYPE.TOKENS[token.symbol.toLowerCase()]}
                  className={classes.tokenIcon}
                  alt="token"
                />
                <Typography variant="h4">{token.symbol}</Typography>
              </Box>
            )}
            <InputBase
              variant="outlined"
              className={classes.textField}
              placeholder="0.0"
              onChange={onChangeInput}
              value={inputVal}
            />
          </Box>
        </Paper>
        {!isValidBal && (
          <Box mt="10px">
            <Typography variant="body2" className={classes.warningText}>
              {errorMsg}
            </Typography>
          </Box>
        )}
      <Box className={classes.slider}>
          <OuroSlider
            val={inputVal}
            onChange={setInputVal}
            percent={percent}
            setPercent={setPercent}
            balance={ stakeModalType === "stake" ? tokenBalance : tokenStaked }
          />
      </Box>
      </Box>
      {/* BUTTON ACTIONS */}
      <Grid direction="row" container space={2}>
        <Grid item xs={6}>
          <Button
            className={classes.actionBtn}
            disableRipple
            disableElevation
            variant="contained"
            style={{ color: "#233433" }}
            onClick={onClose}
          >
            Cancel
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            className={classes.actionBtn}
            fullWidth
            disableRipple
            disableElevation
            variant="contained"
            color="primary"
            onClick={stakeModalType === "stake" ? stakeAsset : withdrawAsset}
            disabled={!isValidBal || loading}
          >
            {loading ? "Confirming..." : "Confirm"}
          </Button>
        </Grid>
      </Grid>
    </Modal>
  );
}
