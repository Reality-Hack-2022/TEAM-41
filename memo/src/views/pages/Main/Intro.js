import React, { useEffect, useState } from "react";
import { Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Fade from "@material-ui/core/Fade";
import { Player } from 'video-react';
import TextField from '@material-ui/core/TextField';
import "./style.css"
import toast from "react-hot-toast";


import { 
  uploadImage,
  createNFTMetadata 
} from './request'
import axios from 'axios'
import { useWeb3React } from "@web3-react/core";

import { createCollectible } from './EthContract'

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: "24px",
    fontWeight: "600",
    [theme.breakpoints.down("xs")]: {
      fontSize: "16px",
    },
  },
  body: {
    fontFamily: "Montserrat",
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "28px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "14px",
    },
  },
  link: {
    color: "#6DA024",
    "&:visited": {
      color: "#6DA024",
    },
  },
}));

export default function Intro() {

  const classes = useStyles();

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [file, setFile] = useState("")
  const [description, setDescription] = useState('')
  const [nftImg, setNFTImg] = useState('')
  const [nftMetadata, setNFTMetadataLink] = useState('')
  const { active, account, library, connector, activate, deactivate, chainId } = useWeb3React()

  const uplodateImgToIPFS = () => {

  }

  const uploadNFTMedia = async () => {
    const formData = new FormData()
    setLoading(true)
    formData.append("file", file)
    console.log(formData)
    const config = {
      headers: {
          'content-type': 'multipart/form-data'
      }
    }
    // const result = await uploadImage(formData, config)
    axios.post('https://memento-hack-mit.herokuapp.com/upload_file', formData, config).then((response) =>{
      const imgUrl = response.data.metadata_link
      setNFTImg(imgUrl)
      toast.success('NFT Media uploaded to IPFS!')
      setLoading(false)
    })
  }

  const createNFTMetadataIPFS = async () => {
    setLoading(true)
    const data = {
      name, description, imageUrl: nftImg
    }
    console.log(data)
    const result = await createNFTMetadata(data)
    console.log(result)
    setLoading(false)
    setNFTMetadataLink(result.data.metadata_link)
  }

  const createNFT = async () => {
    setLoading(true)
    try{
      const result = await createCollectible(library, chainId, account, nftMetadata)
      console.log(result)
      toast.success('Memorable minted as NFT!')
      setLoading(false)
      // setTimeout(() => {
      //   window.location.reload();
      // }, 1000)
    } catch(e) {
      setLoading(false)
    }
  }

  useEffect(()=>{
    if(nftMetadata) {
      createNFT()
    }
  }, [nftMetadata])

  useEffect(() => {
    console.log(file.type)
  }, [file])

  const renderMediaFile = () => {
    if(!file){
      return <></>
    }
    if(file.type.includes('image')) {
      return <img src = {URL.createObjectURL(file)} style={{width: 300, height: 300, marginTop: 20}} alt = "img" />
    } else if(file.type.includes('video')) {
      return   <video 
      controls 
      style={{width: 300, height: 300, marginTop: 20}}
      autoPlay
      src = {URL.createObjectURL(file)} />
    }
  }

  const renderCreateNFTMedia = () => {
    // if(!active) {
    //   return <></>
    // }
    if(nftImg) {
      return <></>
    }
    return <div style={{fontSize: 30, marginTop: 30, marginBottom: 30}} id="dropArea">
              Please upload your memorable moment <br />
              {/* <input
                  type="file" id="imageLoader" accept="image/*"
                  onChange = { (e) => setFile(e.target.files[0])}
                  style={{marginTop: 20, marginBottom: 20}}
              /> <br /> */}
                <div id="dropArea">
    <input type="file" id="imageLoader" accept="image/*" 
    
    onChange = { (e) => setFile(e.target.files[0])}/><br />
</div>
              {renderMediaFile()}  <br />
              {active ? <Button onClick={uploadNFTMedia} variant="contained" color="primary" style={{marginTop: 20}} disabled={loading}>
                          {loading ? 'uploading...' : 'upload'}
                        </Button> :
                        <Button variant="contained" color="primary" disabled>
                          Please Connect to wallet
                        </Button>

            }
            </div>
  }

  const renderCreateNFTMetaData = () => {
    if(!active) {
      return <></>
    }
    if(!nftImg) {
      return <></>
    }
    return    <div style={{fontSize: 30, marginTop: 30, marginBottom: 30}}>
                Create Memorable moment NFT metadata <br />
                <TextField 
                  onChange={(e)=>{setName(e.target.value)}}
                  label="Name"
                  style={{marginTop: 20}}
                /> 
                <br />
                <TextField 
                  onChange={(e)=>{setDescription(e.target.value)}}
                  label='Description'
                  multiline
                  rows={4}
                  style={{marginTop: 20, marginBottom: 40}}
                /> <br />
                <Button onClick={createNFTMetadataIPFS} variant="contained" color="primary" disabled={loading}>
                {loading ? 'Creating NFT...' : 'Create NFT'}
                </Button>
              </div>
  }

  return (
      <div
        style={{
          margin: "auto",
          height: "100%",
          marginLeft: "8px",
          marginRight: "8px",
        }}
      >
        <Typography className={classes.title}>
            INTERACTIVE NON-FUNGIBLE TOKENS TO MAKE MEMORY LAST FOREVER
        </Typography>
       

        {
          renderCreateNFTMedia()
        }

        {
          renderCreateNFTMetaData()
        }

      </div>
  );
}