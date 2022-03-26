import React from "react";
import LOGOIMG from "../../assets/logo.svg";
import { useHistory } from "react-router-dom";

// TODO: Logo Size Variations
export default function Logo() {
  const history = useHistory();

  return (
    <div>
      <h1>MEMENTO</h1>
      {/* <img
        style={{ cursor: "pointer" }}
        src={LOGOIMG}
        alt="LOGO"
        onClick={() => history.push("/")}
      /> */}
    </div>
  );
}
