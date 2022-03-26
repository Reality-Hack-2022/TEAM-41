import React from "react";
import propTypes from "prop-types";

// icon svgs
import viewLink from "../../assets/icons/viewLink.svg";
import metamask from "../../assets/icons/metamask.svg";
import walletconnect from '../../assets/icons/walletconnect.svg'
import copy from "../../assets/icons/copy.svg";
import trcHistory from "../../assets/icons/trcHistory.svg";
import swap from "../../assets/icons/swapIcon.svg";
import mobileSwap from "../../assets/icons/swap.svg";
import downArrow from "../../assets/icons/downArrow.svg";
import home from "../../assets/icons/home.svg";
import pools from "../../assets/icons/pools.svg";
import farm from "../../assets/icons/farm.svg";
import info from "../../assets/icons/info.svg";
import menu from "../../assets/icons/menu.svg";

// TOKENS svgs
import bnb from "../../assets/icons/tokens/bnb.svg";
import cake from "../../assets/icons/tokens/cake.svg";
import usdt from "../../assets/icons/tokens/usdt.svg";
import usdc from "../../assets/icons/tokens/usdc.svg";
import busd from "../../assets/icons/tokens/busd.svg";
import eth from "../../assets/icons/tokens/eth.svg";
import btc from "../../assets/icons/tokens/btc.svg";
import ouro from "../../assets/icons/tokens/ouro.svg";
import ogs from "../../assets/icons/tokens/ogs.svg";

/**
 * choice of icons available
 * add the svg choice here
 */
export const OPTIONS = {
  TYPE: {
    TOKENS: {
      bnb: bnb,
      cake: cake,
      usdt: usdt,
      btc: btc,
      btcb: btc,
      eth: eth,
      ouro: ouro,
      ogs: ogs,
      usdc: usdc,
      busd: busd
    },
    viewLink: viewLink,
    metamask: metamask,
    walletconnect,
    copy: copy,
    trcHistory: trcHistory,
    swap: swap,
    mobileSwap: mobileSwap,
    downArrow: downArrow,
    home: home,
    pools: pools,
    farm: farm,
    info: info,
    menu: menu
  },
  COLOR: {
    grey: "#8F9688",
    green: "#6DA024",
  },
};

/**
 * Icon Dispatcher
 * Please import both OPTIONS & Icon when using
 * @param {string} type
 * @param {string} size
 * @param {string} color
 * @param {string} alt
 * @param {boolean} button to make it like a button
 * @param {object} style
 */
export const Icon = React.forwardRef(
  ({ type, size, color, alt, style, button, ...other }, ref) => {
    const iconStyle = {
      width: size,
      height: size,
      fill: color,
      cursor: button ? "pointer" : "",
      ...style,
    };

    return (
      <img
        ref={ref}
        src={type}
        alt={alt || "icon"}
        style={iconStyle}
        {...other}
      />
    );
  }
);

Icon.propTypes = {
  type: propTypes.string.isRequired,
  size: propTypes.string.isRequired,
  color: propTypes.string,
};
