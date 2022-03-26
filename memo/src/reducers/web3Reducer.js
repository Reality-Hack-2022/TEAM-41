const web3Reducer = (state, action) => {
    switch (action.type) {
        case 'CONNECT':
            return {
                ...state, ...action.data
            }
        case 'DISCONNECT': {
            return {
                'w3': null,
                'selectedAddress': null,
                'chainId': null
            }
        }
        case 'ACCOUNT_CHANGED': {
            return {
                ...state,
                selectedAddress: action.selectedAddress
            }
        }
        default:
            return state
    }
}

export default web3Reducer