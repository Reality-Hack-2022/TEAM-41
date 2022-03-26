/**
 *  Layout for modal components
 */
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import { PropTypes } from "prop-types";

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(3),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  }
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h4">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);


/**
 * @param {string} title 
 * @param {object} TitleProps props for DialogTitle
 * @param {object} ContentProps props for DialogContent
 * @param {bool} open state control
 * @param {func} onClose remember also pass the onClose to TitleProps to enable the close button
 */
function Modal(props) {
  const { title, TitleProps, ContentProps, children } = props;

  return (
    <Dialog {...props}>
      <DialogTitle {...TitleProps}>{title}</DialogTitle>
      <DialogContent dividers {...ContentProps}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

Modal.propTypes = {
    title: PropTypes.string,
    TitleProps: PropTypes.object,
    ContentProps: PropTypes.object
};
  
export default Modal;