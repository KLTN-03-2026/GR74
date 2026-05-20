import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AdminShell from "../components/admin/AdminShell";
import { deleteDataAPI, getDataAPI, patchDataAPI } from "../utils/fetchData";
import { GLOBALTYPES } from "../redux/actions/globalTypes";
import { getErrorMessage } from "../utils/errorMessage";

const emptyDashboard = {
  totals: {},
  learning: {},
  readiness: { score: 0, items: [], thesisPoints: [] },
  payments: [],
  series: { users: [], posts: [], comments: [], messages: [] },
  latestUsers: [],
  latestPosts: [],
  topPosts: [],
};

const formatNumber = (value) => new Intl.NumberFormat("vi-VN").format(value || 0);
const formatMoney = (value, currency = "usd") =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
    maximumFractionDigits: 0,
  }).format(value || 0);

const shortDate = (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "");

const sectionInfo = {
  posts: {
    active: "posts",
    title: "Quản lý bài viết",
    subtitle: "Theo dõi bài đăng mới, bài nổi bật và chuyển nhanh sang khu vực kiểm duyệt khi cần xử lý nội dung.",
    eyebrow: "Vận hành nội dung",
  },
  premium: {
    active: "premium",
    title: "Quản lý Premium",
    subtitle: "Theo dõi tài khoản đã bật Premium AI, tỷ lệ chuyển đổi và doanh thu thanh toán.",
    eyebrow: "Doanh thu & gói trả phí",
  },
  ai: {
    active: "ai",
    title: "Quản lý AI học tập",
    subtitle: "Kiểm tra trạng thái OpenAI, mức độ sử dụng AI và các tài khoản đã được cấp quyền.",
    eyebrow: "Trung tâm AI",
  },
  notifications: {
    active: "notifications",
    title: "Quản lý thông báo",
    subtitle: "Theo dõi thông báo hệ thống, thông báo chưa đọc và các luồng nhắc nhở gửi đến người dùng.",
    eyebrow: "Thông báo hệ thống",
  },
  reports: {
    active: "reports",
    title: "Báo cáo hệ thống",
    subtitle: "Tổng hợp số liệu người dùng, bài viết, bình luận, tin nhắn và các chỉ số vận hành chính.",
    eyebrow: "Báo cáo quản trị",
  },
  settings: {
    active: "settings",
    title: "Cấu hình hệ thống",
    subtitle: "Kiểm tra trạng thái dịch vụ, bảo mật, thanh toán, email, Redis và các thành phần tích hợp.",
    eyebrow: "Thiết lập vận hành",
  },
};

const reportReasonLabels = {
  off_topic: "Không liên quan đến học tập",
  spam: "Spam hoặc quảng cáo",
  abuse: "Nội dung xúc phạm / độc hại",
  fake: "Thông tin sai lệch",
  copyright: "Vi phạm bản quyền",
  other: "Lý do khác",
};

const AdminMetric = ({ icon, label, value, note }) => (
  <article className="admin_section_metric">
    <span className="material-icons">{icon}</span>
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
      {note && <p>{note}</p>}
    </div>
  </article>
);

const AdminList = ({ title, note, rows, renderRow }) => (
  <article className="admin_section_panel">
    <div className="admin_section_panel_head">
      <div>
        <h2>{title}</h2>
        {note && <p>{note}</p>}
      </div>
    </div>
    <div className="admin_section_list">
      {rows.length ? rows.map(renderRow) : <p className="admin_section_empty">Chưa có dữ liệu.</p>}
    </div>
  </article>
);

const ProgressRows = ({ rows = [] }) => {
  const max = Math.max(...rows.map((item) => item.count || 0), 1);
  return (
    <div className="admin_section_progress">
      {rows.map((item) => (
        <div key={item.date}>
          <span>{shortDate(item.date)}</span>
          <i><b style={{ width: `${Math.max(((item.count || 0) / max) * 100, 5)}%` }} /></i>
          <strong>{formatNumber(item.count)}</strong>
        </div>
      ))}
    </div>
  );
};

const UserRow = ({ user }) => (
  <Link to={`/profile/${user._id}`} className="admin_section_row">
    <img src={user.avatar} alt={user.username} />
    <div>
      <strong>{user.fullname || user.username}</strong>
      <span>{user.email || `@${user.username}`}</span>
    </div>
    <small>{user.aiEnabled ? "Premium AI" : user.role === "admin" ? "Admin" : "Người dùng"}</small>
  </Link>
);

