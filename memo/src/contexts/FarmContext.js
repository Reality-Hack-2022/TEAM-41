import React, { createContext, useReducer, useMemo } from "react";

export const FarmContext = createContext();

export const ACTIONS = {
  OPEN_STAKE_MODAL: "open stake modal",
  CLOSE_STAKE_MODAL: "close stake modal",
  SET_CURRENT_MODAL: "set current modal",
  SET_CURRENT_MODAL_TYPE: 'set current modal type'
};

function farmReducer(state, action) {
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
      throw new Error(`[Farm Reducer] Unhandled Action Type`);
    }
  }
}

export function FarmProvider({ children }) {
  const [farm, farmDispatch] = useReducer(farmReducer, {
    stakeModalToggled: false,
    stakeModalData: {},
    stakeModalType: 'stake',
  });

  const value = useMemo(() => {
    return { farm: farm, farmDispatch: farmDispatch };
  }, [farm, farmDispatch]);

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}
