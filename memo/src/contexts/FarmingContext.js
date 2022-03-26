import React, { createContext, useReducer, useMemo } from "react";

export const FarmingContext = createContext();

export const ACTIONS = {
  SET_FARMING_POOLS: "set asset status",
};

function farmingReducer(state, action) {

  switch (action.type) {
    case ACTIONS.SET_FARMING_POOLS: {
      return { ...state }
    }

    default: {
      throw new Error(`[Reserved Asset] Unhandled Action Type`);
    }
  }
}

export function FarmingProvider({ children }) {
  const [farming, farmingDispatch] = useReducer(farmingReducer, {
    farmingPools: []
  });

  const value = useMemo(() => {
    return { farming, farmingDispatch };
  }, [farming, farmingDispatch]);

  return <FarmingContext.Provider value={value}>{children}</FarmingContext.Provider>;
}
