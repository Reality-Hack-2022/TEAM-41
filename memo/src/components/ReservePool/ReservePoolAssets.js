import React, { useContext, useEffect, useState } from "react";
import { Typography, Box, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import CircularProgress from "@material-ui/core/CircularProgress";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import { IsMobile } from "../../utils/mobile";
import { SwapContext } from "../../contexts/SwapContext";
import {
  getCurrentAssetPrice,
  getLastDayAssetPrice,
  getAssetReservedAmount,
} from "../../utils/contract";
import {
  ACTIONS,
  ReservedAssetContext,
} from "../../contexts/ReservedAssetContext";
import { web3Context } from "../../contexts/web3Context";
import NumberFormat from "react-number-format";
import { OPTIONS, Icon } from "../Icon";
import { fromTokenData } from "../../tokenData";

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
    [theme.breakpoints.down("xs")]: {
      minWidth: 100,
    },
  },
  tableHead: {
    color: "#8F9688",
  },
  tokenSymbol: {
    marginLeft: 5,
    marginRight: 5,
  },
  tokenName: {
    fontSize: 12,
    fontWeight: 500,
    color: "#8F9688",
  },
  warningIcon: {
    color: "#8F9688",
    width: 16,
    height: 16,
  },
  warningText: {
    color: "#8F9688",
    fontSize: 12,
    marginLeft: 5,
  },
}));

const TableHeadText = ({ children }) => (
  <Typography variant="body2" style={{ color: "#8F9688" }}>
    {children}
  </Typography>
);

const priceChangeText = (price) => {
  const color = parseFloat(price) > 0 ? "#6DA024" : "#F44B4B";
  return (
    <Typography style={{ color: color, fontWeight: "600" }}>
      {price + "%"}
    </Typography>
  );
};

export default function ReservePoolAssets() {
  const classes = useStyles();

  const isMobile = IsMobile();
  const alignText = () => (isMobile ? "center" : "right");

  const { web3 } = useContext(web3Context);
  const { chainId, w3 } = web3;
  const { reservedAsset, reservedAssetDispatch } = useContext(ReservedAssetContext);
  const { swap } = useContext(SwapContext);
  const { assetsStatus } = reservedAsset;

  const [loading, setLoading] = useState(true);

  const getAssetRowData = async (token) => {
    const currentPrice = await getCurrentAssetPrice(w3, chainId, token);
    const lastDayPrice = await getLastDayAssetPrice(w3, chainId, token);
    const reservedAssetAmount = await getAssetReservedAmount(
      w3,
      chainId,
      token
    );
    const priceChange = ((currentPrice - lastDayPrice) / lastDayPrice) * 100;
    let entry = {
      symbol: token,
      tokenName: fromTokenData.find((entry) => {
        return entry.symbol === token;
      }).tokenName,
      lastPrice: currentPrice.toFixed(2),
      changeIn24H: priceChange.toFixed(3),
      reservedAmount: reservedAssetAmount.toFixed(5),
    };
    return entry;
  };

  const getTokenPrice = async () => {
    if (w3) {
      const BNBRow = await getAssetRowData("BNB");
      const ETHRow = await getAssetRowData("ETH");
      const BTCRow = await getAssetRowData("BTC");
      reservedAssetDispatch({
        type: ACTIONS.SET_ASSET_STATUS,
        payload: { assetStatus: [BNBRow, ETHRow, BTCRow] },
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (w3) {
      getTokenPrice();
    }
  }, [w3, swap.recentTransactions]);

  return (
    <Container maxWidth="lg">
      <Box display="flex" my="30px" mt="80px">
        <Typography variant="h3">Assets in Reserve Pool</Typography>
      </Box>
      {loading ? (
        <Box my="50px">
          <CircularProgress />
        </Box>
      ) : (
        <Box my="25px">
          <TableContainer>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="left">
                    <TableHeadText>Assets</TableHeadText>
                  </TableCell>
                  <TableCell align={alignText()}>
                    <TableHeadText>Last Price</TableHeadText>
                  </TableCell>
                  {!isMobile && (
                    <TableCell align={alignText()}>
                      <TableHeadText>24h Change (%)</TableHeadText>
                    </TableCell>
                  )}
                  <TableCell align={alignText()}>
                    <TableHeadText>Reserved Amount</TableHeadText>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assetsStatus.map((row) => {
                  return (
                    <TableRow key={row.symbol}>
                      <TableCell component="th" scope="row">
                        <Box display="flex" alignItems="center">
                          <Icon
                            size="24px"
                            type={OPTIONS.TYPE.TOKENS[row.symbol.toLowerCase()]}
                          />
                          <Typography className={classes.tokenSymbol}>
                            {row.symbol}
                          </Typography>
                          {!isMobile && (
                            <Typography className={classes.tokenName}>
                              {row.tokenName}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align={alignText()}>
                        <Typography>
                          <NumberFormat
                            value={row.lastPrice}
                            displayType="text"
                            thousandSeparator={true}
                            prefix="$"
                          />
                        </Typography>
                      </TableCell>
                      {!isMobile && (
                        <TableCell align="right">
                          <Typography>
                            {priceChangeText(row.changeIn24H)}{" "}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell align={alignText()}>
                        <Typography>
                          <NumberFormat
                            value={row.reservedAmount}
                            displayType={"text"}
                            thousandSeparator={true}
                            prefix={""}
                          />
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      <Box display="flex" mb="50px">
        <ErrorOutlineIcon className={classes.warningIcon} />
        <Typography className={classes.warningText}>
          Please note that all assets moved via <strong>Venus</strong> will be
          subject to a withdrawal fee of 0.01%
        </Typography>
      </Box>
    </Container>
  );
}
