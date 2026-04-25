/** @format */

import { Navigate } from "react-router-dom";

const PrivateRouter = ({ children }) => {
  const firstLogin = localStorage.getItem("firstLogin");

  if (!firstLogin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRouter;
