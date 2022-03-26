import React, { createContext, useReducer, useMemo } from "react";

export const SwapContext = createContext();

export const ACTIONS = {
  RESET: 'reset',
  SET_TOKEN_LIST: "set token list",
  SET_TOKEN: "set token",
  SET_DEFAULT_TOKEN: 'set default token',
  SET_TOKEN_AMOUNT: "set token amount",
  SET_TOKEN_BALANCE: "set token balance",
  OPEN_TOKEN_SELECTOR: "open token selector",
  CLOSE_TOKEN_SELECTOR: "close token selector",
  SWAP_POSITION: "swap position",
  OPEN_RECENT_TRANSACTION: "toggle recent transaction",
  CLOSE_RECENT_TRANSACTION: "close recent transaction",
  SET_TRANSACTIONS: 'set recent transaction',
  SET_TOKEN_ALLOWANCE: 'set token allowance',
  SET_SWAP_RATE: 'set swap rate'
};

function swapReducer(state, action) {

  switch (action.type) {
    /**
     * SET TOKEN LIST
     * Payload: { list }
     */
    case ACTIONS.SET_TOKEN_LIST: {
      return { ...state, 
               fromTokenList: action.payload.fromTokenList, 
               toTokenList: action.payload.toTokenList 
             };
    }

    /**
     * SET TOKEN
     * Payload: { token }
     */
    case ACTIONS.SET_TOKEN: {
      // const side = state.currentSelectorSide
      const side = action.payload.side
      const token = action.payload.token
      if(side === 'to' && state.fromToken === token ) {
        return state
      } else if (side === 'from' && state.toToken === token) {
        return state
      } 
      if (side === 'to') {
        const toTokenSymbol = token.symbol
        const fromTokenSymbol = state.fromToken.symbol
        if (toTokenSymbol !== 'OURO' && fromTokenSymbol !== 'OURO' || toTokenSymbol === 'OURO' && fromTokenSymbol === 'OURO') {
          return state
        }
      } else if (side === 'from') {
        const toTokenSymbol = state.toToken.symbol
        const fromTokenSymbol = token.symbol
        if (toTokenSymbol !== 'OURO' && fromTokenSymbol !== 'OURO' || toTokenSymbol === 'OURO' && fromTokenSymbol === 'OURO') {
          return state
        }
      }
      if (side === 'from' && token.symbol === 'OURO') {
        return { ...state, fromToken: action.payload.token, toToken: {} };
      } else if (side === "from") {
        return { ...state, fromToken: action.payload.token };
      } else if (side === "to") {
        return { ...state, toToken: action.payload.token };
      } else {
        throw new Error(`[SWAP] Unsupported Token Swap Direction`);
      }
    }

    /**
     * Set default token for selector
     * Payload { side, token }
     */
    case ACTIONS.SET_DEFAULT_TOKEN: {
      const [side, token] = [action.payload.side, action.payload.token];
      return side === 'to' ? { ...state, toToken: token } : { ...state, fromToken: token };
    }

    /**
     * SET TOKEN AMOUNT
     * Payload: { tokenAmount }
     */
    case ACTIONS.RESET: {
      return {
        ...state,
        fromTokenAmount: 0,
        toTokenAmount: 0,
        fromTokenBalance: 0,
        toTokenBalance: 0,
        fromToken: {},
        toToken: {}
      }
    }

    case ACTIONS.SET_TOKEN_AMOUNT: {
      if (action.payload.side === "from") {
        return { ...state, fromTokenAmount: action.payload.tokenAmount };
      } else if (action.payload.side === "to") {
        return { ...state, toTokenAmount: action.payload.tokenAmount };
      } else {
        throw new Error(`[SWAP] Unsupported Token Swap Direction`);
      }
    }

    case ACTIONS.SET_TOKEN_BALANCE: {
      if (action.payload.side === "from") {
        return { ...state, fromTokenBalance: action.payload.tokenBalance };
      } else if (action.payload.side === "to") {
        return { ...state, toTokenBalance: action.payload.tokenBalance };
      } else {
        return {
          ...state, toTokenBalance: 0, fromTokenBalance: 0
        }
      }
    }

    case ACTIONS.SET_TOKEN_ALLOWANCE: {
      if (action.payload.side === "from") {
        return { ...state, fromTokenAllowance: action.payload.hasAllowance };
      } else if (action.payload.side === "to") {
        return { ...state, toTokenAllowance: action.payload.hasAllowance };
      } else {
        throw new Error(`[SWAP] Unsupported Token Swap Direction`);
      }
    }

    case ACTIONS.SET_SWAP_RATE: {
      return {
        ...state,
        swapRate: action.payload.swapRate
      };
    }

    /**
     * Swap token position
     */
    case ACTIONS.SWAP_POSITION: {
      return {
        ...state,
        fromToken: state.toToken,
        fromTokenAmount: 0,
        toToken: state.fromToken,
        toTokenAmount: 0,
      };
    }

    /*
     * Open Token Selector Modal
     * Payload: { currentSelectorSide: 'from' / 'to' }
     */
    case ACTIONS.OPEN_TOKEN_SELECTOR: {
      return {
        ...state,
        tokenSelectorToggled: true,
        currentSelectorSide: action.payload.currentSelectorSide,
      };
    }

    /**
     * Close Token Selector Modal
     */
    case ACTIONS.CLOSE_TOKEN_SELECTOR: {
      return {
        ...state,
        tokenSelectorToggled: false,
        currentSelectorSide: null,
      };
    }

    /**
     * Open Recent Transaction Modal
     */
    case ACTIONS.OPEN_RECENT_TRANSACTION: {
      return {
        ...state,
        recTransactionToggled: true,
      };
    }

    /**
     * Close Recent Transaction Modal
     */
    case ACTIONS.CLOSE_TRANSACTION: {
      return {
        ...state,
        recTransactionToggled: false,
      };
    }

    case ACTIONS.SET_TRANSACTIONS: {
      return {
        ...state,
        recentTransactions: action.payload.transactions,
      };
    }

    default: {
      throw new Error(`[SWAP] Unhandled Action Type`);
    }
  }
}

// How does the pair price calculated? where should we handle the price logic?
export function SwapTokenProvider({ children }) {
  const [swap, swapDispatch] = useReducer(swapReducer, {
    fromTokenList: [],
    toTokenList: [],
    recentTransactions: 0,
    fromToken: {
      balance: 0,
      allowance: 0,
    },
    swapRate: null,
    fromTokenAmount: "",
    toToken: {
      balance: 0,
      allowance: 0
    },
    toTokenAmount: "",
    pairPrice: "",
    tokenSelectorToggled: false,
    currentSelectorSide: null,
    recTransactionToggled: false,
  });

  const value = useMemo(() => {
    return { swap, swapDispatch };
  }, [swap, swapDispatch]);

  return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>;
}
