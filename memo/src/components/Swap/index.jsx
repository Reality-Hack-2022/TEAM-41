//**************************************************************** */
//  Swap Component
//  Swap(Index).jsx       -  Container Layout
//  SwapInput.jsx         -  Choose Token, Input Token Amount
//  TokenList.jsx         -  Display List of token available to choose
//  TokenSelector.jsx     -  Modal to let user select specific token
//  tokenData.js          -  pseudo data for testing and data formatting
//  RecentTransaction.jsx -  Modal to show recent transaction
//  SwapContext           -  Swap State Management
//**************************************************************** */
import React, { useContext, useEffect, useState } from "react";
import { Paper, Box, Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-hot-toast";
import SwapInput from "./SwapInput";
import TokenSelector from "./TokenSelector";
import RecentTransaction from "./RecentTransaction";
import { ACTIONS, SwapContext } from "../../contexts/SwapContext";
import { web3Context } from "../../contexts/web3Context";
import { useWeb3React } from "@web3-react/core"
import {
  approveSwap,
  getCurrentAssetPrice,
  getOuroDefaultRate,
  deposit,
  withdraw,
  getAssetReservedAmount
} from "../../utils/contract";
import { OPTIONS, Icon } from "../../components/Icon/";

// Pseudo Data
import { fromTokenData, toTokenData } from "../../tokenData";

const OURO = fromTokenData[0].symbol;

const useStyles = makeStyles((theme) => ({
  container: {
    [theme.breakpoints.down("sm")]: {
      minWidth: "200px",
      minHeight: "300px",
      margin: "20px 10px 0 10px",
      padding: "30px 15px 30px 15px",
    },
    minWidth: "400px",
    minHeight: "400px",
    padding: "30px 25px 30px 25px",
    borderRadius: "32px",
    zIndex: 1000,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05);'
  },
  title: {
    color: "#8F9688",
  },
  button: {
    padding: "15px",
    color: "#FFF",
    fontWeight: "600",
    borderRadius: "24px",
  },
}));

/*
    Just for Demo
    Should switch when state changes
  */
const btnState = {
  SWAP: "Swap",
  INSUFF_BAL: "Insufficient Balance",
  NO_AMOUNT: "Enter an amount",
  NO_TOKEN: "Select a token",
  NO_WALLET: "Connect Wallet",
};

