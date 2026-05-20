import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { getDataAPI, patchDataAPI } from "../utils/fetchData";
import { GLOBALTYPES } from "../redux/actions/globalTypes";
import { MESS_TYPES } from "../redux/actions/messageAction";
import { getErrorMessage } from "../utils/errorMessage";
import AdminShell from "../components/admin/AdminShell";

const shortDate = (v) => v ? new Date(v).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const formatMoney = (amount, currency) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: (currency || "usd").toUpperCase(), maximumFractionDigits: 0 }).format(amount || 0);

const statusLabel = (user) => {
  if (user.aiEnabled) return { text: "Đã kích hoạt", cls: "ps_badge ps_badge_ok" };
  if (user.premiumPayment?.status === "paid") return { text: "Đã thanh toán", cls: "ps_badge ps_badge_paid" };
  if (user.premiumPayment?.status === "pending") return { text: "Chờ xác nhận", cls: "ps_badge ps_badge_pending" };
  return { text: "Không rõ", cls: "ps_badge" };
};

const AdminPremiumSupport = () => {
  const { auth } = useSelector((s) => s);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);

  const canManage = auth.user?.role === "admin";

  const load = async () => {
    if (!auth.token || !canManage) return;
    setLoading(true);
    try {
      const res = await getDataAPI("admin/premium-requests", auth.token);
      setUsers(res.data.users || []);
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [auth.token, canManage]); // eslint-disable-line

  const activate = async (user) => {
    setActivating(user._id);
    try {
      const res = await patchDataAPI(`admin/premium-activate/${user._id}`, {}, auth.token);
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    } finally {
      setActivating(null);
    }
  };

  const openChat = (user) => {
    dispatch({ type: MESS_TYPES.ADD_USER, payload: { ...user, text: "", media: [] } });
    navigate(`/message/${user._id}`);
  };

  if (!canManage) return <Navigate to="/" replace />;

  return (
    <AdminShell
      active="premium_support"
      eyebrow="Hỗ trợ Premium"
      title="Yêu cầu kích hoạt Premium"
      subtitle="Danh sách khách hàng đã thanh toán và đang chờ admin xác nhận để mở tính năng Premium AI."
      actions={
        <button type="button" onClick={load} disabled={loading} className="ps_refresh_btn">
          <span className="material-icons">refresh</span>
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      }
    >
      {users.length === 0 && !loading ? (
        <div className="ps_empty">
          <span className="material-icons">check_circle</span>
          <p>Không có yêu cầu nào đang chờ xử lý.</p>
        </div>
      ) : (
        <div className="ps_list">
          {loading && users.length === 0 && (
            <p className="ps_loading">Đang tải danh sách...</p>
          )}
          {users.map((user) => {
            const status = statusLabel(user);
            return (
              <div className="ps_row" key={user._id}>
                <div className="ps_user">
                  <img src={user.avatar} alt={user.username} />
                  <div>
                    <strong>{user.fullname || user.username}</strong>
                    <span>@{user.username}</span>
                    <small>{user.email}</small>
                  </div>
                </div>

                <div className="ps_payment">
                  <span className={status.cls}>{status.text}</span>
                  {user.premiumPayment?.amount > 0 && (
                    <span className="ps_amount">
                      {formatMoney(user.premiumPayment.amount, user.premiumPayment.currency)}
                    </span>
                  )}
                </div>

                <div className="ps_dates">
                  <span>Đăng ký: {shortDate(user.createdAt)}</span>
                  <span>Thanh toán: {shortDate(user.premiumPayment?.paidAt || user.premiumPayment?.updatedAt)}</span>
                </div>

                <div className="ps_actions">
                  <button
                    type="button"
                    className="ps_btn ps_btn_chat"
                    onClick={() => openChat(user)}
                    title="Nhắn tin với người dùng"
                  >
                    <span className="material-icons">chat</span>
                    Nhắn tin
                  </button>
                  {!user.aiEnabled && (
                    <button
                      type="button"
                      className="ps_btn ps_btn_activate"
                      onClick={() => activate(user)}
                      disabled={activating === user._id}
                      title="Kích hoạt Premium AI"
                    >
                      <span className="material-icons">workspace_premium</span>
                      {activating === user._id ? "Đang kích hoạt..." : "Kích hoạt"}
                    </button>
                  )}
                  {user.premiumPayment?.receiptUrl && (
                    <a
                      href={user.premiumPayment.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ps_btn ps_btn_receipt"
                      title="Xem biên lai Stripe"
                    >
                      <span className="material-icons">receipt_long</span>
                      Biên lai
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
};

export default AdminPremiumSupport;
