import React from "react";
import { Box, Grid, Container, useMediaQuery } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import IntroParagraph from "./Intro";;

const DesktopVersion = () => {
  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={6}
      >
        <Grid item>
          <IntroParagraph />
        </Grid>
        {/* {tokenInfo.map((token) => (
          <Grid item xs={6}>
            <TokenDataCard {...token} />
          </Grid>
        ))} */}
      </Grid>
    </Grid>
  );
};

const MobileVersion = () => {
  return (
    <Grid
      container
      direction="column-reverse"
      justifyContent="center"
      alignItems="center"
    >
      {/* <Grid item>
        {tokenInfo.map((token) => (
          <Box mt="40px">
            <TokenDataCard {...token} />
          </Box>
        ))}
      </Grid> */}
      <Grid item>
        <IntroParagraph />
      </Grid>
    </Grid>
  );
};

const TabletVersion = () => {
  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      <Grid
        container
        direction="row"
        justifyContent="stretch"
        alignItems="stretch"
        spacing={5}
      >
        <Grid item>
          <IntroParagraph />
        </Grid>
        {/* {tokenInfo.map((token) => (
          <Grid item xs={6}>
            <TokenDataCard {...token} />
          </Grid>
        ))} */}
      </Grid>
    </Grid>
  );
};

const Main = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

  const ResponsiveContent = () => {
    if (isDesktop) {
      return <DesktopVersion />;
    } else if (isMobile) {
      return <MobileVersion />;
    } else if (isTablet) {
      return <TabletVersion />;
    }
  };

  // TODO: call smart contract API to get total supply, current price
  return (
    <>
      <Box mt="50px">
        <Container style={{maxWidth: '1200px'}}>{ResponsiveContent()}</Container>
      </Box>
    </>
  );
};

export default Main;
