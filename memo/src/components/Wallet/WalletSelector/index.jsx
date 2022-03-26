import React, { useContext } from "react";
import WalletList from "./WalletList";
import Modal from "../../Modal";
import { WALLET_ACTIONS, WalletContext } from "../../../contexts/WalletContext";

export default function WalletSelector() {

  const { wallet, walletDispatch } = useContext(WalletContext);

  return (
    <>
      <Modal
        title="Connect to a wallet"
        onClose={() => walletDispatch({ type: WALLET_ACTIONS.CLOSE_SELECTOR })}
        open={wallet.selectorToggled}
        TitleProps={{
          onClose: () => walletDispatch({ type: WALLET_ACTIONS.CLOSE_SELECTOR }),
        }}
      >
        <WalletList />
      </Modal>
    </>
  );
}
