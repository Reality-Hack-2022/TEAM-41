import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { Box, Typography } from "@material-ui/core";
import { ACTIONS, SwapContext } from "../../contexts/SwapContext";
import { SelectorContext } from "./TokenSelector";
import { OPTIONS, Icon } from "../../components/Icon";

const useStyles = makeStyles(() => ({
  root: {
    width: "300px",
    margin: "20px 0 0 0",
  },
  iconPadding: {
    marginRight: "0px",
  },
  listContainer: {
    width: "330px",
    marginLeft: "-16px",
    marginRight: "-16px",
    height: 300,
    overflow: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
      webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(177, 219, 116, 1)",
      borderRadius: "4px",
    },
  },
  listItem: {
    "&:hover": {
      backgroundColor: "#ECF3E1",
    },
  },
  tokenName: {
    color: "#8F9688",
    fontSize: "12px",
  },
  tokenImg: {
    height: "32px",
  },
}));

// TODO: Disable all the tokens that have already selected (we dont want to swap between the same token)
// There should be a loop through to check if the token is selected, as well as to check the balance from wallet when the selector is opened
export default function TokenList({ data }) {
  const classes = useStyles();

  const { swap, swapDispatch } = useContext(SwapContext);
  const { setFilterList } = useContext(SelectorContext);
  const side = swap.currentSelectorSide

  /*
   * Fetch Token Info Here
   */
  const onClick = (token) => {
    swapDispatch({ type: ACTIONS.SET_TOKEN, payload: { token, side } });
    swapDispatch({ type: ACTIONS.CLOSE_TOKEN_SELECTOR });
    setFilterList([]);
  };

  return (
    <div className={classes.root}>
      <List className={classes.listContainer}>
        {data.map((token) => {
          return (
            <ListItem
              button
              className={classes.listItem}
              onClick={() => onClick(token)}
            >
              <ListItemIcon className={classes.iconPadding}>
                <Icon
                  size="32px"
                  type={OPTIONS.TYPE.TOKENS[token.symbol.toLowerCase()]}
                  alt="token"
                  style={{ marginLeft: 5 }}
                />
              </ListItemIcon>
              <Box
                display="flex"
                justifyContent="space-between"
                width="100%"
                alignItems="center"
              >
                <Box display="flex" flexDirection="column">
                  <Typography variant="h4">{token.symbol}</Typography>
                  <Typography className={classes.tokenName}>
                    {token.tokenName}
                  </Typography>
                </Box>
                <Typography>{token.balance}</Typography>
              </Box>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
