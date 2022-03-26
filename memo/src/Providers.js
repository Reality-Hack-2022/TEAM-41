import React, { useReducer } from "react";
import { web3Context, DEFAULT_WEB3 } from "./contexts/web3Context";
import web3Reducer from "./reducers/web3Reducer";
import { ToastProvider } from "./contexts/ToastContext";
import { WalletProvider } from "./contexts/WalletContext";
import { SwapTokenProvider } from "./contexts/SwapContext";
import { ReservedAssetProvider } from "./contexts/ReservedAssetContext";
import { FarmProvider } from "./contexts/FarmContext";
import { PoolProvider } from "./contexts/PoolContext";
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'

function getLibrary(provider) {
  return new Web3(provider)
}

/*
 * Wrap all the providers here
 */
export default function Providers({ children }) {
  const [web3, dispatch] = useReducer(web3Reducer, DEFAULT_WEB3);

  return (
    <>
    <Web3ReactProvider getLibrary={getLibrary}>
      <web3Context.Provider value={{ web3, dispatch }}>
        <PoolProvider>
          <FarmProvider>
            <SwapTokenProvider>
              <ReservedAssetProvider>
                <WalletProvider>
                  <ToastProvider />
                  {children}
                </WalletProvider>
              </ReservedAssetProvider>
            </SwapTokenProvider>
          </FarmProvider>
        </PoolProvider>
      </web3Context.Provider>
      </Web3ReactProvider>
    </>
  );
}
