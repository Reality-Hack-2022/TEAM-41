import React from "react";
import { Box, Typography } from "@material-ui/core";
import { OPTIONS, Icon } from "../../components/Icon";
import Tooltip from "../../components/Tooltip";
// import Countdown from "react-countdown";

/**
 * This will be displayed only in OURO Staking
 */
export default function StakingMessage({ staked, pendingVestReward, timeLeft }) {
  return (
    <>
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      my="10px"
      padding="5px"
      style={{
        backgroundColor: "#F6F6F6",
        borderRadius: "10px",
      }}
    >
      {staked ? (
        <>
          <Typography color="textSecondary" style={{ fontSize: "12px" }}>
            50% OGS reduced if harvesting locked rewards within 90 days <br />
          </Typography>
        </>
        // <>
        //   <Typography
        //     color="primary"
        //     style={{ fontSize: "14px", fontWeight: "700" }}
        //   >
        //     <Countdown date={timeLeft} daysInHours />
        //   </Typography>
        //   <Typography color="textSecondary" style={{ fontSize: "12px" }}>
        //     &nbsp; left to get full OGS rewards &nbsp;
        //   </Typography>
        // </>
      ) : (
        <div></div>
        // <Typography color="textSecondary" style={{ fontSize: "12px" }}>
        //   50% OGS reduced if unstaking within <strong>90 days</strong> &nbsp;
        // </Typography>
      )}
      <Tooltip
        title="All OGS rewards are subject to a 3-month lockup."
        placement="top-end"
        arrow
      >
        <Icon type={OPTIONS.TYPE.info} />
      </Tooltip>
    </Box>
    </>
  );
}
