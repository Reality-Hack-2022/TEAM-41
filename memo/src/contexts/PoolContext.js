import React, { createContext, useReducer, useMemo } from "react";

export const PoolContext = createContext();

export const ACTIONS = {
  OPEN_STAKE_MODAL: "open stake modal",
  CLOSE_STAKE_MODAL: "close stake modal",
  SET_CURRENT_MODAL: "set current modal",
  SET_CURRENT_MODAL_TYPE: 'set current modal type'
};

function poolReducer(state, action) {
  switch (action.type) {
    case ACTIONS.OPEN_STAKE_MODAL: {
      return { ...state, stakeModalToggled: true };
    }

    case ACTIONS.CLOSE_STAKE_MODAL: {
      return { ...state, stakeModalToggled: false };
    }

    case ACTIONS.SET_CURRENT_MODAL: {
      return { ...state, stakeModalData: action.payload.data };
    }

    /**
     * payload: { type: 'stake' || 'remove' }
     */
    case ACTIONS.SET_CURRENT_MODAL_TYPE: {
      return { ...state, stakeModalType: action.payload.type };
    }

    default: {
      throw new Error(`[Pool Reducer] Unhandled Action Type`);
    }
  }
}

export function PoolProvider({ children }) {
  const [pool, poolDispatch] = useReducer(poolReducer, {
    stakeModalToggled: false,
    stakeModalData: {},
    stakeModalType: 'stake',
  });

  const value = useMemo(() => {
    return { pool: pool, poolDispatch: poolDispatch };
  }, [pool, poolDispatch]);

  return <PoolContext.Provider value={value}>{children}</PoolContext.Provider>;
}
