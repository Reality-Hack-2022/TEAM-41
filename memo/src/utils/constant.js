import { BigNumber } from "@ethersproject/bignumber";

const OURO = 'OURO'
const OGS = 'OGS'
const OURO_RESERVE = 'OURO_RESERVE'
const OURO_STAKING = 'OURO_STAKING'
const OURO_FARM = 'OURO_FARM'
const PANCAKE_ROUTER_V2 = 'PANCAKE_ROUTER_V2'

const MaxUint256 = (/*#__PURE__*/BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));

const BLOCKS_PER_YEAR = 10512000

const OGS_HOLDING_ADDRESS = [
    '0x84A96F2B60a73658da69f9985079b16d9758859A', 
    '0x86c463382a83Fd907Bdc21c92CC7e978dfe189c6', 
    '0x7469507c8A8074066629f3e832081d3339f230bF', 
    '0xD3e9F7701CDa1fE4834Fa48fa9cA2a4b0C64B942', 
    '0x941421E1D4f1f7482D86ab9804c17a5aEB97350e', 
    '0x98CEa58751F819490DD005D0CB9A7194c7d0FA83', 
    '0x71FfD4175Eef64d455B7eaa0e1d952B0F08c0675'
]

const CONTRACT_ADDRESS = {
    BUSD: {
        '56': '0xe9e7cea3dedca5984780bafc599bd69add087d56'
    },
    USDC: {
        '56': '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
    },
    USDT: {
        '56': '0x55d398326f99059ff775485246999027b3197955'
    },
    BNB: {
        '56': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
    },
    ALPACA: {
        '56': '0x8f0528ce5ef7b51152a59745befdd91d97091d2f'
    },
    CAKE: {
        '56': '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'
    },
    ETH: {
        '56': '0x2170ed0880ac9a755fd29b2688956bd959f933f8'
    },
    BTC: {
        '56': '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c'
    },
    BTCB: {
        '56': '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c'
    },
    OURO: {
        '56': '0x0a4fc79921f960a4264717fefee518e088173a79'
    },
    OGS: {
        '56': '0x416947e6Fc78F158fd9B775fA846B72d768879c2'
    },
    OGS_VAULT: {
        '56': '0xc9F3968DDe07887e86D3D77D4484C4f65073e7Cb'
    },
    OURO_STAKING_OUTDATED: {
        // "56": "0x39a3fF2725eae11d4D45c05256858f1EAe2a871B",
        "56": "0x5Ad8E05797dee251E0aEE62D67E93CF43AA3Bd06"
    }, 
    OURO_STAKING: {
        "56": "0x39a3fF2725eae11d4D45c05256858f1EAe2a871B",
    }, 
    VESTING: {
        '56': '0x4b573cce3899c402521ece88c38b2dd5c3c54c72'
        // '56': '0x0f77475300994a572a3c9a70d32f447bdb504046'
    },
    OGS_STAKING: {
        // '56': '0x699187e6a34059617310d12cAf8CBd727F918c3b'
        // '56': '0xf661DC3B88FF4A8FE4fCeeec55282e0cC271CA2C'
        // '56': '0xa571F0B56EfdC5932ED7d4c94B4dDa700650412C'
        '56': '0x8c150A5FabB59991c849b946FE9dF97FE3e52026'
    },
    BNB_STAKING: {
        '56': '0x1539F25Cc730b0e91cbe1DB89648166FD77b01C5'
    },
    ETH_STAKING: {
        '56': '0xf57e3Ca0ec704E244fB7bfd07f2D8325562e1EA4'
    },
    BTC_STAKING: {
        '56': '0x718Bc7B1Bd8ad56b0826CE825F94bdE47c359BfE'
    },
    BTCB_STAKING: {
        '56': '0x718Bc7B1Bd8ad56b0826CE825F94bdE47c359BfE'
    },
    BNB_PRICE_FEED: {
        '56': '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE'
    },
    ETH_PRICE_FEED: {
        '56': '0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e'
    },
    BTC_PRICE_FEED: {
        '56': '0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf'
    },
    BTCB_PRICE_FEED: {
        '56': '0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf'
    },
    PANCAKE_ROUTER_V2: {
        '56': '0x10ED43C718714eb63d5aA57B78B54704E256024E'
    },
    OGS_BUSD_STAKING: {
        '56': '0x187ea30585c609d5a21b14fd3feb7cee97adf352'
    },
    OURO_BUSD_STAKING: {
        "56": "0xd5ba60b75f2dfe93a2e3fdca078490ab28bbc6f6"
    },
    OURO_DIST: {
        '56': "0x15a59d5f5847df9f6c24272096e967fa10ffb18a",
    },
    OGS_BUSD: {
        '56': '0xc9bff692631ab035fcb51c777021a09e4ad2fec7'
    },
    OURO_BUSD: {
        '56': '0x8d0b50a46f1b251858116c96ccb5c9f54621bb70'
    },
    OURO_RESERVE: {
        // '56': '0x8739aBC0be4f271A5f4faC825BebA798Ee03f0CA'
        '56': '0xEBc85Adf95498E53529b1c43e16E2D46e06d9E0e'
    },
    VBNB: {
        '56': '0xa07c5b74c9b40447a954e1466938b865b6bbea36'
    },
    VETH: {
        '56': '0xf508fcd89b8bd15579dc79a6827cb4686a3592c8'
    },
    VBTCB: {
        '56': '0x882c173bc7ff3b7786ca16dfed3dfffb9ee7847b'
    }
}

const VENUS_DEPOSIT_TOKEN = {
    'VBNB': {
        'AMOUNT': '0.01',
        'TS': 1641932288
    },
    'VBTCB': {
        'AMOUNT': '0.0002',
        'TS': 1642086627
    },
    'VETH': {
        'AMOUNT': '0.001',
        'TS': 1642085793
    }
}

export { OURO, OGS, OURO_RESERVE, OURO_STAKING, OURO_FARM, PANCAKE_ROUTER_V2 }
export { MaxUint256, BLOCKS_PER_YEAR}
export { CONTRACT_ADDRESS }
export { OGS_HOLDING_ADDRESS }
export { VENUS_DEPOSIT_TOKEN }