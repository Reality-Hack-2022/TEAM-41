import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { WALLET_ACTIONS, WalletContext } from "../../../contexts/WalletContext";
import { Typography, Box } from "@material-ui/core";
import { OPTIONS, Icon } from "../../../components/Icon";
import { useWeb3React } from "@web3-react/core"
import { createInjector, METAMASK, WALLET_CONNECT } from "../../../wallet/connectors"
import toast from "react-hot-toast";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    minWidth: 300,
  },
  listItem: {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "#F6F6F6",
    "&:hover": {
      backgroundColor: "#ECF3E1",
    },
    padding: "15px",
  },
}));

export default function WalletList() {

  const classes = useStyles();
  const { walletDispatch } = useContext(WalletContext);
  const { active, account, library, connector, activate, deactivate, chainId } = useWeb3React()

  const connect = async (name) => {
    walletDispatch({
      type: WALLET_ACTIONS.CLOSE_SELECTOR,
    });
    try {
      await activate(createInjector(name))
      localStorage.setItem('WALLET_NAME', name);
      if(name === WALLET_CONNECT && !window.location.hash.includes('loaded')) {
        toast.success('wallet connected, reloading to fetch data')
        setTimeout(() => {
          window.location = window.location + '#loaded';
          window.location.reload();
        }, 1500)
      }
    } catch (ex) {
      console.log(ex)
    }
  }

  return (
    <div className={classes.root}>
      <List component="nav" aria-label="wallet list">
        <ListItem
          button
          className={classes.listItem}
          onClick={() => {connect(METAMASK)}}
        >
          <Box display="flex" justifyContent="space-between" width="100%">
            <Typography style={{ marginLeft: "20px" }} variant="subtitle2">
              Metamask
            </Typography>
            <ListItemIcon>
              <Icon type={OPTIONS.TYPE.metamask} size="32px" />
            </ListItemIcon>
          </Box>
        </ListItem>
        <ListItem
          button
          className={classes.listItem}
          style={{marginTop: "20px"}}
          onClick={() => {connect(WALLET_CONNECT)}}
        >
          <Box display="flex" justifyContent="space-between" width="100%">
            <Typography style={{ marginLeft: "20px" }} variant="subtitle2">
              Wallet Connect
            </Typography>
            <ListItemIcon>
              <Icon type={OPTIONS.TYPE.walletconnect} size="32px" />
            </ListItemIcon>
          </Box>
        </ListItem>
      </List>
    </div>
  );
}
