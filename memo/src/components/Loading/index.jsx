import React, { useMemo } from "react";
import { Box } from "@material-ui/core";
import { useLottie } from "lottie-react";
import ouroLoading from "./ouro_loading.json";

const style = {
  height: 100,
};

export default function Loading() {
  // avoid re-rendering of loading animation
  const options = useMemo(() => {
    return { animationData: ouroLoading, autoplay: true, loop: true };
  }, [ouroLoading]);

  const { View } = useLottie(options, style);

  return (
    <Box
      display="flex"
      width="100vw"
      height="100vh"
      justifyContent="center"
      alignItems="center"
    >
      {View}
    </Box>
  );
}
