/** @format */

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import PageRender from "./customRouter/PageRender";
import PrivateRouter from "./customRouter/PrivateRouter";
import UserShell from "./components/home/UserShell";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgot_password";
import ResetPassword from "./pages/reset_password";
import Premium from "./pages/premium";
import PremiumSuccess from "./pages/premium_success";
import Landing from "./pages/landing";
import Admin from "./pages/admin";
import AdminDashboard from "./pages/admin_dashboard";
import AdminModeration from "./pages/admin_moderation";
import AdminSection from "./pages/admin_section";
import AdminPremiumSupport from "./pages/admin_premium_support";

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
import MessageToast from "./components/alert/MessageToast";
import Peer from "peerjs";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const HeaderGate = ({ auth }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (!auth.token || isAdminRoute) return null;
  return <Header />;
};

function App() {
  const { auth, status, modal, call } = useSelector((state) => state);
  const dispatch = useDispatch();
  const firstLogin = localStorage.getItem("firstLogin");

  // 🔥 INIT SOCKET
  useEffect(() => {
    dispatch(refreshToken());
  }, [dispatch]);

  // Connect Socket.io only after auth is ready.
  useEffect(() => {
    if (!auth.token) {
      dispatch({ type: GLOBALTYPES.SOCKET, payload: null });
      return;
    }

    const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:9090", {
      autoConnect: false,
      transports: ["polling", "websocket"],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      timeout: 10000,
    });

    dispatch({ type: GLOBALTYPES.SOCKET, payload: socket });

    const connectTimer = setTimeout(() => {
      if (!socket.connected) socket.connect();
    }, 0);

    socket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });

    return () => {
      clearTimeout(connectTimer);
      socket.removeAllListeners();
      if (socket.connected) socket.disconnect();
    };
  }, [dispatch, auth.token]);

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
    const peerHost = process.env.REACT_APP_PEERJS_HOST || window.location.hostname;
    const isLocalPeer = peerHost === "localhost" || peerHost === "127.0.0.1";

    const newPeer = new Peer(undefined, {
      host: peerHost,

      port: isLocalPeer ? 9090 : 443,

      path: "/peerjs",

      secure: !isLocalPeer,
    });

    dispatch({ type: GLOBALTYPES.PEER, payload: newPeer });

    return () => newPeer.destroy();
  }, [dispatch]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Alert />

      <input type="checkbox" id="theme" />

      <div className={`App ${status || modal ? "mode" : ""}`}>
        <div className="main">
          <HeaderGate auth={auth} />
          {status && <StatusModal />}
          {auth.token && <SocketClient />}
          {call && <CallModal />}
          {auth.token && <MessageToast />}

          <Routes>
            <Route element={<UserShell />}>
              <Route
                path="/"
                element={
                  auth.token
                    ? auth.user?.role === "admin"
                      ? <Navigate to="/admin" replace />
                      : <Home />
                    : <Login />
                }
              />
              <Route
                path="/feed"
                element={
                  auth.token
                    ? auth.user?.role === "admin"
                      ? <Navigate to="/admin" replace />
                      : <Home />
                    : <Login />
                }
              />
            </Route>
            <Route
              path="/admin"
              element={
                <PrivateRouter>
                  <Admin />
                </PrivateRouter>
              }
            />
            <Route
              path="/admin_dashboard"
              element={
                <PrivateRouter>
                  <AdminDashboard />
                </PrivateRouter>
              }
            />
            <Route
              path="/admin_moderation"
              element={
                <PrivateRouter>
                  <AdminModeration />
                </PrivateRouter>
              }
            />
            <Route path="/admin_posts" element={<PrivateRouter><AdminSection type="posts" /></PrivateRouter>} />
            <Route path="/admin_premium" element={<PrivateRouter><AdminSection type="premium" /></PrivateRouter>} />
            <Route path="/admin_ai" element={<PrivateRouter><AdminSection type="ai" /></PrivateRouter>} />
            <Route path="/admin_notifications" element={<PrivateRouter><AdminSection type="notifications" /></PrivateRouter>} />
            <Route path="/admin_reports" element={<PrivateRouter><AdminSection type="reports" /></PrivateRouter>} />
            <Route path="/admin_settings" element={<PrivateRouter><AdminSection type="settings" /></PrivateRouter>} />
            <Route path="/admin_premium_support" element={<PrivateRouter><AdminPremiumSupport /></PrivateRouter>} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot_password" element={<ForgotPassword />} />
            <Route path="/reset_password/:token" element={<ResetPassword />} />
            <Route path="/premium" element={auth.token ? <Premium /> : <Login />} />
            <Route path="/premium/success" element={auth.token || firstLogin ? <PremiumSuccess /> : <Login />} />

            <Route element={<UserShell />}>
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
            </Route>
          </Routes>
        </div>
      </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
