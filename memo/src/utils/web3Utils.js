import Web3 from 'web3'
import { toast } from "react-hot-toast";

const NODE_URL = 'https://rinkeby.infura.io/v3/91516e24ebff4dac8f2bd04b829f102d'

const loadWeb3 = (dispatch) => {
    const w3 = new Web3(NODE_URL)
    dispatch({
        type: 'CONNECT',
        data: {
            w3
        }
    })
}

const Connect = (dispatch, resp, address) => {
    const chainId = resp.networkVersion
    let selectedAddress = resp.selectedAddress
    const w3 = new Web3(window.ethereum)
    if(!selectedAddress) {
        selectedAddress = address
    }
    dispatch({
        type: 'CONNECT',
        data: {
            chainId, selectedAddress, w3
        }
    })
}

const ConnectToMetaMask = (dispatch) => {

    const eth = window.ethereum
    console.log(31, eth)

    if (eth) {

        if (eth.selectedAddress === null) {

            eth.enable().then((address) => {
                Connect(dispatch, eth, address)
            }).catch((err) => {
                toast.error('Error. Try to refresh.')
                console.log(err)
            })
    
        } else {
            Connect(dispatch, eth)
        }
  
    } else {
        toast.error('Please install metamask to use the website')
    }

}

const attachListener = (dispatch) => {

    const eth = window.ethereum

    if (eth) {

        const currentNetwork = parseInt(eth.networkVersion)
        if (eth.chainId != '0x38' && eth.chainId !== null) {
            toast.error('Please select BSC network and reload the page!')
        }

        eth.on('accountsChanged', function (accounts) {
            if (accounts.length === 0) {
                dispatch({
                    type: 'DISCONNECT',
                })
                loadWeb3(dispatch)
            }
            dispatch({
                type: 'ACCOUNT_CHANGED',
                selectedAddress: eth.selectedAddress
            })
        })

        eth.on('networkChanged', function (networkId) {
            if (networkId === '56') {
                Connect(dispatch, eth)
            } else{
                toast.error('Please select BSC mainnet!')
            }
        })

    }
}

export { loadWeb3, ConnectToMetaMask, attachListener }