import React, { useContext, useEffect } from "react";
import { Paper, Box, Typography, Button, InputBase } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { web3Context } from "../../contexts/web3Context";
import { getTokenBalance, hasSwapAllowance } from "../../utils/contract";
import { ACTIONS, SwapContext } from "../../contexts/SwapContext";
import { OPTIONS, Icon } from "../Icon";
import propTypes from "prop-types";
import { useWeb3React } from "@web3-react/core"

const useStyles = makeStyles((theme) => ({
  inputContainer: {
    backgroundColor: "#F6F6F6",
    padding: "15px",
  },
  button: {
    [theme.breakpoints.down("sm")]: {
      padding: 0,
    },
    padding: "5px 10px 5px 0px",
    marginTop: "15px",
  },
  title: {
    color: "#8F9688",
  },
  tokenName: {
    margin: "0 10px 0 10px",
  },
  balance: {
    color: "#6DA024",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  textField: {
    marginTop: "15px",
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
  symbolImg: {
    width: "24px",
    height: "24px",
  },
}));

export default function SwapInput({ type }) {
  const classes = useStyles();
  const { swap, swapDispatch } = useContext(SwapContext);
  const { active, account, library, connector, activate, deactivate, chainId } = useWeb3React()
  const { web3 } = useContext(web3Context);
  const { w3 } = web3
  // const { account, chainId, library } = web3;

  // Default token icon is BNB
  const DEFAULT_ICON = OPTIONS.TYPE.TOKENS.bnb;

  const token = type === "from" ? swap.fromToken.symbol : swap.toToken.symbol
  const { fromToken, toToken } = swap

  const tokenBalance = () => {
    if (token && type) {
      return type === "from" ? truncate(swap.fromTokenBalance) : truncate(swap.toTokenBalance)
    } else {
      return 0
    }
  }

  const tokenIcon = () => {
    if (type === "from") {
      return swap.fromToken.symbol
        ? OPTIONS.TYPE.TOKENS[swap.fromToken.symbol.toLowerCase()]
        : DEFAULT_ICON;
    } else {
      return swap.toToken.symbol
        ? OPTIONS.TYPE.TOKENS[swap.toToken.symbol.toLowerCase()]
        : DEFAULT_ICON;
    }
  };

  /**
   * Event to fire when user change the token amount input
   */

  const inputOnChange = (val) => {
    if(fromToken.symbol && toToken.symbol) {
      swapDispatch({
        type: ACTIONS.SET_TOKEN_AMOUNT,
        payload: { side: type, tokenAmount: val },
      });
      swapDispatch({
        type: ACTIONS.SET_TOKEN_AMOUNT,
        payload: { side: type === 'to' ? 'from' : 'to', tokenAmount: 0 },
      });
    }
  };

  const readTokenBalance = async (token) => {
    if (token && type) {
      const tokenBalance = await getTokenBalance(
        w3,
        chainId,
        token,
        account
      );
      const hasAllowance = await hasSwapAllowance(
        w3,
        chainId,
        token,
        account
      );
      swapDispatch({
        type: ACTIONS.SET_TOKEN_BALANCE,
        payload: { side: type, tokenBalance },
      });

      swapDispatch({
        type: ACTIONS.SET_TOKEN_ALLOWANCE,
        payload: { side: type, hasAllowance },
      });
    }
  };

  useEffect(() => {
    if(library && account && chainId) {
      readTokenBalance(token)
      swapDispatch({
        type: ACTIONS.SET_TOKEN_BALANCE,
        payload: { side: 'from', tokenBalance: 0 },
      });
      swapDispatch({
        type: ACTIONS.SET_TOKEN_BALANCE,
        payload: { side: 'to', tokenBalance: 0 },
      });
    }
  }, [token, account, swap.recentTransactions])

  const truncate = (val) => {
    if(val.toString().includes('.')){
      let [int, decimal] = val.toString().split('.')
      decimal = decimal.slice(0,4)
      return `${int}.${decimal}`
    } else {
      return val
    }
  }

  const display = () => {
    if(type === 'from') {
      return truncate(swap.fromTokenAmount)
    } else {
      return truncate(swap.toTokenAmount)
    }
  }

  return (
    <Paper className={classes.inputContainer} elevation={0} onMouseOver={
      ()=>{
        if(swap.fromTokenAmount === 0 || swap.toTokenAmount === 0) {
          swapDispatch({
            type: ACTIONS.SET_TOKEN_AMOUNT,
            payload: { side: 'from', tokenAmount: '' },
          });
          swapDispatch({
            type: ACTIONS.SET_TOKEN_AMOUNT,
            payload: { side: 'to', tokenAmount: '' },
          });
        }

      }
    }>
      {/* Balance Info */}
      <Box display="flex" justifyContent="space-between" width="100%">
        <Typography variant="body2" className={classes.title}>
          {type === "from" ? "From" : "To"}
        </Typography>
        <div>
          <Typography variant="body2" className={classes.title}>
            Max  <span 
              className={classes.balance} 
              onClick={()=>{inputOnChange(tokenBalance())}}
            >
              {tokenBalance()}
            </span>
          </Typography>
        </div>
      </Box>
      {/* Token Selector */}
      <Box display="flex" justifyContent="space-between" width="100%">
        <Button
          className={classes.button}
          onClick={() =>
            swapDispatch({
              type: ACTIONS.OPEN_TOKEN_SELECTOR,
              payload: { currentSelectorSide: type },
            })
          }
        >
          {/* Set Default Placeholder Here */}
          <Box display="flex" alignItems="center">
            <Icon type={tokenIcon()} alt="token" size="24px" />
            <Typography variant="h4" className={classes.tokenName}>
              {type === "from"
                ? swap.fromToken.symbol || "SELECT"
                : swap.toToken.symbol || "SELECT"}
            </Typography>
            <Icon type={OPTIONS.TYPE.downArrow} />
          </Box>
        </Button>
        <InputBase
          variant="outlined"
          className={classes.textField}
          placeholder="0.0"
          onChange={(e)=>{inputOnChange(e.target.value)}}
          value={display()}
        />
      </Box>
    </Paper>
  );
}

SwapInput.propTypes = {
  type: propTypes.string.isRequired,
};
