import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";

const OuroTooltip = withStyles((theme) => ({
  arrow: {
    color: "rgba(0, 0, 0, 0.8)",
  },
  tooltip: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "background: #FFFFFF",
    fontSize: theme.typography.pxToRem(12),
    borderRadius: "4px",
    padding: "12px",
  },
}))(Tooltip);

export default function CustomizedTooltip(props) {
  return <OuroTooltip {...props}>{props.children}</OuroTooltip>;
}
