/**
 * Helper function
 * Pass in the tokens, and return a LP pair string
 * @param {[Object]} tokenPair  array of token object
 * @return  {String}  eg. 'OURO-BNB'
 */
export const buildLPString = (tokenPair) => {
  let str = "";
  tokenPair.forEach((e, i) => {
    str += e.symbol.toUpperCase();
    if (i !== tokenPair.length - 1) {
      str += "-";
    }
  });
  return str;
};
