/** @format */

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PageRender from "./customRouter/PageRender";
import PrivateRouter from "./customRouter/PrivateRouter";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";

import Alert from "./components/alert/Alert";
import Header from "./components/header/Header";
import StatusModal from "./components/StatusModal";

import { useSelector, useDispatch } from "react-redux";
import { refreshToken } from "./redux/actions/authAction";
import { getPosts } from "./redux/actions/postAction";
import { getSuggestions } from "./redux/actions/suggestionsAction";
import { getNotifies } from "./redux/actions/notifyAction";

import io from "socket.io-client";
import { GLOBALTYPES } from "./redux/actions/globalTypes";
import SocketClient from "./SocketClient";

import CallModal from "./components/message/CallModal";
import Peer from "peerjs";

function App() {
  const { auth, status, modal, call } = useSelector((state) => state);
  const dispatch = useDispatch();

  // 🔥 INIT SOCKET
  useEffect(() => {
    dispatch(refreshToken());

    const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:9090", {
      transports: ["websocket"],
    });

    dispatch({ type: GLOBALTYPES.SOCKET, payload: socket });

    return () => socket.close();
  }, [dispatch]);

  // 🔥 FETCH DATA SAU KHI LOGIN
  useEffect(() => {
    if (auth.token) {
      dispatch(getPosts(auth.token));
      dispatch(getSuggestions(auth.token));
      dispatch(getNotifies(auth.token));
    }
  }, [dispatch, auth.token]);

  // 🔥 NOTIFICATION PERMISSION
  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const isProd = !!process.env.REACT_APP_PEERJS_HOST;

    const newPeer = new Peer(undefined, {
      host: isProd
        ? process.env.REACT_APP_PEERJS_HOST
        : "localhost",

      port: isProd ? undefined : 9090,

      path: "/peerjs",

      secure: isProd,
    });

    dispatch({ type: GLOBALTYPES.PEER, payload: newPeer });

    return () => newPeer.destroy();
  }, [dispatch]);

  return (
    <Router>
      <Alert />

      <input type="checkbox" id="theme" />

      <div className={`App ${status || modal ? "mode" : ""}`}>
        <div className="main">
          {auth.token && <Header />}
          {status && <StatusModal />}
          {auth.token && <SocketClient />}
          {call && <CallModal />}

          <Routes>
            <Route path="/" element={auth.token ? <Home /> : <Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/:page"
              element={
                <PrivateRouter>
                  <PageRender />
                </PrivateRouter>
              }
            />

            <Route
              path="/:page/:id"
              element={
                <PrivateRouter>
                  <PageRender />
                </PrivateRouter>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
