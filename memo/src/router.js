import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Navbar from "./views/sections/NavBar";
import { default as LoadPage } from "./utils/loadable";


const MainPage = LoadPage("Main");
const NFTCard = LoadPage("NFTCard")
const NFTGallery = LoadPage("NFTGallery")

const AppRouter = () => {
  return (
    <Router>
      <Navbar />
      <Switch>
        <div
          style={{
            position: "relative",
            minHeight: "80vh",
          }}
        >
          <div>
            <Route exact path="/" component={MainPage} />
            <Route exact path="/gallery" component={NFTGallery} />
            <Route exact path="/nft/:id" component={NFTCard} />
          </div>
        </div>
        <Redirect to="/" />
      </Switch>
    </Router>
  );
};

export default AppRouter;
