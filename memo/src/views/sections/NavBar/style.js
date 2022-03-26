import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  navBar: {
    boxShadow: "none",
    padding: "10px",
    height: '80px',
    [theme.breakpoints.down("xs")]:{
      height:'64px'
    }
  },
  navLink: {
    fontFamily: "montserrat, sans-serif",
    fontWeight: "600",
    fontSize: "16px",
    color: "#233433",
    textDecoration: "none",
    "&:hover":{
      color: '#6DA024'
    },
    [theme.breakpoints.down("xs")]:{
      fontWeight: "600",
      fontSize: "18px",
    },
  },
  flexContainer: {
    display: "flex",
    flexDirection: "row",
    padding: 0,
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  btn: {
    height: '40px',
    "&:hover":{
      backgroundColor: '#B1DB74'
    },
    [theme.breakpoints.down("xs")]:{
      height: '32px',
    }
  },
  menuIcon: {
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
    cursor: "pointer",
    marginLeft: 20,
  },
  mobileMenuContainer:{
    minWidth:'240px',
    marginLeft:'24px'
  },
  mobileMenuIcon:{
    marginRight: '10px',
    marginLeft: '2px'
  },
  navLinkMobile:{
    marginBottom: '25px'
  }
}));