const PostRow = ({ post }) => (
  <Link to={`/post/${post._id}`} className="admin_section_row">
    <span className="material-icons admin_section_row_icon">article</span>
    <div>
      <strong>{post.user?.fullname || post.user?.username || "Không rõ tác giả"}</strong>
      <span>{post.content || "Bài viết chỉ có media"}</span>
    </div>
    <small>{shortDate(post.createdAt)}</small>
  </Link>
);

const AdminSection = ({ type }) => {
  const config = sectionInfo[type] || sectionInfo.reports;
  const { auth, socket } = useSelector((state) => state);
  const dispatch = useDispatch();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [reports, setReports] = useState([]);
  const [reportStatus, setReportStatus] = useState("pending");
  const [reportsTotal, setReportsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const canManage = auth.user?.role === "admin";

  const loadDashboard = async () => {
    if (!auth.token || !canManage) return;
    setLoading(true);
    try {
      const res = await getDataAPI("admin/dashboard", auth.token);
      setDashboard({
        ...emptyDashboard,
        ...res.data,
        totals: { ...emptyDashboard.totals, ...res.data.totals },
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

  const loadReports = async (status = reportStatus) => {
    if (!auth.token || !canManage || type !== "reports") return;
    try {
      const res = await getDataAPI(`admin/reports?status=${status}&limit=30`, auth.token);
      setReports(res.data.reports || []);
      setReportsTotal(res.data.total || 0);
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token, canManage, type]);

  useEffect(() => {
    loadReports(reportStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token, canManage, type, reportStatus]);

  const premiumRevenue = useMemo(
    () => dashboard.payments.reduce((sum, item) => sum + (item.amount || 0), 0),
    [dashboard.payments],
  );

  if (!canManage) return <Navigate to="/" replace />;

  const { totals, learning, readiness } = dashboard;

  const commonActions = (
    <div className="dashboard_actions">
      <button type="button" onClick={loadDashboard} disabled={loading}>
        {loading ? "Đang tải..." : "Làm mới"}
      </button>
      <Link to="/admin_dashboard">Tổng quan</Link>
    </div>
  );

  const updateReportStatus = async (id, status) => {
    try {
      const res = await patchDataAPI(`admin/reports/${id}`, { status }, auth.token);
      setReports((current) => current.map((item) => (item._id === id ? { ...item, status: res.data.report.status } : item)));
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    }
  };

  const deleteReportedPost = async (report) => {
    if (!report.post?._id) return;
    try {
      const res = await deleteDataAPI(`admin/posts/${report.post._id}`, auth.token);
      if (socket && socket.emit && res.data.notify) socket.emit("createNotify", res.data.notify);
      setReports((current) => current.map((item) => (
        item._id === report._id ? { ...item, status: "removed" } : item
      )));
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    }
  };

  return (
    <AdminShell active={config.active} title={config.title} subtitle={config.subtitle} eyebrow={config.eyebrow} actions={commonActions}>
      {type === "posts" && (
        <>
          <section className="admin_section_metrics">
            <AdminMetric icon="article" label="Tổng bài viết" value={formatNumber(totals.posts)} note={`${formatNumber(totals.premiumPosts)} bài Premium`} />
            <AdminMetric icon="comment" label="Bình luận" value={formatNumber(totals.comments)} note={`${formatNumber(learning.averageCommentsPerPost)} bình luận / bài`} />
            <AdminMetric icon="military_tech" label="Bài nổi bật" value={formatNumber(dashboard.topPosts.length)} note="theo tương tác" />
            <AdminMetric icon="gpp_maybe" label="Kiểm duyệt" value="Sẵn sàng" note="xóa bài và gửi thông báo" />
          </section>
          <section className="admin_section_grid">
            <AdminList title="Bài viết mới nhất" note="Nội dung vừa đăng lên hệ thống" rows={dashboard.latestPosts} renderRow={(post) => <PostRow key={post._id} post={post} />} />
            <AdminList title="Bài viết nổi bật" note="Sắp theo lượt thích và bình luận" rows={dashboard.topPosts} renderRow={(post) => <PostRow key={post._id} post={post} />} />
          </section>
          <Link className="admin_section_primary" to="/admin_moderation">Mở màn kiểm duyệt bài viết</Link>
        </>
      )}

      {type === "premium" && (
        <>
          <section className="admin_section_metrics">
            <AdminMetric icon="workspace_premium" label="Tài khoản Premium" value={formatNumber(totals.premiumUsers)} note={`${formatNumber(totals.paidUsers)} đã thanh toán`} />
            <AdminMetric icon="payments" label="Doanh thu" value={formatMoney(premiumRevenue, dashboard.payments[0]?.currency || "usd")} note="tổng giao dịch thành công" />
            <AdminMetric icon="trending_up" label="Tỷ lệ chuyển đổi" value={`${formatNumber(learning.premiumConversionRate)}%`} note="đã trả phí / tổng người dùng" />
            <AdminMetric icon="smart_toy" label="AI Premium" value={`${formatNumber(learning.aiAdoptionRate)}%`} note="tỷ lệ bật AI học tập" />
          </section>
          <section className="admin_section_grid">
            <AdminList title="Giao dịch Premium" note="Tổng hợp theo tiền tệ" rows={dashboard.payments} renderRow={(payment) => (
              <div key={payment.currency} className="admin_section_row">
                <span className="material-icons admin_section_row_icon">receipt_long</span>
                <div><strong>{formatMoney(payment.amount, payment.currency)}</strong><span>{payment.count} giao dịch</span></div>
                <small>{payment.currency?.toUpperCase()}</small>
              </div>
            )} />
            <AdminList title="Người dùng mới" note="Kiểm tra tài khoản có thể nâng cấp" rows={dashboard.latestUsers} renderRow={(user) => <UserRow key={user._id} user={user} />} />
          </section>
        </>
      )}

      {type === "ai" && (
        <>
          <section className="admin_section_metrics">
            <AdminMetric icon="smart_toy" label="Trợ lý AI (OpenAI)" value={learning.aiConfigured ? "Đã bật" : "Chưa bật"} note={`${formatNumber(readiness.score)}% cấu hình sẵn sàng`} />
            <AdminMetric icon="psychology" label="Người dùng AI" value={formatNumber(totals.premiumUsers)} note="đã được cấp quyền AI" />
            <AdminMetric icon="forum" label="Bình luận AI" value={formatNumber(totals.aiComments)} note={`${formatNumber(learning.aiCommentShare)}% tổng bình luận`} />
            <AdminMetric icon="speed" label="Mức dùng AI" value={`${formatNumber(learning.aiAdoptionRate)}%`} note="AI / tổng người dùng" />
          </section>
          <section className="admin_section_grid">
            <AdminList title="Tài khoản mới" note="Theo dõi quyền AI từng người dùng" rows={dashboard.latestUsers} renderRow={(user) => <UserRow key={user._id} user={user} />} />
            <AdminList title="Kiểm tra cấu hình AI" note="Các dịch vụ cần sẵn sàng" rows={readiness.items.filter((item) => item.key === "openai" || item.key === "jwt" || item.key === "database")} renderRow={(item) => (
              <div key={item.key} className="admin_section_row admin_section_row_wrap">
                <span className={`material-icons admin_section_row_icon ${item.status ? "is_ok" : "is_bad"}`}>{item.status ? "check_circle" : "error"}</span>
                <div><strong>{item.label}</strong><span className="admin_row_detail">{item.detail}</span></div>
                <small>{item.status ? "OK" : "Thiếu"}</small>
              </div>
            )} />
          </section>
        </>
      )}

      {type === "notifications" && (
        <>
          <section className="admin_section_metrics">
            <AdminMetric icon="notifications" label="Tổng thông báo" value={formatNumber(totals.notifications)} note="toàn hệ thống" />
            <AdminMetric icon="markunread" label="Chưa đọc" value={formatNumber(totals.unreadNotifications)} note={`${totals.notifications ? Math.round((totals.unreadNotifications / totals.notifications) * 100) : 0}% chưa được xem`} />
            <AdminMetric icon="mark_email_read" label="Đã đọc" value={formatNumber((totals.notifications || 0) - (totals.unreadNotifications || 0))} note="người dùng đã xem" />
            <AdminMetric icon="campaign" label="Kênh realtime" value="Socket.io" note="đẩy trực tiếp khi người dùng online" />
          </section>
          <section className="admin_section_grid">
            <article className="admin_section_panel">
              <div className="admin_section_panel_head"><div><h2>Loại thông báo trong hệ thống</h2><p>Các sự kiện tự động phát sinh thông báo</p></div></div>
              <div className="admin_section_steps">
                <p><span>1</span><b><strong>Tương tác xã hội</strong> — Like, bình luận, theo dõi, kết bạn.</b></p>
                <p><span>2</span><b><strong>Kiểm duyệt</strong> — Admin xóa bài: tự động thông báo chủ bài.</b></p>
                <p><span>3</span><b><strong>Tin nhắn</strong> — Nhắn tin trực tiếp và hội thoại nhóm.</b></p>
                <p><span>4</span><b><strong>Premium / AI</strong> — Kích hoạt quyền, trạng thái tài khoản.</b></p>
              </div>
            </article>
            <article className="admin_section_panel">
              <div className="admin_section_panel_head"><div><h2>Tình trạng thông báo</h2><p>Thống kê đọc / chưa đọc toàn hệ thống</p></div></div>
              <div className="admin_notif_stats">
                {[
                  { icon: "check_circle", color: "#22c55e", label: "Đã đọc", value: formatNumber((totals.notifications || 0) - (totals.unreadNotifications || 0)), unit: "thông báo" },
                  { icon: "pending", color: "#f59e0b", label: "Chưa đọc", value: formatNumber(totals.unreadNotifications), unit: "thông báo" },
                  { icon: "notifications", color: "#2563eb", label: "Tổng thông báo", value: formatNumber(totals.notifications), unit: "thông báo" },
                  { icon: "forum", color: "#6366f1", label: "Hội thoại", value: formatNumber(totals.conversations), unit: `${formatNumber(totals.messages)} tin nhắn` },
                ].map((row) => (
                  <div key={row.label} className="admin_notif_stat_row">
                    <i className="material-icons" style={{ color: row.color }}>{row.icon}</i>
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                    <small>{row.unit}</small>
                  </div>
                ))}
              </div>
            </article>
          </section>
          <AdminList title="Bài viết mới nhất" note="Nguồn phát sinh thông báo tương tác gần đây" rows={dashboard.latestPosts} renderRow={(post) => <PostRow key={post._id} post={post} />} />
        </>
      )}

      {type === "reports" && (
        <>
          <section className="admin_section_metrics">
            <AdminMetric icon="groups" label="Người dùng" value={formatNumber(totals.users)} note={`${formatNumber(totals.activeUsers)} đang hoạt động`} />
            <AdminMetric icon="article" label="Bài viết" value={formatNumber(totals.posts)} note={`${formatNumber(totals.premiumPosts)} Premium`} />
            <AdminMetric icon="flag" label="Báo cáo bài viết" value={formatNumber(reportsTotal)} note={reportStatus === "pending" ? "đang chờ xử lý" : "theo bộ lọc hiện tại"} />
            <AdminMetric icon="forum" label="Bình luận" value={formatNumber(totals.comments)} note={`${formatNumber(totals.aiComments)} từ AI`} />
          </section>
          <section className="admin_section_panel admin_reports_panel">
            <div className="admin_section_panel_head">
              <div>
                <h2>Báo cáo bài viết từ người dùng</h2>
                <p>Admin xem lý do báo cáo, mở bài để kiểm tra và xóa nếu nội dung không phù hợp.</p>
              </div>
              <select value={reportStatus} onChange={(e) => setReportStatus(e.target.value)}>
                <option value="pending">Chờ xử lý</option>
                <option value="reviewed">Đã xem</option>
                <option value="dismissed">Bỏ qua</option>
                <option value="removed">Đã xóa bài</option>
                <option value="all">Tất cả</option>
              </select>
            </div>
            <div className="admin_report_list">
              {reports.map((report) => (
                <article key={report._id} className="admin_report_card">
                  <div className="admin_report_top">
                    <div>
                      <strong>{reportReasonLabels[report.reason] || "Lý do khác"}</strong>
                      <span>Báo cáo bởi {report.reporter?.fullname || report.reporter?.username || "người dùng"} · {shortDate(report.createdAt)}</span>
                    </div>
                    <small className={`admin_report_status is_${report.status}`}>{report.status}</small>
                  </div>
                  <p>{report.detail || "Người dùng không nhập mô tả thêm."}</p>
                  <div className="admin_report_post">
                    <span className="material-icons">article</span>
                    <div>
                      <strong>{report.post?.user?.fullname || report.owner?.fullname || report.owner?.username || "Không rõ chủ bài"}</strong>
                      <p>{report.post?.content || "Bài viết đã bị xóa hoặc chỉ có media."}</p>
                    </div>
                  </div>
                  <div className="admin_report_actions">
                    {report.post?._id && <Link to={`/post/${report.post._id}`}>Mở bài viết</Link>}
                    <button type="button" onClick={() => updateReportStatus(report._id, "reviewed")}>Đánh dấu đã xem</button>
                    <button type="button" onClick={() => updateReportStatus(report._id, "dismissed")}>Bỏ qua</button>
                    {report.post?._id && (
                      <button type="button" className="is_danger" onClick={() => deleteReportedPost(report)}>
                        Xóa bài không phù hợp
                      </button>
                    )}
                  </div>
                </article>
              ))}
              {reports.length === 0 && <p className="admin_section_empty">Chưa có báo cáo nào trong bộ lọc này.</p>}
            </div>
          </section>
          <section className="admin_section_grid">
            <article className="admin_section_panel"><div className="admin_section_panel_head"><div><h2>Người dùng 7 ngày</h2><p>Tài khoản mới theo ngày</p></div></div><ProgressRows rows={dashboard.series.users} /></article>
            <article className="admin_section_panel"><div className="admin_section_panel_head"><div><h2>Bài viết 7 ngày</h2><p>Nội dung mới theo ngày</p></div></div><ProgressRows rows={dashboard.series.posts} /></article>
            <article className="admin_section_panel"><div className="admin_section_panel_head"><div><h2>Bình luận 7 ngày</h2><p>Tương tác học tập</p></div></div><ProgressRows rows={dashboard.series.comments} /></article>
            <article className="admin_section_panel"><div className="admin_section_panel_head"><div><h2>Tin nhắn 7 ngày</h2><p>Hoạt động realtime</p></div></div><ProgressRows rows={dashboard.series.messages} /></article>
          </section>
        </>
      )}

      {type === "settings" && (
        <>
          <section className="admin_section_metrics">
            <AdminMetric icon="health_and_safety" label="Sẵn sàng hệ thống" value={`${formatNumber(readiness.score)}%`} note="dịch vụ đã cấu hình" />
            <AdminMetric icon="database" label="MongoDB" value={readiness.items.find((item) => item.key === "database")?.status ? "OK" : "Thiếu"} note="kết nối dữ liệu chính" />
            <AdminMetric icon="memory" label="Redis" value={readiness.items.find((item) => item.key === "redis")?.status ? "OK" : "Thiếu"} note="cache/socket scaling" />
            <AdminMetric icon="mail" label="Email" value={readiness.items.find((item) => item.key === "mail")?.status ? "OK" : "Thiếu"} note="quên mật khẩu, hóa đơn" />
          </section>
          <section className="admin_section_grid">
            <AdminList title="Trạng thái cấu hình" note="Các thành phần vận hành chính" rows={readiness.items} renderRow={(item) => (
              <div key={item.key} className="admin_section_row admin_section_row_wrap">
                <span className={`material-icons admin_section_row_icon ${item.status ? "is_ok" : "is_bad"}`}>{item.status ? "check_circle" : "error"}</span>
                <div><strong>{item.label}</strong><span className="admin_row_detail">{item.detail}</span></div>
                <small>{item.status ? "Sẵn sàng" : "Cần sửa"}</small>
              </div>
            )} />
            <article className="admin_section_panel">
              <div className="admin_section_panel_head"><div><h2>Việc admin có thể làm</h2><p>Điểm kiểm tra trước khi vận hành</p></div></div>
              <div className="admin_section_steps">
                <p><span>1</span><b>Kiểm tra biến môi trường và bảo mật token.</b></p>
                <p><span>2</span><b>Kiểm tra thanh toán Premium và quyền AI.</b></p>
                <p><span>3</span><b>Theo dõi Redis, MongoDB, email và socket realtime.</b></p>
              </div>
            </article>
          </section>
        </>
      )}
    </AdminShell>
  );
};

export default AdminSection;
