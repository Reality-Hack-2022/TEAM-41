import React, { useContext, useEffect, useState } from "react";
import { web3Context } from "../../../contexts/web3Context";
import { useWeb3React } from "@web3-react/core"
import {
  ConnectToMetaMask,
  loadWeb3,
  attachListener,
} from "../../../utils/web3Utils";
import { createInjector, METAMASK, WALLET_CONNECT } from "../../../wallet/connectors"
import { WALLET_ACTIONS, WalletContext } from "../../../contexts/WalletContext";
import { NavLink } from "react-router-dom";
import Button from "../../../components/Button/CustomButton";
import WalletSelector from "../../../components/Wallet/WalletSelector";
import MyWallet from "../../../components/Wallet/MyWallet";
import { AppBar, Toolbar, Box, List, ListItem } from "@material-ui/core";
import Logo from "../../../components/Logo";
import { useStyles } from "./style";
import MobileMenu from "./MobileMenu";
import { OPTIONS, Icon } from "../../../components/Icon";
import toast from "react-hot-toast";

// Use for responsive menu
export const MenuContext = React.createContext();

/**
 * Key: pageName, Value: route
 */
const links = {
  Home: "/",
  Gallery: "/gallery",
  // Farm: "/farms",
  // Pools: "/pools",
};

const nav = [
  { name: "Home", href: "/", icon: OPTIONS.TYPE.home },
  { name: "Gallery", href: "/gallery", icon: OPTIONS.TYPE.mobileSwap },
  // { name: "Farm", href: "/farms", icon: OPTIONS.TYPE.farm },
  // { name: "Pools", href: "/pools", icon: OPTIONS.TYPE.pools },
  // { name: "Info", href: "/info", icon: OPTIONS.TYPE.pools },
];

const formatAddress = (address) => {
  return (
    address.slice(0, 4) +
    "..." +
    address.slice(address.length - 4, address.length)
  );
};

const Navbar = () => {
  const classes = useStyles();

  // connect()
  const { active, account, library, connector, activate, deactivate, chainId } = useWeb3React()
  const [menuToggled, setMenuToggled] = useState(false);

  const { web3, dispatch } = useContext(web3Context);
  const { walletDispatch } = useContext(WalletContext);

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4' }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          // await window.ethereum.request({
          //   method: 'wallet_addEthereumChain',
          //   params: [
          //     {
          //       chainId: '0x38',
          //       nativeCurrency: {
          //         name: 'BNB',
          //         symbol: 'BNB',
          //         decimals: 18,
          //       },
          //       chainName: 'Binance Smart Chain Mainnet',
          //       rpcUrls: ['https://bsc-dataseed.binance.org/'],
          //       blockExplorerUrls: ['https://bscscan.com/']
          //     },
          //   ],
          // });
        } catch (addError) {
          console.log(addError)
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }

  }

  const onClickWallet = async () => {
    if (account) {
      walletDispatch({ type: WALLET_ACTIONS.OPEN_WALLET });
    } else {
      walletDispatch({ type: WALLET_ACTIONS.OPEN_SELECTOR });
    }
  };

  const connectFirst = async () => {
    let name = localStorage.getItem('WALLET_NAME')
    await activate(createInjector('METAMASK'))
  }

  useEffect(() => {
    loadWeb3(dispatch);
    window.onload = () => {
      connectFirst()
      switchNetwork()
    }
  }, []);

  return (
    <MenuContext.Provider value={{ menuToggled, setMenuToggled }}>
      <MobileMenu links={links} nav={nav} />
      <WalletSelector />
      <MyWallet currentAddress={account} />
      <AppBar position="static" color="transparent" className={classes.navBar}>
        <Toolbar>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Logo />
            <List className={classes.flexContainer}>
              {nav.map((e) => {
                return (
                  <ListItem key={e.name}>
                    <NavLink
                      to={e.href}
                      className={classes.navLink}
                      activeStyle={{
                        color: "#9DD251",
                        fontWeight: "700",
                        textDecoration: "none",
                      }}
                      exact={true}
                    >
                      {e.name}
                    </NavLink>
                  </ListItem>
                );
              })}
            </List>
            <Box display="flex" alignItems="center">
              <Button
                variant="contained"
                color="primary"
                onClick={onClickWallet}
                className={classes.btn}
                disableElevation
              >
                {account ? formatAddress(account) : "Connect"}
              </Button>
              <Icon
                type={OPTIONS.TYPE.menu}
                size="24px"
                className={classes.menuIcon}
                onClick={() => setMenuToggled(!menuToggled)}
              />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </MenuContext.Provider>
  );
};

export default Navbar;
