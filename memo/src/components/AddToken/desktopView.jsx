import React, { useEffect, useState } from 'react'
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import toast from "react-hot-toast";
import { IsMobile } from "../../utils/mobile";

const OURO_ADDRESS = '0x0a4fc79921f960a4264717fefee518e088173a79'
const OGS_ADDRESS = '0x416947e6Fc78F158fd9B775fA846B72d768879c2'

const useStyles = makeStyles((theme) => ({
    containerMargin: {
        marginLeft: '15px'
    },
    Btn: {
       marginLeft: 15,
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
              false ? <></> : <div>
              <Grid container>
                  <Grid xs={12}>
                      OURO Token Address: {OURO_ADDRESS}
                      <span 
                          className={classes.Btn} 
                          onClick={()=>{window.open(`https://bscscan.com/token/${OURO_ADDRESS}`)}}
                      >
                          View at BSCScan
                      </span>
                      {isMetamask && 
                                            <span className={classes.Btn} onClick={
                                              ()=>{
                                                 addToken({
                                                  tokenAddress: OURO_ADDRESS,
                                                  tokenSymbol: 'OURO',
                                                  tokenDecimals: 18,
                                                  tokenImage: ''
                                                 }) 
                                              }}
                                          >
                                              Add Token to Metamask
                                          </span>
                      }
                      <span 
                          className={classes.Btn} 
                          onClick={
                            () => {
                              navigator.clipboard.writeText(OURO_ADDRESS);
                              toast.success("Ouro Address copied to clipboard");
                            }
                          }
                      >
                          Copy
                      </span>
                  </Grid>
              </Grid>
              <Grid container style={{marginTop: 10, marginBottom: 10}}>
                  <Grid xs={12}>
                      OGS Token Address: {OGS_ADDRESS}
                      <span 
                          className={classes.Btn} 
                          onClick={()=>{window.open(`https://bscscan.com/token/${OGS_ADDRESS}`)}}
                      >
                          View at BSCScan
                      </span>
                      {isMetamask && 
                                            <span className={classes.Btn} onClick={
                                              ()=>{
                                                 addToken({
                                                  tokenAddress: OGS_ADDRESS,
                                                  tokenSymbol: 'OGS',
                                                  tokenDecimals: 18,
                                                  tokenImage: ''
                                                 }) 
                                              }}
                                          >
                                              Add Token to Metamask
                                          </span>
                      }
                      <span 
                          className={classes.Btn} 
                          onClick={
                            () => {
                              navigator.clipboard.writeText(OGS_ADDRESS);
                              toast.success("OGS Address copied to clipboard");
                            }
                          }
                      >
                          Copy
                      </span>
                  </Grid>
              </Grid>
              </div>
            }
           </>
}

const AddToken = () => {
    return window.ethereum ? <AddTokenList /> : <div></div>
}

export default AddToken