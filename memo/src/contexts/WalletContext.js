import React, { createContext, useReducer, useMemo } from "react";

export const WalletContext = createContext();

export const WALLET_ACTIONS = {
  SET_WALLET: "set wallet",
  OPEN_SELECTOR: "open selector",
  CLOSE_SELECTOR: "close selector",
  OPEN_WALLET: "open wallet",
  CLOSE_WALLET: "close wallet",
};

function walletReducer(state, action) {
  switch (action.type) {
    case WALLET_ACTIONS.SET_WALLET: {
      return { ...state, currentWallet: action.payload.currentWallet };
    }
    case WALLET_ACTIONS.OPEN_SELECTOR: {
      return { ...state, selectorToggled: true };
    }
    case WALLET_ACTIONS.CLOSE_SELECTOR: {
      return { ...state, selectorToggled: false };
    }
    case WALLET_ACTIONS.OPEN_WALLET: {
      return { ...state, walletToggled: true };
    }
    case WALLET_ACTIONS.CLOSE_WALLET: {
      return { ...state, walletToggled: false };
    }
    default: {
      throw new Error(`[WALLET SELECTOR] Unhandled Action Type`);
    }
  }
}

export function WalletProvider({ children }) {
  const [wallet, walletDispatch] = useReducer(walletReducer, {
    currentWallet: null,
    selectorToggled: false,
    walletToggled: false,
  });

  // Improve performance without unnecessary re-rendering
  const value = useMemo(() => {
    return { wallet, walletDispatch };
  }, [wallet, walletDispatch]);

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
