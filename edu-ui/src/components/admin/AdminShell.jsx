import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const navGroups = [
  {
    title: "Quản trị",
    items: [
      { key: "dashboard", to: "/admin_dashboard", icon: "space_dashboard", label: "Tổng quan" },
      { key: "users", to: "/admin", icon: "manage_accounts", label: "Người dùng" },
      { key: "moderation", to: "/admin_moderation", icon: "gpp_maybe", label: "Kiểm duyệt" },
    ],
  },
  {
    title: "Vận hành",
    items: [
      { key: "posts", to: "/admin_posts", icon: "article", label: "Bài viết" },
      { key: "premium", to: "/admin_premium", icon: "workspace_premium", label: "Premium" },
      { key: "ai", to: "/admin_ai", icon: "smart_toy", label: "AI học tập" },
      { key: "notifications", to: "/admin_notifications", icon: "notifications_active", label: "Thông báo" },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { key: "reports", to: "/admin_reports", icon: "monitoring", label: "Báo cáo" },
      { key: "settings", to: "/admin_settings", icon: "tune", label: "Cấu hình" },
      { key: "site", to: "/feed", icon: "home", label: "Bảng tin" },
    ],
  },
];

const AdminShell = ({
  active,
  title,
  subtitle,
  eyebrow = "Bảng điều khiển quản trị",
  actions,
  children,
}) => {
  const { auth } = useSelector((state) => state);

  return (
    <div className="admin_console admin_console_v2">
      <aside className="admin_console_sidebar">
        <div className="admin_console_brand">
          <span className="material-icons">admin_panel_settings</span>
          <div>
            <strong>Edu Social</strong>
            <small>Trung tâm quản trị</small>
          </div>
        </div>

        <nav className="admin_console_nav">
          {navGroups.map((group) => (
            <div className="admin_console_nav_group" key={group.title}>
              <small>{group.title}</small>
              {group.items.map((item) => (
                <Link key={item.key} to={item.to} className={active === item.key ? "active" : ""}>
                  <span className="material-icons">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin_console_sidebar_status">
          <span className="material-icons">verified_user</span>
          <div>
            <strong>Quyền quản trị</strong>
            <small>Quản lý người dùng, nội dung, AI và hệ thống</small>
          </div>
        </div>

        <div className="admin_console_profile">
          <img src={auth.user?.avatar} alt={auth.user?.username || "admin"} />
          <div>
            <strong>{auth.user?.fullname || auth.user?.username || "Quản trị viên"}</strong>
            <small>Quản trị viên</small>
          </div>
        </div>
      </aside>

      <main className="admin_console_main">
        <section className="admin_console_topbar">
          <div>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="admin_console_topbar_actions">{actions}</div>}
        </section>

        {children}
      </main>
    </div>
  );
};

export default AdminShell;
