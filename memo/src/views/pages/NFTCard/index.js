import React, { useEffect, useState, useContext } from 'react'
import { useParams } from "react-router-dom";
import axios from 'axios'
import { readNFTData } from '../Main/EthContract';
import { useWeb3React } from '@web3-react/core';
import { web3Context } from "../../../contexts/web3Context";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const Index = () => {

    const { id } = useParams();
    const { active, account, library, connector, activate, deactivate, chainId } = useWeb3React()
    const [nft, setNFT] = useState({})
    const { web3 } = useContext(web3Context);
    const { w3 } = web3
    console.log(w3)

    const readNFT = async () => {
        const data = await readNFTData(w3, chainId, account, id)
        const result = await axios.get(data)
        console.log(result.data)
        setNFT(result.data)

    }

    useEffect(() => {
        readNFT()
    }, [])

    return <div style={{textAlign: 'center', padding: 50}}>
            <img src={nft.image} style={{width: 400, height: 400}}/> <br />
            <ListItem button style={{textAlign: 'center', width: 300, margin: '0 auto'}}>
                <ListItemText primary={`NFT ID ${id}`} />
            </ListItem>
            <ListItem button style={{textAlign: 'center', width: 300, margin: '0 auto'}}>
                <ListItemText primary={`NFT name: ${nft.name}`} />
            </ListItem>
            <ListItem  button style={{textAlign: 'center', width: 300, margin: '0 auto'}}>
                <ListItemText primary={`NFT description: ${nft.description}`} />
            </ListItem>
           </div>
}

export default Index