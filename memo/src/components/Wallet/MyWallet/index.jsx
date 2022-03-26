import React, { useContext } from "react";
import Modal from "../../Modal";
import { WALLET_ACTIONS, WalletContext } from "../../../contexts/WalletContext";
import { Grid, Typography, Box, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { OPTIONS, Icon } from "../../../components/Icon";
import { toast } from "react-hot-toast";
import { useWeb3React } from "@web3-react/core"
import { createInjector, METAMASK, WALLET_CONNECT } from "../../../wallet/connectors"


const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 280,
  },
  btnText: {
    fontWeight: "600",
    color: "#6DA024",
    marginRight: 5,
  },
  link: {
    cursor: "pointer",
  },
  logoutBtn: {
    width: "100%",
    color: "white",
    padding: "9px, 36px, 9px, 36px",
  },
}));

// TODO: Implement Logout here @Jeff
export default function MyWallet({ currentAddress }) {

  const { active, account, library, connector, activate, deactivate, chainId } = useWeb3React()
  const { wallet, walletDispatch } = useContext(WalletContext);
  const classes = useStyles();

  const onCloseWallet = () => {
    walletDispatch({ type: WALLET_ACTIONS.CLOSE_WALLET });
  };

  const disconnect =  async () => {
    try {
      let name = localStorage.getItem('WALLET_NAME')
      await deactivate(createInjector(name))
      localStorage.setItem('WALLET_NAME', null)
      toast.success("Wallet disconnected! Reloading Page...")
      onCloseWallet()
      setTimeout(() => {
        window.location.hash = ''
        window.location.reload();
      }, 2000)
    } catch (ex) {
      console.log(ex)
    }
  }

  return (
    <Modal
      title="Your Wallet"
      open={wallet.walletToggled}
      onClose={onCloseWallet}
      TitleProps={{ onClose: () => onCloseWallet() }}
      ContentProps={{
        className: classes.root,
      }}
    >
      <Box display="flex" my="15px" width="100%">
        <Typography variant="body2">{currentAddress ? currentAddress : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}</Typography>
      </Box>
      <Box mb="30px" width="100%">
        <Grid container justify="flex-start" space={3}>
          <Grid item xs={6}>
            <Box
              display="flex"
              alignItems="center"
              className={classes.link}
              onClick={() =>
                window.open(
                  `https://bscscan.com/address/${currentAddress}`,
                  "_blank"
                )
              }
            >
              <Typography variant="body2" className={classes.btnText}>
                View on BscScan
              </Typography>
              <Icon
                type={OPTIONS.TYPE.viewLink}
                color={OPTIONS.COLOR.green}
                size="15px"
              />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              display="flex"
              alignItems="center"
              className={classes.link}
              onClick={() => {
                navigator.clipboard.writeText(currentAddress);
                toast.success("Address copied to clipboard");
              }}
            >
              <Typography variant="body2" className={classes.btnText}>
                Copy Address
              </Typography>
              <Icon
                type={OPTIONS.TYPE.copy}
                color={OPTIONS.COLOR.green}
                size="20px"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box
        display="flex"
        width="100%"
        justifyContent="center"
        alignItems="center"
        my="10px"
      >
        <Button
          variant="contained"
          color="primary"
          onClick={disconnect}
          className={classes.logoutBtn}
        >
          Logout
        </Button>
      </Box>
    </Modal>
  );
}
