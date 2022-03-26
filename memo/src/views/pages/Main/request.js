import {
    UPLOAD_IMAGE_URL,
    CREATE_NFT_METADATA_URL
} from './config.js'
import axios from 'axios'

const uploadImage = async (formData, config) => {
    const result = await axios.post(UPLOAD_IMAGE_URL, formData, config)
    return result
}

const createNFTMetadata = async (data) => {
    const result = await axios.post(CREATE_NFT_METADATA_URL, data)
    return result
}

export {
    uploadImage,
    createNFTMetadata
}