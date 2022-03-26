import React from "react";
import { createMuiTheme, ThemeProvider, responsiveFontSizes } from "@material-ui/core";
import "./style/Global.css";

/**
 * Theme Customization
 */

let theme = createMuiTheme({
  shape: {
    borderRadius: '16px'
  },
  palette: {
    primary: {
      main: "#002ac2",
    },
    secondary: {
      main: '#001a6d'
    },
    textSecondary: {
      main: '#002ac2'
    },
  },
  typography: {
    allVariants: {
      color: '#233433'
    },  
    h1:{
      fontSize: '40px',
      '@media (max-width:600px)': {
        fontSize: '38px',
      },
      fontStyle: 'normal',
      fontWeight: 'bold',
    },
    h2:{
      fontSize: '24px',
      '@media (max-width:600px)': {
        fontSize: '22px',
      },
      fontStyle: 'normal',
      fontWeight: 'bold',
    },
    h3:{
      fontSize: '24px',
      '@media (max-width:600px)': {
        fontSize: '22px',
      },
      fontStyle: 'normal',
      fontWeight: '600',
    },
    h4:{
      fontSize: '16px',
      '@media (max-width:600px)': {
        fontSize: '14px',
      },
      fontStyle: 'normal',
      fontWeight: '600',
    },
    subtitle1:{
      fontSize: '24px',
      '@media (max-width:600px)': {
        fontSize: '22px',
      },
      fontStyle: 'normal',
      fontWeight: '500',
    },
    subtitle2:{
      fontSize: '18px',
      '@media (max-width:600px)': {
        fontSize: '16px',
      },
      fontStyle: 'normal',
      fontWeight: '500',
    },
    body1:{
      fontSize: '16px',
      '@media (max-width:600px)': {
        fontSize: '14px',
      },
      fontStyle: 'normal',
      fontWeight: '500',
    },
    body2:{
      fontSize: '14px',
      '@media (max-width:600px)': {
        fontSize: '12px',
      },
      fontStyle: 'normal',
      fontWeight: '500',
    },
    fontFamily: ["montserrat", "sans-serif"].join(","),
  },
});


theme = responsiveFontSizes(theme);

export default function OuroTheme({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
