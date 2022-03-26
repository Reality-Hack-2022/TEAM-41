import React, { useContext, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "../Modal";
import TokenList from "./TokenList";
import InputBase from "@material-ui/core/InputBase";
import { ACTIONS, SwapContext } from "../../contexts/SwapContext";

export const SelectorContext = React.createContext();

const useStyles = makeStyles(() => ({
  searchInput: {
    width: "100%",
    backgroundColor: "#F6F6F6",
    padding: "10px",
    borderRadius: "16px",
    fontSize: "14px",
    marginTop: "10px",
  },
}));

const searchFilter = (array, value) => {
  return array.filter(
    (data) =>
      JSON.stringify(data).toLowerCase().indexOf(value.toLowerCase()) !== -1
  );
};

export default function TokenSelector() {
  const { swap, swapDispatch } = useContext(SwapContext);
  const { fromToken } = swap
  const [filterList, setFilterList] = useState([]);
  const side = swap.currentSelectorSide

  let tokenList = []

  if(fromToken.symbol === 'OURO') {
    tokenList = swap.fromTokenList
  } else if (side === 'from') {
    tokenList = swap.fromTokenList
  } else if (side === 'to') {
    tokenList = swap.toTokenList
  } else {
    tokenList = []
  }

  const classes = useStyles();

  useEffect(() => {
    setFilterList(tokenList)
  }, [side]);

  return (
    <SelectorContext.Provider value={{ filterList, setFilterList }}>
      <Modal
        title="Select a token"
        onClose={() => swapDispatch({ type: ACTIONS.CLOSE_TOKEN_SELECTOR })}
        open={swap.tokenSelectorToggled}
        TitleProps={{
          onClose: () => swapDispatch({ type: ACTIONS.CLOSE_TOKEN_SELECTOR }),
        }}
      >
        <InputBase
          className={classes.searchInput}
          placeholder="Search token name or symbol"
          onChange={(e) => {
            if (e.target.value === "") {
              // Reset to default list
              setFilterList(tokenList);
            } else {
              setFilterList(searchFilter(tokenList, e.target.value));
            }
          }}
        />
        <TokenList data={filterList} />
      </Modal>
    </SelectorContext.Provider>
  );
}
