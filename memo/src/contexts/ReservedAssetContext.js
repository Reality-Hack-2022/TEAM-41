import React, { createContext, useReducer, useMemo } from "react";

export const ReservedAssetContext = createContext();

export const ACTIONS = {
  SET_ASSET_STATUS: "set asset status",
};

function reservedAssetReducer(state, action) {

  switch (action.type) {
    case ACTIONS.SET_ASSET_STATUS: {
      return { ...state, assetsStatus: action.payload.assetStatus };
    }

    default: {
      throw new Error(`[Reserved Asset] Unhandled Action Type`);
    }
  }
}

// How does the pair price calculated? where should we handle the price logic?
export function ReservedAssetProvider({ children }) {
  const [reservedAsset, reservedAssetDispatch] = useReducer(reservedAssetReducer, {
    assetsStatus: []
  });

  const value = useMemo(() => {
    return { reservedAsset, reservedAssetDispatch };
  }, [reservedAsset, reservedAssetDispatch]);

  return <ReservedAssetContext.Provider value={value}>{children}</ReservedAssetContext.Provider>;
}
