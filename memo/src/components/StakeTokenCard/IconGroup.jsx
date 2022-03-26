import React from "react";
import { Avatar } from "@material-ui/core";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import { OPTIONS, Icon } from "../Icon";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  tokenPairIcon: {
    marginRight: 20,
  },
  tokenIcon: {
    backgroundColor: "#fff",
    marginRight: "-2px",
    border: "none",
  },
});

export default function IconGroup({ tokenPair }) {
  const classes = useStyles();

  return (
    <>
      <AvatarGroup max={2} className={classes.tokenPairIcon}>
        {tokenPair.map((token) => {
          return (
            <Avatar key={token.symbol} className={classes.tokenIcon}>
              <Icon
                size="100%"
                type={OPTIONS.TYPE.TOKENS[token.symbol.toLowerCase()]}
                alt="token"
              />
            </Avatar>
          );
        })}
      </AvatarGroup>
    </>
  );
}
