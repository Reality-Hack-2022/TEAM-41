import React from 'react'
import CloseIcon from "@material-ui/icons/Close";
import { IconButton } from "@material-ui/core";

export default function CloseButton(props) {
    return (
        <IconButton {...props} disableElevation disableRipple>
            <CloseIcon />
        </IconButton>
    )
}
