import React, { useContext } from "react";
import { MenuContext } from "./index";
import { SwipeableDrawer, List, ListItem, Box } from "@material-ui/core";
import { NavLink } from "react-router-dom";
import { useStyles } from "./style";
import CloseIcon from "@material-ui/icons/Close";
import { Icon } from "../../../components/Icon";

export default function MobileMenu({ nav }) {
  const { menuToggled, setMenuToggled } = useContext(MenuContext);

  const classes = useStyles();

  const toggleMenu = (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setMenuToggled(!menuToggled);
  };

  return (
    <>
      <SwipeableDrawer anchor="right" open={menuToggled} onClose={toggleMenu}>
        <List className={classes.mobileMenuContainer}>
          <ListItem disableGutters>
            <CloseIcon
              style={{ color: "#8F9688", cursor: "pointer", marginBottom: '30px', marginTop: '10px'}}
              onClick={toggleMenu}
            />
          </ListItem>
          {nav.map((e) => {
            return (
              <ListItem
                key={e.name}
                button
                onClick={toggleMenu}
                className={classes.navLinkMobile}
                disableGutters
              >
                <Box display="flex" alignItems="center">
                  <Icon
                    size="24px"
                    type={e.icon}
                    className={classes.mobileMenuIcon}
                  />
                  <NavLink
                    to={e.href}
                    className={classes.navLink}
                    activeStyle={{
                      color: "#9DD251",
                      fontWeight: "700",
                      textDecoration: "none",
                    }}
                    exact={true}
                  >
                    {e.name}
                  </NavLink>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </SwipeableDrawer>
    </>
  );
}
