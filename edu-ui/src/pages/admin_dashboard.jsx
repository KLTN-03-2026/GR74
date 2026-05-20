import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getDataAPI } from "../utils/fetchData";
import { GLOBALTYPES } from "../redux/actions/globalTypes";
import { getErrorMessage } from "../utils/errorMessage";
import AdminShell from "../components/admin/AdminShell";

const emptyDashboard = {
  totals: {},
  learning: {},
  readiness: {
    score: 0,
    items: [],
    thesisPoints: [],
  },
  payments: [],
  series: {
    users: [],
    posts: [],
    comments: [],
    messages: [],
  },
  latestUsers: [],
  latestPosts: [],
  topPosts: [],
};

const formatNumber = (value) => new Intl.NumberFormat("en-US").format(value || 0);

const formatMoney = (value, currency = "usd") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
    maximumFractionDigits: 0,
  }).format(value || 0);

const shortDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
};

const getPostImage = (post) => {
  const firstImage = post.images?.[0];
  if (post.user?.avatar) return post.user.avatar;
  if (!firstImage) return "";
  return typeof firstImage === "string" ? firstImage : firstImage.url || "";
};

const MetricCard = ({ label, value, note }) => {
  const displayValue = typeof value === "string" ? value : formatNumber(value);

  return (
    <article className="dashboard_metric">
      <span>{label}</span>
      <strong>{displayValue}</strong>
      {note && <small>{note}</small>}
    </article>
  );
};

const MiniBars = ({ title, rows }) => {
  const max = Math.max(...rows.map((item) => item.count), 1);

  return (
    <article className="dashboard_panel">
      <div className="dashboard_panel_head">
        <h2>{title}</h2>
        <span>7 ngày gần nhất</span>
      </div>
      <div className="dashboard_bars">
        {rows.map((item) => (
          <div key={item.date} className="dashboard_bar_item">
            <span>{formatNumber(item.count)}</span>
            <div>
              <i style={{ height: `${Math.max((item.count / max) * 100, 6)}%` }} />
            </div>
            <small>{new Date(item.date).toLocaleDateString(undefined, { weekday: "short" })}</small>
          </div>
        ))}
      </div>
    </article>
  );
};

const GrowthPanel = ({ rows }) => {
  const max = Math.max(...rows.map((item) => item.count), 1);

  return (
    <article className="dashboard_panel dashboard_growth_panel">
      <div className="dashboard_panel_head">
      <h2>Tăng trưởng người dùng trong 7 ngày</h2>
      <span>Thống kê quản trị realtime</span>
      </div>
      <div className="dashboard_growth_chart">
        {rows.map((item) => (
          <div key={item.date} className="dashboard_growth_bar">
            <span>{formatNumber(item.count)}</span>
            <i style={{ height: `${Math.max((item.count / max) * 100, 8)}%` }} />
            <small>{new Date(item.date).toLocaleDateString(undefined, { weekday: "short" })}</small>
          </div>
        ))}
      </div>
    </article>
  );
};

const ReadinessPanel = ({ readiness }) => (
  <article className="dashboard_panel readiness_panel">
    <div className="dashboard_panel_head">
      <h2>Mức sẵn sàng AI & bảo mật</h2>
      <span>{formatNumber(readiness.score)}% đã cấu hình</span>
    </div>
    <div className="readiness_score">
      <strong>{formatNumber(readiness.score)}%</strong>
      <div>
        <i style={{ width: `${Math.min(Math.max(readiness.score || 0, 0), 100)}%` }} />
      </div>
    </div>
    <div className="readiness_list">
      {readiness.items.map((item) => (
        <div key={item.key} className={item.status ? "is_ready" : "is_missing"}>
          <span>{item.status ? "Đã sẵn sàng" : "Còn thiếu"}</span>
          <strong>{item.label}</strong>
          <p>{item.detail}</p>
        </div>
      ))}
    </div>
  </article>
);

const ThesisPanel = ({ points }) => (
  <article className="dashboard_panel thesis_panel">
    <div className="dashboard_panel_head">
      <h2>Ý chính khi bảo vệ</h2>
      <span>Nội dung nên trình bày</span>
    </div>
    <div className="thesis_points">
      {points.map((point) => (
        <p key={point}>{point}</p>
      ))}
    </div>
  </article>
);

