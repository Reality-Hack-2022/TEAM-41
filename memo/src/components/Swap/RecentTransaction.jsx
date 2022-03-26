import React, { useContext, useEffect } from "react";
import Modal from "../Modal";
import { List, ListItem, Typography, Box } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { ACTIONS, SwapContext } from "../../contexts/SwapContext";

const styles = () => ({
  transaction: {
    color: "#6DA024",
    "&:hover": {
      color: "#B1DB74",
      textDecoration: "underline",
    },
    marginLeft: "-5px",
  },
});

const Transaction = withStyles(styles)(({ children, classes, href }) => {
  return (
    <ListItem component="a" href={href}>
      <Typography variant="body2" className={classes.transaction}>
        {children}
      </Typography>
    </ListItem>
  );
});

// TODO: Connect to wallet @Jeff
export default function RecentTransaction() {
  const { swap, swapDispatch } = useContext(SwapContext);

  useEffect(() => {
    swapDispatch({
      type: ACTIONS.SET_TRANSACTIONS,
      payload: {
        transactions: [],
      },
    });
  }, []);

  return (
    <Modal
      open={swap.recTransactionToggled}
      onClose={() => swapDispatch(ACTIONS.CLOSE_RECENT_TRANSACTION)}
      TitleProps={{
        onClose: () => swapDispatch(ACTIONS.CLOSE_RECENT_TRANSACTION),
      }}
    >
      <Box display="flex" justifyContent="center" alignItems="center">
        <List style={{ minWidth: 250 }}>
          {swap.recentTransactions.map((tx, index) => {
            return (
              <Transaction href="#" id={index}>
                {tx}
              </Transaction>
            );
          })}
          {swap.recentTransactions.length < 1 && (
            <Box ml="8px">
              <Typography color="textSecondary" variant="body2">
                No Recent Transaction
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Modal>
  );
}
