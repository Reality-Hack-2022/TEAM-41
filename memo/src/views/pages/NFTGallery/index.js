import React, { useEffect, useState, useContext } from 'react'
import { useParams } from "react-router-dom";
import axios from 'axios'
import { readNFTData, readNFTCounter } from '../Main/EthContract';
import { useWeb3React } from '@web3-react/core';
import { web3Context } from "../../../contexts/web3Context";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';


const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
      margin:'0 auto',
      height: 400,
      maxWidth: 300,
      backgroundColor: theme.palette.background.paper,
    },
  }));


const Index = () => {


    const classes = useStyles();

    const { id } = useParams();
    const { active, account, library, connector, activate, deactivate, chainId } = useWeb3React()
    const [counter, setCounter] = useState([])
    const { web3 } = useContext(web3Context);
    const { w3 } = web3

    const readNFT = async () => {
        const data = await readNFTCounter(w3, chainId, account)
        console.log(data)
        let list = []
        for (let i = 0; i < parseInt(data); i++) {
            list.push(i)
        }
        setCounter(list)
        console.log(list)
    }

    useEffect(() => {
        readNFT()
    }, [])

    return <div className={classes.root}>
            {counter.map((nftID) => {
                return <ListItem button>
                            <Link to={`/nft/${nftID}`}  style={{textAlign:"center", padding: 20, textDecoration: 'none'}}>
                                <ListItemText primary={`NFT ID ${nftID}`} />             
                            </Link>
                       </ListItem>
            })}
           </div>
}

export default Index