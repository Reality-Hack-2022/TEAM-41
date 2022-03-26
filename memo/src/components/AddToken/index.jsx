import React, { useEffect, useState } from 'react'
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import toast from "react-hot-toast";
import { IsMobile } from "../../utils/mobile";
import DesktopAddToken from './desktopView'
import MobileAddToken from './mobileView'

const OURO_ADDRESS = '0x0a4fc79921f960a4264717fefee518e088173a79'
const OGS_ADDRESS = '0x416947e6Fc78F158fd9B775fA846B72d768879c2'

const useStyles = makeStyles((theme) => ({
    containerMargin: {
        marginLeft: '15px'
    },
    Btn: {
      fontWeight: 600,
      color: "#6DA024",
      cursor: "pointer",
    },
  }));

const AddTokenList = () => {

    const classes = useStyles()

    const [ isMetamask, setIsMetamask ] = useState(false)

    useEffect(() => {
      let name = localStorage.getItem("WALLET_NAME")
      if(name === 'METAMASK') {
        setIsMetamask(true)
      }
    }, [])

    const addToken = async (tokenData) => {
    
        const { tokenAddress, tokenSymbol, tokenDecimals, tokenImage } = tokenData
    
        try {
          const wasAdded = await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20', // Initially only supports ERC20, but eventually more!
              options: {
                address: tokenAddress, // The address that the token is at.
                symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                decimals: tokenDecimals, // The number of decimals in the token
                image: tokenImage, // A string url of the token logo
              },
            },
          });
          if (wasAdded) {
            toast.success('Token added');
          } else {
            toast.error('Failed to add token!');
          }
        } catch (error) {
          console.log(error);
        }
      }
    
    return <>
            {
              IsMobile() ? <MobileAddToken /> : <DesktopAddToken />
            }
           </>
}

const AddToken = () => {
    return window.ethereum ? <AddTokenList /> : <div></div>
}

export default AddToken