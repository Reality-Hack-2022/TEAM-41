import React from 'react'

const DEFAULT_WEB3 = {
    'chainId': null,
    'selectedAddress': null,
    'w3': null
}

const web3Context = React.createContext()

export {
    DEFAULT_WEB3, web3Context
}