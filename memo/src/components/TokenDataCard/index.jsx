import { Paper, Box, Typography, Grid, useMediaQuery } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import propTypes from "prop-types";
import { useTheme } from "@material-ui/core/styles";
import { web3Context } from "../../contexts/web3Context";
import {
  getOGSPrice,
  getOGSCirculatingSupply,
  getOuroTotalSupply,
  getOuroDefaultRate,
} from "../../utils/contract";
import Skeleton from "@material-ui/lab/Skeleton";
import NumberFormat from "react-number-format";
import Grow from '@material-ui/core/Grow';

const useStyles = makeStyles((theme) => ({
  container: {
    // margin: 'auto',
    padding: "24px",
    [theme.breakpoints.down("xs")]: {
      padding: "16px",
    },
    borderRadius: "16px",
    minWidth: "300px",
    maxWidth: "486px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05);",
  },
  title: {
    color: "#8F9688",
  },
  priceLg: {
    fontSize: "24px",
    fontWeight: "500",
  },
  priceSm: {
    fontSize: "16px",
    fontWeight: "500",
  },
  row: {
    marginTop: "16px",
    [theme.breakpoints.down("xs")]: {
      marginTop: "8px",
    },
  },
}));

function TokenDataCard({
  token,
  tokenImgPath,
  mobileImgPath,
  defaultExPrice,
  price,
  circSupply,
  totalSupply,
  marketCap,
}) {
  const classes = useStyles();
  const { web3 } = useContext(web3Context);
  const [tokenSupply, setTokenSupply] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const { chainId, w3 } = web3;

  const getTokenInfo = async () => {
    if (token === "OGS") {
      const supply = await getOGSCirculatingSupply(w3, chainId);
      const price = await getOGSPrice(w3, chainId);
      setTokenSupply(supply);
      setTokenPrice(price);
      setLoading(false);
    } else if (token === "OURO") {
      const supply = await getOuroTotalSupply(w3, chainId);
      const price = await getOuroDefaultRate(w3, chainId);
      setTokenSupply(supply);
      setTokenPrice(price);
      setLoading(false);
    }
  };

  useEffect(() => {
    getTokenInfo();
  }, []);

  const ResponsiveTokenImg = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
    return isMobile ? (
      <img alt="token" src={mobileImgPath} />
    ) : (
      <img alt="token" src={tokenImgPath} />
    );
  };

  return (
    <Grow in={true}>
      <Paper className={classes.container}>
        {ResponsiveTokenImg()}
        {defaultExPrice && (
          <Box mt="24px">
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="flex-end"
            >
              <Grid item alignItems="stretch">
                <Typography variant="body1" className={classes.title}>
                  Exchange Price
                </Typography>
              </Grid>
              <Grid item>
                {loading ? (
                  <Skeleton width="150px" />
                ) : (
                  <Typography variant="subtitle1">
                  <>
                    {'$'}
                    <NumberFormat
                      value={Number(tokenPrice).toFixed(4)}
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                    </>
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        )}
        {price && (
          <Box mt="24px">
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="flex-end"
            >
              <Grid item>
                <Typography variant="body1" className={classes.title}>
                  Price
                </Typography>
              </Grid>
              <Grid item>
                {loading ? (
                  <Skeleton width="150px" />
                ) : (
                  <Typography variant="subtitle1">
                    <NumberFormat
                      value={Number(tokenPrice).toFixed(8)}
                      displayType={"text"}
                      thousandSeparator={true}
                      prefix="$"
                    />
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        )}
        <Grid
          container
          direction="row"
          justify="space-between"
          className={classes.row}
        >
          <Grid item>
            <Typography variant="body1" className={classes.title} onClick={()=>{alert(totalSupply)}}>
              Circulating Supply
            </Typography>
          </Grid>
          <Grid item>
            {loading ? (
              <Skeleton width="150px" />
            ) : (
              <Typography variant="body1">
                <NumberFormat
                  value={Number(tokenSupply).toFixed(4)}
                  displayType={"text"}
                  thousandSeparator={true}
                />
                &nbsp;
                {token}
              </Typography>
            )}
          </Grid>
        </Grid>
        {/* {totalSupply && (
          <Grid
            container
            direction="row"
            justify="space-between"
            className={classes.row}
          >
            <Grid item>
              <Typography variant="body1" className={classes.title}>
                Total Supply
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1">{totalSupply}</Typography>
            </Grid>
          </Grid>
        )} */}
        <Grid
          container
          direction="row"
          justify="space-between"
          className={classes.row}
        >
          <Grid item>
            <Typography variant="body1" className={classes.title}>
              Market Cap
            </Typography>
          </Grid>
          <Grid item>
            {loading ? (
              <Skeleton width="150px" />
            ) : (
              <Typography variant="body1">
                <NumberFormat
                  value={Number(tokenPrice * tokenSupply).toFixed(0)}
                  displayType={"text"}
                  thousandSeparator={true}
                  prefix="$"
                />
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Grow>
  );
}

TokenDataCard.propTypes = {
  token: propTypes.string,
  tokenImgPath: propTypes.string,
  defaultExPrice: propTypes.string,
  price: propTypes.string,
  circSupply: propTypes.string,
  totalSupply: propTypes.string,
  marketCap: propTypes.string,
};

export default TokenDataCard;
