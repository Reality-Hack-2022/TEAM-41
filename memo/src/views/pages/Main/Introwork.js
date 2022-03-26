import React, { useEffect, useState } from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Fade from "@material-ui/core/Fade";
import { Player } from 'video-react';
import "./style.css"


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

    formData.append("file", file)
    console.log(formData)
    const config = {
      headers: {
          'content-type': 'multipart/form-data'
      }
    }
 
    // const result = await uploadImage(formData, config)
    console.log(file)
    axios.post('https://memento-hack-mit.herokuapp.com/upload_file', formData, config).then((response) =>{
      const imgUrl = response.data.metadata_link
      setNFTImg(imgUrl)
      alert('NFT Media uploaded to IPFS!')
    })
  }

  const createNFTMetadataIPFS = async () => {
    const data = {
      name, description, imageUrl: nftImg
    }
    console.log(data)
    const result = await createNFTMetadata(data)
    console.log(result)
    setNFTMetadataLink(result.data.metadata_link)

  }

  const createNFT = async () => {
    const result = await createCollectible(library, chainId, account, nftMetadata)
    console.log(result)
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

  return (
    <Fade in={true} timeout={500}>
      <div
        className=""
        style={{
          margin: "auto",
          height: "100%",
          marginLeft: "8px",
          marginRight: "8px",
        }}
      >
        {/* <Typography className={classes.title}>What is Ouro?</Typography>
        <br />
        <Typography variant="body1" component="p" className={classes.body}>
          The project aims to derive fiat inflations manifested in the growth of
          the value of crypto assets and migrates them onto OURO, making it an
          inflation-proof store of value. Please See our{" "}
          <a
            href="https://docs.ouro.finance"
            target="_blank"
            className={classes.link}
          >
            documents
          </a>{" "}
          for more details.
        </Typography> */}
  
        <div style={{fontSize: 40, margin: 30}}>
          NFT media file <br />
          <input 
              type='file'
              id="imageLoader"
              accept="image/*"
              onChange = { (e) => setFile(e.target.files[0])}
          />  <br />
          {renderMediaFile()} 
          <br />
          <button onClick={uploadNFTMedia}>
            Create NFT Media asset
          </button> <br />

          NFT name: <br />
          <input onChange={(e)=>{setName(e.target.value)}}/> <br />
          NFT description: <br />
          <input onChange={(e)=>{setDescription(e.target.value)}}/> <br />
          <button onClick={createNFTMetadataIPFS}>Create NFT</button>
        </div>
      </div>
    </Fade>
  );
}