const AdminDashboard = () => {
  const { auth } = useSelector((state) => state);
  const dispatch = useDispatch();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);

  const canManage = auth.user?.role === "admin";

  const paymentSummary = useMemo(() => {
    if (!dashboard.payments.length) return "Chưa có doanh thu Premium";
    return dashboard.payments
      .map((payment) => `${formatMoney(payment.amount, payment.currency)} từ ${formatNumber(payment.count)} giao dịch`)
      .join(", ");
  }, [dashboard.payments]);

  const loadDashboard = async () => {
    if (!auth.token || !canManage) return;
    setLoading(true);
    try {
      const res = await getDataAPI("admin/dashboard", auth.token);
      setDashboard({
        ...emptyDashboard,
        ...res.data,
        learning: { ...emptyDashboard.learning, ...res.data.learning },
        readiness: { ...emptyDashboard.readiness, ...res.data.readiness },
        series: { ...emptyDashboard.series, ...res.data.series },
      });
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token, canManage]);

  if (!canManage) return <Navigate to="/" replace />;

  const { totals, learning, readiness } = dashboard;

  return (
    <AdminShell
      active="dashboard"
      title="Tổng quan hệ thống"
      subtitle="Theo dõi người dùng, bài viết, Premium, trạng thái AI, tin nhắn realtime và tín hiệu kiểm duyệt trong một bảng điều khiển."
      actions={
        <div className="dashboard_actions">
          <button type="button" onClick={loadDashboard} disabled={loading}>
            {loading ? "Đang làm mới..." : "Làm mới"}
          </button>
          <Link to="/admin">Quản lý người dùng</Link>
        </div>
      }
    >

      <section className="dashboard_metrics">
        <MetricCard label="Tổng người dùng" value={totals.users} note={`${formatNumber(totals.activeUsers)} đang hoạt động`} />
        <MetricCard label="Premium" value={totals.premiumUsers} note={`${formatNumber(totals.paidUsers)} đã thanh toán`} />
        <MetricCard label="Tổng bài viết" value={totals.posts} note={`${formatNumber(totals.premiumPosts)} bài Premium`} />
        <MetricCard label="Tin nhắn" value={totals.messages} note={`${formatNumber(totals.conversations)} hội thoại`} />
        <MetricCard label="Thông báo" value={totals.notifications} note={`${formatNumber(totals.unreadNotifications)} chưa đọc`} />
      </section>

      <section className="dashboard_metrics learning_metrics">
        <MetricCard label="Sẵn sàng AI" value={`${formatNumber(readiness.score)}%`} note={learning.aiConfigured ? "Đã cấu hình OpenAI" : "Thiếu khóa OpenAI"} />
        <MetricCard label="Tỷ lệ Premium" value={`${formatNumber(learning.premiumConversionRate)}%`} note="đã trả phí / tổng người dùng" />
        <MetricCard label="Bình luận AI" value={`${formatNumber(learning.aiCommentShare)}%`} note="AI / tổng bình luận" />
        <MetricCard label="Mật độ realtime" value={learning.averageMessagesPerConversation} note="tin nhắn / hội thoại" />
      </section>

      <section className="dashboard_overview_grid">
        <GrowthPanel rows={dashboard.series.users} />
        <ReadinessPanel readiness={readiness} />
      </section>

      <section className="dashboard_grid">
        <MiniBars title="Người dùng mới" rows={dashboard.series.users} />
        <MiniBars title="Bài viết mới" rows={dashboard.series.posts} />
        <MiniBars title="Bình luận mới" rows={dashboard.series.comments} />
        <MiniBars title="Tin nhắn mới" rows={dashboard.series.messages} />
      </section>

      <section className="dashboard_grid dashboard_grid_wide">
        <ThesisPanel points={readiness.thesisPoints} />
        <article className="dashboard_panel">
          <div className="dashboard_panel_head">
            <h2>Doanh thu Premium</h2>
            <span>{paymentSummary}</span>
          </div>
          <div className="dashboard_revenue">
            {dashboard.payments.length === 0 ? (
              <p>Chưa có giao dịch Premium thành công.</p>
            ) : (
              dashboard.payments.map((payment) => (
                <div key={payment.currency}>
                  <strong>{formatMoney(payment.amount, payment.currency)}</strong>
                  <span>{payment.currency?.toUpperCase() || "USD"} · {formatNumber(payment.count)} giao dịch</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="dashboard_panel">
          <div className="dashboard_panel_head">
            <h2>Bài viết nổi bật</h2>
            <span>Theo lượt thích và bình luận</span>
          </div>
          <div className="dashboard_list">
            {dashboard.topPosts.map((post) => (
              <div key={post._id} className="dashboard_post_row">
                <img src={getPostImage(post)} alt="" />
                <div>
                  <strong>{post.user?.username || "không rõ"}</strong>
                  <p>{post.content || "Bài viết media"}</p>
                  <small>{formatNumber(post.likesCount)} lượt thích · {formatNumber(post.commentsCount)} bình luận</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard_grid dashboard_grid_wide">
        <article className="dashboard_panel">
          <div className="dashboard_panel_head">
            <h2>Người dùng mới nhất</h2>
            <span>Tài khoản vừa đăng ký</span>
          </div>
          <div className="dashboard_list">
            {dashboard.latestUsers.map((user) => (
              <div key={user._id} className="dashboard_user_row">
                <img src={user.avatar} alt={user.username} />
                <div>
                  <strong>{user.username}</strong>
                  <p>{user.email}</p>
                  <small>{user.role === "admin" ? "Admin" : "Người dùng"} · {user.aiEnabled ? "Premium AI" : "Thường"} · {shortDate(user.createdAt)}</small>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard_panel">
          <div className="dashboard_panel_head">
            <h2>Bài viết mới nhất</h2>
            <span>Hoạt động gần đây</span>
          </div>
          <div className="dashboard_list">
            {dashboard.latestPosts.map((post) => (
              <div key={post._id} className="dashboard_post_row">
                <img src={getPostImage(post)} alt="" />
                <div>
                  <strong>{post.user?.username || "không rõ"}</strong>
                  <p>{post.content || "Bài viết media"}</p>
                  <small>{formatNumber(post.likes?.length)} lượt thích · {formatNumber(post.comments?.length)} bình luận · {shortDate(post.createdAt)}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AdminShell>
  );
};

export default AdminDashboard;
