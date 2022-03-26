import React, { useContext, useEffect, useState } from "react";
import Modal from "../Modal";
import { Typography, Paper, Box, Grid, InputBase } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Button from "../Button/CustomButton";
import { ACTIONS, FarmContext } from "../../contexts/FarmContext";
import { buildLPString } from "../../utils/helpers";
import { web3Context } from "../../contexts/web3Context";
import OuroSlider from '../../components/Slider'
import { useWeb3React } from "@web3-react/core"
import {
  getLPTokenBalance,
  depositLPToken,
  withdrawLPToken,
  getFarmingLPStaked,
} from "../../utils/contract";
import toast from "react-hot-toast";

const useStyles = makeStyles((theme) => ({
  root: {
    // width: 300,
  },
  slider: {
    padding: 20, 
    paddingBottom: 35,
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
    border: "1px solid #F44B4B",
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
  const { farm, farmDispatch } = useContext(FarmContext);
  const { stakeModalType } = farm;

  const setType = (type) => {
    farmDispatch({
      type: ACTIONS.SET_CURRENT_MODAL_TYPE,
      payload: { type: type },
    });
  };

  return (
    <Box display="flex">
      <Tab
        selected={stakeModalType === "stake"}
        onClick={() => setType("stake")}
      >
        Stake LP
      </Tab>
      <Tab
        selected={stakeModalType === "remove"}
        onClick={() => setType("remove")}
      >
        Unstake LP
      </Tab>
    </Box>
  );
};

export default function StakeTokenModal() {
  const classes = useStyles();

  // State to control user input on stake/unstake
  // Maybe we can put it in context if necessary when connecting to web3

  const { active, account, library, connector, activate, deactivate, chainId } = useWeb3React()

  const { web3 } = useContext(web3Context);
  // const { account, chainId, library } = web3;

  const [inputVal, setInputVal] = useState("");
  const [lpBalance, setLpBalance] = useState(0);
  const [lpStaked, setLpStaked] = useState(0);
  const [isValidBal, setIsValidBal] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { farm, farmDispatch } = useContext(FarmContext);
  const { stakeModalToggled, stakeModalType } = farm;
  const { tokenPair } = farm.stakeModalData;
  const [percent, setPercent ] = useState(0)

  useEffect(() => {
    setInputVal(0)
    setPercent(0)
  }, [stakeModalType])

  const readLPTokenInfo = async () => {
    if (tokenPair) {
      try {
        const tokenBalance = await getLPTokenBalance(
          library,
          chainId,
          tokenPair,
          account
        );
        const LpStakedAmount = await getFarmingLPStaked(
          library,
          tokenPair,
          chainId,
          account
        );
        setLpBalance(tokenBalance);
        setLpStaked(LpStakedAmount);
      } catch (e) {
        toast.error("Error Occurs when reading pool info!");
      }
    }
  };

  const stakeLPToken = async () => {
    try {
      setLoading(true);
      const result = await depositLPToken(
        library,
        chainId,
        tokenPair,
        inputVal,
        account
      );
      console.log(result);
      toast.success("successfully staked LP token!");
      readLPTokenInfo();
      onClose();
    } catch (e) {
      console.log(e);
      const err = e.message || "Error Happens!";
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeLPToken = async () => {
    try {
      setLoading(true);
      const result = await withdrawLPToken(
        library,
        chainId,
        tokenPair,
        inputVal,
        account
      );
      console.log(result);
      toast.success("successfully unstake LP token!");
      readLPTokenInfo();
      onClose();
    } catch (e) {
      console.log(e);
      const err = e.message || "Error Happens!";
      toast.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    readLPTokenInfo();
  }, [tokenPair]);

  const currentLP = tokenPair ? buildLPString(tokenPair) : "";
  const onClose = () => {
    farmDispatch({ type: ACTIONS.CLOSE_STAKE_MODAL });
    setInputVal("");
    setIsValidBal(true);
  };

  const onChangeInput = (e) => {
    const value = parseFloat(e.target.value);
    // Check if the input is a valid number
    if (!isNaN(e.target.value)) {
      setInputVal(e.target.value);
    }
    if (stakeModalType === "stake" && value > lpBalance) {
      setIsValidBal(false);
      setErrorMsg("Insufficient Balance");
    } else if (stakeModalType === "remove" && value > lpStaked) {
      setIsValidBal(false);
      setErrorMsg("Insufficient Balance");
    } else if (e.target.value.trim().length === 0) {
      setIsValidBal(false);
      setErrorMsg("");
    } else {
      setIsValidBal(true);
    }
  };

  return (
    <Modal
      open={stakeModalToggled}
      onClose={onClose}
      title={`LP Staking Pool`}
      TitleProps={{
        onClose: onClose,
      }}
    >
      <Box >
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
              {stakeModalType === "stake" ? "Balance" : "Balance"} &nbsp;
              <Typography
                display="inline"
                variant="body2"
                className={classes.balance}
                onClick={() => {
                  setInputVal(stakeModalType === "stake" ? lpBalance : lpStaked)
                  setIsValidBal(true);
                }
                  
                }
              >
                {stakeModalType === "stake" ? lpBalance : lpStaked}
              </Typography>
            </Typography>
          </Box>
          <Box
            mt="12px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4">{currentLP} LP</Typography>
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
      </Box>
      <Box className={classes.slider}>
          <OuroSlider
            val={inputVal}
            onChange={setInputVal}
            percent={percent}
            setPercent={setPercent}
            balance={ stakeModalType === "stake" ? lpBalance : lpStaked }
          />
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
            onClick={stakeModalType === "stake" ? stakeLPToken : removeLPToken}
            variant="contained"
            color="primary"
            disabled={!isValidBal || loading}
          >
            {loading ? "Confirming..." : "Confirm"}
          </Button>
        </Grid>
      </Grid>
    </Modal>
  );
}
