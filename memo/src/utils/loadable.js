import React from "react";
import Loadable from "react-loadable";
import LoadingView from "../components/Loading"

/**
 * @param {String} content  The name of the page, eg. Signup / Login
 */

// TODO: Change the loading view
const createLoadable = (content) => {
  return Loadable({
    loader: () => import(`../views/pages/${content}/index`),
    loading: ({ isLoading }) => isLoading && <LoadingView />,
  });
};

export default createLoadable;