// TODO: Show Warnings when Redeem / Issurance Limit are reached.
export default function Swap() {

  const classes = useStyles();

  const { swap, swapDispatch } = useContext(SwapContext);
  const { web3 } = useContext(web3Context);
  const { active, account, library, connector, activate, deactivate, chainId } = useWeb3React()
  const { w3 } = web3
  const [loading, setLoading] = useState(false);

  const connecetToWeb3 = account && chainId && w3;

  /**
   * Load the pseudo data to token list
   */
  useEffect(() => {
    swapDispatch({
      type: ACTIONS.SET_TOKEN_LIST,
      payload: { fromTokenList: fromTokenData, toTokenList: toTokenData },
    });
    // Set the default toToken to ouro
    swapDispatch({
      type: ACTIONS.SET_DEFAULT_TOKEN,
      payload: { side: "to", token: OURO },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const swapTokenPositon = async () => {
    if (swap.fromToken && swap.toToken) {
      swapDispatch({ type: ACTIONS.SWAP_POSITION });
    }
  };

  const openRecentTransaction = () => {
    swapDispatch({ type: ACTIONS.OPEN_RECENT_TRANSACTION });
  };

  const handleApproveToken = async (side, token) => {
    try {
      setLoading(true);
      const result = await approveSwap(library, chainId, token, account);
      console.log(result);
      toast.success(`${token} is approved for swap!`);
      swapDispatch({
        type: ACTIONS.SET_TOKEN_ALLOWANCE,
        payload: { side, hasAllowance: true },
      });
    } catch (e) {
      console.log(loading);
      console.log(e);
      const err = e.message || "Error Happens!";
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const executeSwap = async () => {
    await getSwapRate();
    const { swapRate } = swap;
    const { fromTokenAmount, fromToken, toTokenAmount, toToken } = swap;
    let fromAmount = parseFloat(fromTokenAmount).toFixed(10)
    let toAmount = parseFloat(toTokenAmount).toFixed(10)
    if (fromToken.symbol !== "OURO") {
      // deposit and mint ouro
      const swapAmount = fromAmount * swapRate;
      console.log(
        `swap ${fromToken.symbol} ${fromAmount} to ${toToken.symbol} ${swapAmount}`
      );
      try {
        setLoading(true);
        const resp = await deposit(
          library,
          chainId,
          account,
          fromToken.symbol,
          fromAmount
        );
        console.log(resp);
        toast.success(`transaction confirmed!`);
      } catch (e) {
        console.log(e);
        const err = e.message || "Error Happens!";
        toast.error(err);
      } finally {
        setLoading(false);
        await getSwapRate();
        swapDispatch({ type: ACTIONS.SET_TRANSACTIONS, payload: swap.recentTransactions + 1 });
      }
    } else {
      const reservedAmount = await getAssetReservedAmount(library, chainId, toToken.symbol)
      if(toAmount > reservedAmount) {
        toast.error('Insufficient Asset in Reserve Pool')
        return
      }
      const swapAmount = fromAmount * swapRate;
      console.log(
        `swap ${fromToken.symbol} ${fromAmount} to ${toToken.symbol} ${swapAmount}`
      );

      try {
        setLoading(true);
        const resp = await withdraw(
          library,
          chainId,
          account,
          toToken.symbol,
          toAmount
        );
        console.log(resp);
        toast.success(`transaction confirmed!`);
      } catch (e) {
        console.log(e);
        const err = e.message || "Error Happens!";
        toast.error(err);
      } finally {
        setLoading(false);
        await getSwapRate();
        swapDispatch({ type: ACTIONS.SET_TRANSACTIONS, payload: swap.recentTransactions + 1 });
      }
    }
  };

  const getSwapRate = async () => {
    if (w3 && swap.fromToken.symbol && swap.toToken.symbol) {
      const ouroPrice = await getOuroDefaultRate(w3, chainId);
      if (swap.fromToken.symbol === "OURO") {
        const toToken = swap.toToken.symbol;
        const toTokenPrice = await getCurrentAssetPrice(w3, chainId, toToken);
        const swapRate = ouroPrice / toTokenPrice
        swapDispatch({
          type: ACTIONS.SET_SWAP_RATE,
          payload: { swapRate },
        });
      } else {
        const fromToken = swap.fromToken.symbol;
        const fromTokenPrice = await getCurrentAssetPrice(w3, chainId, fromToken);
        const swapRate = fromTokenPrice / ouroPrice;
        swapDispatch({
          type: ACTIONS.SET_SWAP_RATE,
          payload: { swapRate },
        });
      }
    }
  };

  const getTokenAmount = async () => {
    if (library) {
      if (swap.fromTokenAmount > 0 && swap.swapRate && swap.toTokenAmount === 0) {
        const fromTokenAmount = parseFloat(swap.fromTokenAmount);
        const swapRate = swap.swapRate;
        swapDispatch({
          type: ACTIONS.SET_TOKEN_AMOUNT,
          payload: { side: "to", tokenAmount: swapRate * fromTokenAmount },
        });
      } else if (swap.toTokenAmount > 0 && swap.swapRate && swap.fromTokenAmount === 0) {
        const toTokenAmount = parseFloat(swap.toTokenAmount);
        const swapRate = swap.swapRate;
        if (swapRate > 0) {
          swapDispatch({
            type: ACTIONS.SET_TOKEN_AMOUNT,
            payload: { side: "from", tokenAmount: toTokenAmount / swapRate },
          });
        }
      }
    }
  };

  useEffect(()=>{
    swapDispatch({ type: ACTIONS.RESET });
    let payload = {side: 'to', token: {symbol: 'OURO', tokenName: 'OURO'}}
    swapDispatch({type: ACTIONS.SET_TOKEN, payload})
  }, [])

  useEffect(() => {
    getSwapRate();
  }, [swap.fromToken, swap.toToken]);

  useEffect(() => {
    getTokenAmount();
  }, [swap.fromTokenAmount, swap.toTokenAmount]);

  useEffect(() => {
    const fromTokenAmount = swap.fromTokenAmount
    swapDispatch({
      type: ACTIONS.SET_TOKEN_AMOUNT,
      payload: { side: 'to', tokenAmount: fromTokenAmount * swap.swapRate },
    });
  }, [swap.swapRate]);

  const renderButton = () => {
    const createButton = (callback, text, disabled) => {
      return (
        <Button
          variant="contained"
          color="primary"
          disabled={disabled || loading}
          fullWidth
          onClick={callback}
          className={classes.button}
        >
          {loading ? "Confirming..." : text}
        </Button>
      );
    };

    const getButtonCallbackAndText = () => {
      const { fromTokenBalance, fromTokenAmount } = swap;
      if (!connecetToWeb3) {
        return [
          () => {
            "connect!";
          },
          btnState.NO_WALLET,
          true,
        ];
      } else if (!swap.fromToken.symbol || !swap.toToken.symbol) {
        return [() => {}, btnState.NO_TOKEN, true];
      } else if (!swap.fromTokenAmount) {
        return [() => {}, btnState.NO_AMOUNT, true];
      } else if (!swap.fromTokenAllowance) {
        const fromToken = swap.fromToken.symbol;
        const text = `Approve ${fromToken} for swap`;
        return [
          () => {
            handleApproveToken("from", fromToken);
          },
          text,
          false,
        ];
      } 
      // else if (!swap.toTokenAllowance) {
      //   const toToken = swap.toToken.symbol;
      //   const text = `Approve ${toToken} for swap`;
      //   return [
      //     () => {
      //       handleApproveToken("to", toToken);
      //     },
      //     text,
      //     false,
      //   ];
      // } 
      else if (parseFloat(fromTokenBalance) < parseFloat(fromTokenAmount)) {
        return [() => {}, btnState.INSUFF_BAL, true];
      } else {
        return [executeSwap, btnState.SWAP, false];
      }
    };

    const [callback, buttonText, disabled] = getButtonCallbackAndText();

    return createButton(callback, buttonText, disabled);
  };

  const renderSwapRate = () => {
    if (fromToken.symbol && swapRate && toToken.symbol) {
      return `1 ${fromToken.symbol} = ${swapRate.toFixed(4)} ${toToken.symbol}`;
    } else {
      return "";
    }
  };

  const { fromToken, toToken, swapRate } = swap;

  return (
    <>
      {/* Load Modal */}
      <TokenSelector />
      {/* <RecentTransaction /> */}
      {/* Token Swap  */}
      <Paper elevation={2} className={classes.container}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          mb="30px"
        >
          <Typography variant="h2">Reserve</Typography>
          {/* <Icon
            button
            type={OPTIONS.TYPE.trcHistory}
            alt="history"
            size="20px"
            onClick={openRecentTransaction}
          /> */}
        </Box>
        <SwapInput type="from" />
        <Box display="flex" justifyContent="center" my="8px">
          <Icon
            button
            type={OPTIONS.TYPE.swap}
            alt="swap icon"
            size="20px"
            onClick={swapTokenPositon}
          />
        </Box>
        <SwapInput type="to" />
        {/* Price Fetch Info */}
        <Box display="flex" justifyContent="space-between" my="16px">
          <Typography variant="body2" className={classes.title}>
            Price
          </Typography>
          <Typography variant="body2">{renderSwapRate()}</Typography>
        </Box>
        {renderButton()}
      </Paper>
    </>
  );
}
